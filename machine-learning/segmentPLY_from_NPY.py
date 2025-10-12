import numpy as np
from plyfile import PlyData, PlyElement
import open3d
import argparse
import os
 
 
# Initialize parser
parser = argparse.ArgumentParser()
 
# Adding optional argument
parser.add_argument("-n", "--name", help = "NPY Prediction Path")
 
# Read arguments from command line
args = parser.parse_args()

label_path = f"npy/{args.name}.npy"
full_ply = f"full_ply/{args.name}.ply"
project_name = args.name
dir_name = f"segment_result/{project_name}"
os.makedirs(dir_name, exist_ok=True)

_label_to_color_uint8 = {
    0: [158, 218, 228],
    1: [151, 223, 137],
    2: [174, 198, 232],
    3: [255, 187, 128],
    4: [254, 127, 13],
    5: [196, 176, 213],
    6: [213, 39, 40],
    7: [188, 189, 35],
    8: [255, 152, 151],
    9: [140, 86, 74],
    10: [196, 156, 147],
    11: [148, 103, 188],
    12: [0, 0, 0]
}

_label_to_color = dict([
    (label, (np.array(color_uint8).astype(np.float64) / 255.0).tolist()) for label, color_uint8 in _label_to_color_uint8.items()
])

pred_labels = np.load(label_path)
pred_labels_colors = np.array([_label_to_color[l] for l in pred_labels])
plydata = open3d.io.read_point_cloud(full_ply)

pcd = open3d.geometry.PointCloud()
pcd.points = plydata.points
pcd.colors = open3d.utility.Vector3dVector(pred_labels_colors)

open3d.io.write_point_cloud(f'{dir_name}/{project_name}.ply', pcd)

# segmented_items = {

# }
# properties = []


# for property in plydata.elements[0].properties:
#     properties.append((property.name, 'f4'))

# counter = 0

# for idx, item in enumerate(pred_labels):
#     print(f"{counter}/{len(pred_labels)}")
#     if segmented_items.get(str(item)) == None:
#         segmented_items[str(item)] = [plydata.elements[0].data[idx]]
#     else:
#         segmented_items[str(item)] += [plydata.elements[0].data[idx]]
#     counter+=1

# print(segmented_items.keys())

# for key in segmented_items.keys():
#     points = segmented_items[key]
#     vertex = np.array(points
#                     ,dtype=properties)

#     plydata = PlyElement.describe(vertex, 'vertex')
#     dir_name = f"segment result/{project_name}"
#     os.makedirs(dir_name, exist_ok=True)
#     PlyData([plydata]).write(f'{dir_name}/{project_name}_{key}.ply')
