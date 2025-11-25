from minio import Minio
import json
import os
import io
from .logger_utils import get_logger

logger = get_logger(__name__)

# Configuration
MINIO_ENDPOINT = os.getenv('MINIO_ENDPOINT', 'localhost:9000')
MINIO_ACCESS_KEY = os.getenv('MINIO_ACCESS_KEY', 'minioadmin')
MINIO_SECRET_KEY = os.getenv('MINIO_SECRET_KEY', 'minioadmin')
MINIO_BUCKET = os.getenv('MINIO_BUCKET', 'runs')
SECURE = os.getenv('MINIO_SECURE', 'False').lower() == 'true'

def get_client():
    return Minio(
        endpoint=MINIO_ENDPOINT,
        access_key=MINIO_ACCESS_KEY,
        secret_key=MINIO_SECRET_KEY,
        secure=SECURE
    )

def get_inference_result(dag_run_id):
    """
    Retrieves the inference result from MinIO based on the dag_run_id.
    Path: s3://runs/{dag_run_id}/emissions.json
    """
    logger.info(f"[get_inference_result] Retrieving result for dag_run_id: {dag_run_id}")
    client = get_client()
    # Bucket is defined in MINIO_BUCKET (default 'runs')
    object_name = f"{dag_run_id}/emissions.json"
    
    try:
        response = client.get_object(MINIO_BUCKET, object_name)
        data = json.load(response)
        response.close()
        response.release_conn()
        logger.info(f"[get_inference_result] Successfully retrieved result from {MINIO_BUCKET}/{object_name}")
        return data
    except Exception as e:
        logger.error(f"[get_inference_result] Failed to get object {MINIO_BUCKET}/{object_name}: {e}")
        return None
