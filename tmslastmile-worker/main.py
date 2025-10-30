import json
import os
import logging
import asyncio
import sys
from datetime import datetime
import re
import requests
import subprocess
from dotenv import load_dotenv
from aio_pika import connect_robust, Message, ExchangeType
from aio_pika.abc import AbstractIncomingMessage
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
ML_API_URL = os.getenv("ML_API_URL", "http://ml_service:5001/infer")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def connect_to_rabbitmq():
    backoff_seconds = 1
    max_backoff_seconds = 30
    while True:
        try:
            logger.info(f"Connecting to RabbitMQ at {RABBITMQ_URL}")
            connection = await connect_robust(RABBITMQ_URL)
            channel = await connection.channel()
            logger.info("Connected to RabbitMQ and opened channel")
            return connection, channel
        except Exception as e:
            logger.error(f"RabbitMQ connection failed: {e}. Retrying in {backoff_seconds}s")
            await asyncio.sleep(backoff_seconds)
            backoff_seconds = min(max_backoff_seconds, backoff_seconds * 2)

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

def call_ml_service(box_id, dgx_id, pc_url):
    try:
        payload = {
            "box_id": str(box_id),
            "dgx_id": str(dgx_id),
            "pcUrl": pc_url,
        }
        logger.info(f"Calling ML service at {ML_API_URL} for box_id={box_id}, dgx_id={dgx_id}")
        response = requests.post(ML_API_URL, json=payload, timeout=600)
        if response.status_code != 200:
            logger.error(f"ML service returned {response.status_code}: {response.text}")
            return None
        data = response.json()
        if isinstance(data, dict) and data.get("status") == "error":
            logger.error(f"ML service error: {data.get('message')}")
            return None
        length = float(data["length"])  # cm
        width = float(data["width"])    # cm
        height = float(data["height"])  # cm
        volume = float(data["volume"])  # cm^3
        return (length, width, height, volume)
    except Exception as e:
        logger.error(f"Exception calling ML service: {e}")
        return None

async def run_ml_scripts(box_id, dgx_id, file_path):
    if ML_ROOT:
        POINTCEPT_DIR = Path(ML_ROOT)
    else:
        # Fallback to two levels up from this file
        POINTCEPT_DIR = Path(__file__).resolve().parents[2]
    logger.info(f"ML scripts will be run from: {POINTCEPT_DIR}")
    try:
        PYTHON_PATH = PYTHON_PATH_ENV or sys.executable

        commands = [
            f"{PYTHON_PATH} ply_to_txt.py -n box-{box_id}-{dgx_id}-txt -r {file_path}",
            f"{PYTHON_PATH} add_color.py -n box-{box_id}-{dgx_id}-color -r data/box-{box_id}-{dgx_id}-txt/box-{box_id}-{dgx_id}-txt/box-{box_id}-{dgx_id}-txt/Annotations/box-{box_id}-{dgx_id}-txt.txt",
            f"{PYTHON_PATH} preprocess.py --dataset_root data/box-{box_id}-{dgx_id}-txt --output_root data/custom_box/output-preprocess/box-{box_id}-{dgx_id}",
            f"sh scripts/pred.sh -g 1 -p {PYTHON_PATH} -d custom_box -n semseg_pt_v3m1_s3dis_2_custom_box_f -w model_best -s output-preprocess/box-{box_id}-{dgx_id}/box-{box_id}-{dgx_id}-txt",
            f"{PYTHON_PATH} volume-est.py {file_path} exp/custom_box/semseg_pt_v3m1_s3dis_2_custom_box_f/result/box-{box_id}-{dgx_id}-txt.npy"
        ]
        
        for command in commands:
            
            logger.info(f"Running command: {command}") 

            result = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: subprocess.run(
                    command,
                    shell=True,
                    cwd=POINTCEPT_DIR,
                    capture_output=True,
                    text=True
                )
            )

            if result.returncode != 0:
                logger.error(f"Error during {command} execution: {result.stderr}")
                return False

        volume_output = result.stdout
        logger.info(f"Volume-est output: {volume_output}")
        
        dimension_match = re.search(r"Dimensions \(L×W×H\): (\d+(?:\.\d+)?) cm × (\d+(?:\.\d+)?) cm × (\d+(?:\.\d+)?) cm", volume_output)
        volume_match = re.search(r"Volume: (\d+(?:\.\d+)?) cm³", volume_output)

        if dimension_match and volume_match:
            length = float(dimension_match.group(1))
            width = float(dimension_match.group(2))
            height = float(dimension_match.group(3))
            volume = float(volume_match.group(1))

            logger.info(f"Extracted Dimensions: {length}cm × {width}cm × {height}cm")
            logger.info(f"Extracted Volume: {volume} cm³")

            return (length, width, height, volume)
        else:
            logger.error("Failed to extract dimensions and volume from the output.")
            return False

    except Exception as e:
        logger.error(f"Error during ML script execution: {e}")
        return False

async def on_message_callback(message: AbstractIncomingMessage, channel):
    try:
        payload = json.loads(message.body.decode())
        logger.info(f"Received message: {payload}")

        box_id = payload['box_id']
        dgx_id = payload['dgx_id']
        pc_url = payload['pcUrl']

        logger.info(f"Processing box ID: {box_id}, pcUrl: {pc_url}, dgx_id: {dgx_id}")

        # Call external ML service instead of running local scripts
        ml_result = call_ml_service(box_id, dgx_id, pc_url)

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