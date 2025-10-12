from pathlib import Path
import os
import requests
import logging

logger = logging.getLogger(__name__)

def download_file(pc_url, box_id, dgx_id):
    try:
        ml_root = os.getenv("ML_ROOT")
        if ml_root:
            base_dir = Path(ml_root)
        else:
            base_dir = Path(__file__).resolve().parents[3]
        input_folder = base_dir / "data" / "input"
        input_folder.mkdir(parents=True, exist_ok=True)

        filename = f"box-{box_id}-{dgx_id}.ply"
        full_path = input_folder / filename

        storage_api_key = os.getenv("STORAGE_API_KEY")
        headers = {"x-api-key": storage_api_key}

        logger.info(f"Downloading file from {pc_url}...")
        response = requests.get(pc_url, headers=headers, stream=True)

        if response.status_code == 200:
            with open(full_path, 'wb') as file:
                for chunk in response.iter_content(chunk_size=1024):
                    if chunk:
                        file.write(chunk)
            logger.info(f"File downloaded and saved to {full_path}")
            relative_path = Path("data") / "input" / filename
            return str(relative_path)
        else:
            logger.error(f"Failed to download file from {pc_url}. Status code: {response.status_code}")
            return None
    except Exception as e:
        logger.error(f"Error downloading file: {e}")
        return None
