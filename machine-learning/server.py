from flask import Flask, request, jsonify
import os
import subprocess
import re
from pathlib import Path
import requests

app = Flask(__name__)


def download_file(pc_url: str, box_id: str, dgx_id: str) -> Path:
    ml_root = Path(os.getcwd())
    input_folder = ml_root / "data" / "input"
    input_folder.mkdir(parents=True, exist_ok=True)
    filename = f"box-{box_id}-{dgx_id}.ply"
    full_path = input_folder / filename

    storage_api_key = os.getenv("STORAGE_API_KEY", "")
    headers = {"x-api-key": storage_api_key} if storage_api_key else {}

    with requests.get(pc_url, headers=headers, stream=True) as r:
        r.raise_for_status()
        with open(full_path, "wb") as f:
            for chunk in r.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
    return full_path


def run_pipeline(box_id: str, dgx_id: str, file_path: Path):
    python_path = os.getenv("PYTHON_PATH", "python")
    pointcept_dir = Path(os.getcwd())

    commands = [
        f"{python_path} ply_to_txt.py -n box-{box_id}-{dgx_id}-txt -r {file_path}",
        f"{python_path} add_color.py -n box-{box_id}-{dgx_id}-color -r data/box-{box_id}-{dgx_id}-txt/box-{box_id}-{dgx_id}-txt/box-{box_id}-{dgx_id}-txt/Annotations/box-{box_id}-{dgx_id}-txt.txt",
        f"{python_path} preprocess.py --dataset_root data/box-{box_id}-{dgx_id}-txt --output_root data/custom_box/output-preprocess/box-{box_id}-{dgx_id}",
        f"sh scripts/pred.sh -g 1 -p {python_path} -d custom_box -n semseg_pt_v3m1_s3dis_2_custom_box_f -w model_best -s output-preprocess/box-{box_id}-{dgx_id}/box-{box_id}-{dgx_id}-txt",
        f"{python_path} volume-est.py {file_path} exp/custom_box/semseg_pt_v3m1_s3dis_2_custom_box_f/result/box-{box_id}-{dgx_id}-txt.npy",
    ]

    last_stdout = ""
    for cmd in commands:
        proc = subprocess.run(
            cmd,
            shell=True,
            cwd=pointcept_dir,
            capture_output=True,
            text=True,
        )
        if proc.returncode != 0:
            return None, proc.stderr
        last_stdout = proc.stdout

    dimensions = re.search(r"Dimensions \(L×W×H\): (\d+(?:\.\d+)?) cm × (\d+(?:\.\d+)?) cm × (\d+(?:\.\d+)?) cm", last_stdout)
    volume = re.search(r"Volume: (\d+(?:\.\d+)?) cm³", last_stdout)
    if not (dimensions and volume):
        return None, "Failed to parse ML output."
    length = float(dimensions.group(1))
    width = float(dimensions.group(2))
    height = float(dimensions.group(3))
    vol = float(volume.group(1))
    return {"length": length, "width": width, "height": height, "volume": vol}, None


@app.get("/health")
def health():
    return jsonify({"status": "ok"})


@app.post("/infer")
def infer():
    body = request.get_json(force=True)
    box_id = str(body["box_id"])  # allow int or str
    dgx_id = str(body["dgx_id"])  # allow int or str
    pc_url = body["pcUrl"]

    try:
        ply_path = download_file(pc_url, box_id, dgx_id)
        result, err = run_pipeline(box_id, dgx_id, ply_path)
        if err:
            return jsonify({"status": "error", "message": err}), 500
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


if __name__ == "__main__":
    # Run without threaded server to avoid thread start limitations in some environments
    app.run(host="0.0.0.0", port=5001, threaded=False)