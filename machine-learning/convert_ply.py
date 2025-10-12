import argparse
import open3d
import os
import shutil

# Initialize parser
parser = argparse.ArgumentParser()
parser.add_argument("-n", "--name", help="Scene name")
parser.add_argument("-p", "--path", help="PLY source path")
parser.add_argument("-d", "--destination", help="Destination root")
args = parser.parse_args()

# Read point cloud from source path
ply = f"{args.path}"
pcd = open3d.io.read_point_cloud(ply)

# Restructure to s3dis dataset format
root = f"{args.destination}/{args.name}/{args.name}/{args.name}"
os.makedirs(f"{root}/Annotations", exist_ok=True)

open3d.io.write_point_cloud(
    pointcloud=pcd,
    filename=f"{root}/{args.name}.xyzrgb",
)

os.rename(f"{root}/{args.name}.xyzrgb", f"{root}/{args.name}.txt")

shutil.copyfile(f"{root}/{args.name}.txt", f"{root}/Annotations/{args.name}.txt")
with open(f"{root}_alignmentAngle.txt", "w") as f:
    f.write(f"{args.name} 0")
