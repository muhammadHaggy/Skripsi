import argparse
import colorsys
import os

import numpy as np
import open3d


# Initialize parser
parser = argparse.ArgumentParser()
parser.add_argument("--input", help="Input PLY source path")
parser.add_argument("--scene", help="PTv3 NPY source path")
parser.add_argument("--destination", help="Conversion PLY destination path")
parser.add_argument("--name", help="NPY Prediction Path")
args = parser.parse_args()

input_ply = f"{args.input}"
scene_npy = f"{args.scene}"

project_name = f"{args.name}"
dir_name = f"{args.destination}"
os.makedirs(dir_name, exist_ok=True)

classes_count = 12

# Handle class label colors
colors = {
    i: colorsys.hls_to_rgb(i * (360 / classes_count), 60, 100)
    for i in range(classes_count)
}
colors[classes_count] = [255, 255, 255]

classes = {
    label: (np.array(color).astype(np.float64) / 255.0).tolist()
    for label, color in colors.items()
}

# Load source data
pred_labels = np.load(scene_npy)
pred_labels_colors = np.array([classes[l] for l in pred_labels])
plydata = open3d.io.read_point_cloud(input_ply)

# Generate final point cloud
pcd = open3d.geometry.PointCloud()
pcd.points = plydata.points
pcd.colors = open3d.utility.Vector3dVector(pred_labels_colors)

open3d.io.write_point_cloud(f"{dir_name}/{project_name}.ply", pcd, write_ascii=True)
