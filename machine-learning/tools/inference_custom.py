import argparse
import torch
import open3d as o3d
import numpy as np
import matplotlib.pyplot as plt
import sys
import os

# Tambahkan repo path agar bisa import pointcept
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from mmengine.config import Config
from pointcept.models.builder import build_model
from pointcept.models.utils.structure import Point

def load_pointcloud(input_path):
    pcd = o3d.io.read_point_cloud(input_path)
    points = np.asarray(pcd.points).astype(np.float32)

    if len(points) == 0:
        raise ValueError("Point cloud is empty.")

    if pcd.has_colors():
        features = np.asarray(pcd.colors).astype(np.float32)
    else:
        features = np.ones_like(points, dtype=np.float32)

    return torch.tensor(points), torch.tensor(features), pcd

def save_labels_txt(labels, path):
    np.savetxt(path, labels, fmt="%d")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--config_file", type=str, required=True)
    parser.add_argument("--weight", type=str, required=True)
    parser.add_argument("--input_path", type=str, required=True)
    parser.add_argument("--output_path", type=str, required=True)
    args = parser.parse_args()

    cfg = Config.fromfile(args.config_file)
    model = build_model(cfg.model).cuda()
    model.eval()

    checkpoint = torch.load(args.weight, map_location="cuda")
    model.load_state_dict(checkpoint["state_dict"], strict=False)

    coords, feats, _ = load_pointcloud(args.input_path)

    with torch.no_grad():
        coords = coords.cuda().unsqueeze(0)  # [1, N, 3]
        feats = feats.cuda().unsqueeze(0)    # [1, N, C]
        point = Point(points=coords, feats=feats)
        output = model.backbone(point)       # ✅ feed into backbone
        pred = torch.argmax(output, dim=1).squeeze().cpu().numpy()

    save_labels_txt(pred, args.output_path)
    print(f"✅ Saved predicted labels to {args.output_path}")

if __name__ == "__main__":
    main()