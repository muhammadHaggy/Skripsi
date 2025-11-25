import requests
import time
import json
import os
import base64
from .logger_utils import get_logger

logger = get_logger(__name__)

# Configuration
AIRFLOW_URL = os.getenv('AIRFLOW_URL', 'http://localhost:8080')
AIRFLOW_USER = os.getenv('AIRFLOW_USER', 'admin')
AIRFLOW_PASS = os.getenv('AIRFLOW_PASS', 'admin')
DAG_ID = '03_inference_pipeline'

def get_auth_header():
    credentials = f"{AIRFLOW_USER}:{AIRFLOW_PASS}"
    encoded_credentials = base64.b64encode(credentials.encode()).decode()
    return {'Authorization': f'Basic {encoded_credentials}', 'Content-Type': 'application/json'}

def trigger_inference(origin, dest):
    """
    Triggers the inference DAG for a given origin and destination.
    origin: "lat, lon" string
    dest: "lat, lon" string
    Returns: dag_run_id or None if failed
    """
    logger.info(f"[trigger_inference] Triggering DAG for {origin} -> {dest}")
    url = f"{AIRFLOW_URL}/api/v1/dags/{DAG_ID}/dagRuns"
    payload = {
        "conf": {
            "origin": origin,
            "dest": dest
        }
    }
    
    try:
        response = requests.post(url, headers=get_auth_header(), json=payload)
        response.raise_for_status()
        dag_run_id = response.json()['dag_run_id']
        logger.info(f"[trigger_inference] Successfully triggered DAG run: {dag_run_id}")
        return dag_run_id
    except Exception as e:
        logger.error(f"[trigger_inference] Trigger failed for {origin}->{dest}: {e}")
        return None

def poll_dag_run(dag_run_id, max_retries=60, delay=2):
    """
    Polls the DAG run status until success or failure.
    Returns: 'success', 'failed', or 'timeout'
    """
    logger.info(f"[poll_dag_run] Polling DAG run: {dag_run_id}, max_retries={max_retries}")
    # URL encode the dag_run_id because it contains special characters like ':' and '+'
    # However, requests usually handles basic path construction, but for Airflow API 
    # the dag_run_id in the URL might need manual encoding if we construct string manually.
    # Let's rely on requests to handle it or manually encode if needed.
    # Airflow API expects the dag_run_id to be part of the URL path.
    
    # IMPORTANT: The dag_run_id from response is like "manual__2025-11-22T08:56:18.839060+00:00"
    # We need to ensure it's safe for URL.
    import urllib.parse
    encoded_dag_run_id = urllib.parse.quote(dag_run_id)
    
    url = f"{AIRFLOW_URL}/api/v1/dags/{DAG_ID}/dagRuns/{encoded_dag_run_id}"
    
    for attempt in range(max_retries):
        try:
            response = requests.get(url, headers=get_auth_header())
            if response.status_code == 200:
                state = response.json()['state']
                if state in ['success', 'failed']:
                    logger.info(f"[poll_dag_run] DAG run {dag_run_id} completed with state: {state}")
                    return state
            else:
                logger.warning(f"[poll_dag_run] Poll failed status={response.status_code}")
        except Exception as e:
            logger.warning(f"[poll_dag_run] Poll exception: {e}")
        
        time.sleep(delay)
    
    logger.error(f"[poll_dag_run] Timeout after {max_retries} attempts for {dag_run_id}")
    return 'timeout'
