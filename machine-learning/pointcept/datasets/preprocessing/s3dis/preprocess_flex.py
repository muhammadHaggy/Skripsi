import os
import argparse
import glob
import numpy as np
from concurrent.futures import ProcessPoolExecutor
from itertools import repeat


def parse_room(room, angle, dataset_root, output_root):
    print("Parsing:", room)

    source_dir = os.path.join(dataset_root, room)
    save_path = os.path.join(output_root, room)
    os.makedirs(save_path, exist_ok=True)

    annotation_path = os.path.join(source_dir, "Annotations", f"{room}.txt")
    if not os.path.exists(annotation_path):
        raise FileNotFoundError(f"Annotation file not found: {annotation_path}")

    data = np.loadtxt(annotation_path)
    coords = data[:, :3]
    colors = data[:, 3:6]
    semantic_gt = np.zeros((coords.shape[0], 1), dtype=np.int16)  # dummy label
    instance_gt = np.zeros((coords.shape[0], 1), dtype=np.int16)  # dummy instance ID

    if angle != 0:
        angle_rad = (2 - angle / 180) * np.pi
        rot_cos, rot_sin = np.cos(angle_rad), np.sin(angle_rad)
        rot_t = np.array([[rot_cos, -rot_sin, 0], [rot_sin, rot_cos, 0], [0, 0, 1]])
        room_center = (np.max(coords, axis=0) + np.min(coords, axis=0)) / 2
        coords = (coords - room_center) @ np.transpose(rot_t) + room_center

    np.save(os.path.join(save_path, "coord.npy"), coords.astype(np.float32))
    np.save(os.path.join(save_path, "color.npy"), colors.astype(np.uint8))
    np.save(os.path.join(save_path, "segment.npy"), semantic_gt)
    np.save(os.path.join(save_path, "instance.npy"), instance_gt)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dataset_root", required=True, help="Root folder containing your dataset")
    parser.add_argument("--output_root", required=True, help="Folder to save processed output")
    parser.add_argument("--angle_file", required=True, help="Path to alignmentAngle.txt")
    args = parser.parse_args()

    room_list = []
    angle_list = []

    with open(args.angle_file, "r") as f:
        for line in f:
            parts = line.strip().split()
            room_list.append(parts[0])
            angle_list.append(int(parts[1]))

    os.makedirs(args.output_root, exist_ok=True)
    pool = ProcessPoolExecutor()
    _ = list(pool.map(parse_room, room_list, angle_list, repeat(args.dataset_root), repeat(args.output_root)))
    print("✅ Selesai preprocessing. Output di:", args.output_root)


if __name__ == "__main__":
    main()
