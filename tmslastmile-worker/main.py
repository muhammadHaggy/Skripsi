import json
import os
import logging
import asyncio
import sys
from datetime import datetime
import re
import random
import requests
import subprocess
from dotenv import load_dotenv
from aio_pika import connect_robust, Message, ExchangeType
from aio_pika.abc import AbstractIncomingMessage
from utils.file_utils import download_file
from pathlib import Path

load_dotenv()

RABBITMQ_URL = os.getenv("RABBITMQ_URL")
EXCHANGE = os.getenv("EXCHANGE")
ROUTING_KEY = os.getenv("ROUTING_KEY")
AUDIT_KEY = os.getenv("AUDIT_KEY")
BACKEND_API = os.getenv("BACKEND_API")
RABBITMQ_API_KEY = os.getenv("RABBITMQ_API_KEY")
QUEUE = os.getenv("QUEUE")
ML_ROOT = os.getenv("ML_ROOT")
PYTHON_PATH_ENV = os.getenv("PYTHON_PATH")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def connect_to_rabbitmq():
    connection = await connect_robust(RABBITMQ_URL)
    channel = await connection.channel()
    return connection, channel

def send_to_backend(box_id, length, width, height, volume):
    result = {
        'boxID': box_id,
        'length': length,
        'width': width,
        'height': height,
        'volume': volume
    }

    headers = {
        "Content-Type": "application/json",
        "x-api-key": RABBITMQ_API_KEY
    }

    try:
        logger.info(f"Sending POST to backend API: {BACKEND_API}")
        response = requests.post(BACKEND_API, json=result, headers=headers)

        if response.status_code == 200:
            logger.info(f"Successfully sent box dimensions for boxID {box_id}")
        else:
            logger.error(f"Failed to send data to backend")

    except Exception as e:
        logger.error(f"Error sending POST to backend: {e}")

async def run_ml_scripts(box_id, dgx_id, file_path):
    try:
        logger.info("MOCK: Skipping ML pipeline and generating random dimensions.")

        length = round(random.uniform(5.0, 120.0), 2)
        width = round(random.uniform(5.0, 120.0), 2)
        height = round(random.uniform(5.0, 120.0), 2)
        volume = round(length * width * height, 2)

        logger.info(f"Mocked Dimensions: {length}cm × {width}cm × {height}cm")
        logger.info(f"Mocked Volume: {volume} cm³")

        return (length, width, height, volume)
    except Exception as e:
        logger.error(f"Error during mock ML execution: {e}")
        return False

async def on_message_callback(message: AbstractIncomingMessage, channel):
    try:
        payload = json.loads(message.body.decode())
        logger.info(f"Received message: {payload}")

        box_id = payload['box_id']
        dgx_id = payload['dgx_id']
        pc_url = payload['pcUrl']

        file_path = download_file(pc_url, box_id, dgx_id)
        if not file_path:
            logger.error(f"Failed to download file for box ID {box_id}. Skipping this message.")
            await message.ack()
            return
        
        logger.info(f"Processing box ID: {box_id}, pcUrl: {pc_url}, dgx_id: {dgx_id}")
        
        ml_result = await run_ml_scripts(box_id, dgx_id, file_path)

        audit_payload = {
            "box_id": box_id,
            "dgx_id": dgx_id,
            "action": "processed",
            "timestamp": datetime.now().isoformat()
        }

        error_response = {
            "status": "error",
            "message": "ML script execution failed",
            "details": f"ML processing failed for box ID: {box_id}, dgx_id: {dgx_id}"
        }

        if ml_result:
            length, width, height, volume = ml_result
            logger.info(f"ML scripts executed successfully for box ID: {box_id}, dgx_id: {dgx_id}")

            if message.reply_to:
                await channel.default_exchange.publish(
                    Message(
                        body=json.dumps(audit_payload).encode(),
                        content_type="application/json",
                        correlation_id=message.correlation_id,
                    ),
                    routing_key=message.reply_to,
                )
                logger.info(f"Audit message sent for box ID: {box_id}, dgx_id: {dgx_id} to reply_to")

            send_to_backend(box_id, length, width, height, volume)

            await message.ack()
            logger.info(f"Message acknowledged for box ID: {box_id}, dgx_id: {dgx_id}")

        else:
            logger.error(f"Error during ML script execution for box ID: {box_id}, dgx_id: {dgx_id}")

            if message.reply_to:
                await channel.default_exchange.publish(
                    Message(
                        body=json.dumps(error_response).encode(),
                        content_type="application/json",
                        correlation_id=message.correlation_id,
                    ),
                    routing_key=message.reply_to,
                )
                logger.error(f"Error response sent for box ID: {box_id}, dgx_id: {dgx_id} to reply_to")

            await message.nack(requeue=False)
            logger.error(f"Message nacked for box ID: {box_id}, dgx_id: {dgx_id}")

    except Exception as e:
        logger.error(f"Error processing message: {e}")
        await message.nack(requeue=False)

async def main():
    connection, channel = await connect_to_rabbitmq()

    try:
        await channel.set_qos(prefetch_count=1)
        exchange = await channel.declare_exchange(EXCHANGE, ExchangeType.DIRECT, durable=True)
        queue = await channel.declare_queue(QUEUE, durable=True)
        await queue.bind(exchange, ROUTING_KEY)

        logger.info(f"Waiting for messages in {QUEUE}. To exit press CTRL+C")

        await queue.consume(lambda message: asyncio.create_task(on_message_callback(message, channel)))

        while True:
            await asyncio.sleep(1)

    except Exception as e:
        logger.error(f"Error in RabbitMQ processing: {e}")
        
    finally:
        await connection.close()
        logger.info("RabbitMQ connection closed.")


if __name__ == "__main__":
    asyncio.run(main())