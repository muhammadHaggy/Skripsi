import os
import time
from typing import Any, Dict, List, Tuple

import orjson
import pika
from pika.adapters.blocking_connection import BlockingChannel
from pika.spec import Basic, BasicProperties
from psycopg import connect
from psycopg.extras import execute_values


RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/")
EXCHANGE = os.getenv("EXCHANGE", "amq.topic")
QUEUE_NAME = os.getenv("QUEUE_NAME", "telemetry.insert")
BINDING_KEY = os.getenv("BINDING_KEY", "sensors.#")
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/paragon")
BATCH_SIZE = int(os.getenv("BATCH_SIZE", "500"))
FLUSH_SECONDS = int(os.getenv("FLUSH_SECONDS", "10"))


class BatchBuffer:
    def __init__(self, batch_size: int) -> None:
        self.batch_size = batch_size
        self.metrics_rows: List[Tuple[str, str, str, float, Any]] = []
        self.gps_rows: List[Tuple[str, str, float, float, Any, Any, Any]] = []
        self.delivery_tags: List[int] = []
        self.last_flush_time = time.time()

    def add_metric(self, row: Tuple[str, str, str, float, Any], delivery_tag: int) -> None:
        self.metrics_rows.append(row)
        self.delivery_tags.append(delivery_tag)

    def add_gps(self, row: Tuple[str, str, float, float, Any, Any, Any], delivery_tag: int) -> None:
        self.gps_rows.append(row)
        self.delivery_tags.append(delivery_tag)

    def should_flush(self) -> bool:
        if len(self.metrics_rows) + len(self.gps_rows) >= self.batch_size:
            return True
        if time.time() - self.last_flush_time >= FLUSH_SECONDS:
            return True
        return False

    def mark_flushed(self) -> None:
        self.metrics_rows.clear()
        self.gps_rows.clear()
        self.delivery_tags.clear()
        self.last_flush_time = time.time()


def get_db_connection():
    return connect(DATABASE_URL)


def flush_batches(cur, buffer: BatchBuffer) -> None:
    if not buffer.metrics_rows and not buffer.gps_rows:
        buffer.last_flush_time = time.time()
        return

    # GPS upserts (executemany)
    if buffer.gps_rows:
        gps_sql = (
            """
            INSERT INTO telemetry.gps_positions (device_id, ts, position, speed_mps, heading_deg, extra)
            VALUES (%s, %s, ST_SetSRID(ST_MakePoint(%s, %s),4326)::geography, %s, %s, %s)
            ON CONFLICT (device_id, ts)
            DO UPDATE SET speed_mps=EXCLUDED.speed_mps, heading_deg=EXCLUDED.heading_deg, extra=EXCLUDED.extra
            """
        )
        cur.executemany(gps_sql, buffer.gps_rows)

    # Metrics upserts (execute_values for batch)
    if buffer.metrics_rows:
        metrics_sql = (
            """
            INSERT INTO telemetry.readings (device_id, ts, metric, value, tags)
            VALUES %s
            ON CONFLICT (device_id, ts, metric)
            DO UPDATE SET value=EXCLUDED.value, tags=EXCLUDED.tags
            """
        )
        execute_values(cur, metrics_sql, buffer.metrics_rows)

    buffer.mark_flushed()


def main() -> None:
    params = pika.URLParameters(RABBITMQ_URL)
    connection = pika.BlockingConnection(params)
    channel: BlockingChannel = connection.channel()

    # amq.topic exists; declaring with same attributes is idempotent
    channel.exchange_declare(exchange=EXCHANGE, exchange_type="topic", durable=True)
    channel.queue_declare(queue=QUEUE_NAME, durable=True)
    channel.queue_bind(queue=QUEUE_NAME, exchange=EXCHANGE, routing_key=BINDING_KEY)
    channel.basic_qos(prefetch_count=1000)

    db = get_db_connection()
    db.autocommit = False
    cur = db.cursor()

    buffer = BatchBuffer(batch_size=BATCH_SIZE)

    def on_message(ch: BlockingChannel, method: Basic.Deliver, properties: BasicProperties, body: bytes) -> None:
        nonlocal cur, db, buffer
        try:
            payload = orjson.loads(body)
        except Exception:
            # Drop malformed
            ch.basic_ack(delivery_tag=method.delivery_tag)
            return

        # Route by payload fields primarily
        if isinstance(payload, dict) and "lat" in payload and "lon" in payload:
            device_id = str(payload.get("device_id"))
            ts = str(payload.get("ts"))
            lat = float(payload.get("lat"))
            lon = float(payload.get("lon"))
            speed = payload.get("speed_mps")
            heading = payload.get("heading_deg")
            extra = payload.get("extra")
            buffer.add_gps((device_id, ts, lon, lat, speed, heading, extra), method.delivery_tag)
        else:
            # generic metric
            device_id = str(payload.get("device_id"))
            ts = str(payload.get("ts"))
            metric = str(payload.get("metric"))
            value = payload.get("value")
            tags = payload.get("tags")
            buffer.add_metric((device_id, ts, metric, value, tags), method.delivery_tag)

        if buffer.should_flush():
            try:
                flush_batches(cur, buffer)
                db.commit()
                # Ack all collected delivery tags on success
                for tag in list(buffer.delivery_tags):
                    ch.basic_ack(delivery_tag=tag)
                buffer.mark_flushed()
            except Exception:
                db.rollback()
                # Requeue all pending messages
                for tag in list(buffer.delivery_tags):
                    ch.basic_nack(delivery_tag=tag, requeue=True)
                buffer.mark_flushed()

    channel.basic_consume(queue=QUEUE_NAME, on_message_callback=on_message, auto_ack=False)

    try:
        channel.start_consuming()
    finally:
        try:
            # Final flush on shutdown
            if buffer.metrics_rows or buffer.gps_rows:
                try:
                    flush_batches(cur, buffer)
                    db.commit()
                except Exception:
                    db.rollback()
        finally:
            cur.close()
            db.close()
            try:
                channel.stop_consuming()
            except Exception:
                pass
            connection.close()


if __name__ == "__main__":
    main()


