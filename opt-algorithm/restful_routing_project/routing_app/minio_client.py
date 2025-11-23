from minio import Minio
import json
import os
import io

# Configuration
MINIO_ENDPOINT = os.getenv('MINIO_ENDPOINT', 'localhost:9000')
MINIO_ACCESS_KEY = os.getenv('MINIO_ACCESS_KEY', 'minioadmin')
MINIO_SECRET_KEY = os.getenv('MINIO_SECRET_KEY', 'minioadmin')
MINIO_BUCKET = os.getenv('MINIO_BUCKET', 'runs')
SECURE = os.getenv('MINIO_SECURE', 'False').lower() == 'true'

def get_client():
    return Minio(
        MINIO_ENDPOINT,
        access_key=MINIO_ACCESS_KEY,
        secret_key=MINIO_SECRET_KEY,
        secure=SECURE
    )

def get_inference_result(dag_run_id):
    """
    Retrieves the inference result from MinIO based on the dag_run_id.
    Path: s3://runs/{dag_run_id}/emissions.json
    """
    client = get_client()
    # Bucket is defined in MINIO_BUCKET (default 'runs')
    object_name = f"{dag_run_id}/emissions.json"
    
    try:
        response = client.get_object(MINIO_BUCKET, object_name)
        data = json.load(response)
        response.close()
        response.release_conn()
        return data
    except Exception as e:
        print(f"[MinIO] Failed to get object {MINIO_BUCKET}/{object_name}: {e}")
        return None
