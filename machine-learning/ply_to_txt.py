import argparse
import open3d
import os
import shutil

# Initialize parser
parser = argparse.ArgumentParser()
 
# Adding optional argument
parser.add_argument("-n", "--name", help = "Project name")
parser.add_argument("-r", "--root", help = "Project name")
 
# Read arguments from command line
args = parser.parse_args()

ply = f'{args.root}'


pcd = open3d.io.read_point_cloud(ply)

# restructure to s3dis
os.makedirs(f"data/{args.name}" ,exist_ok=True)
os.makedirs(f"data/{args.name}/{args.name}" ,exist_ok=True)
os.makedirs(f"data/{args.name}/{args.name}/{args.name}" ,exist_ok=True)
os.makedirs(f"data/{args.name}/{args.name}/{args.name}/Annotations" ,exist_ok=True)

open3d.io.write_point_cloud(f"data/{args.name}/{args.name}/{args.name}/{args.name}.xyz", pcd, format="xyz")
os.rename(f"data/{args.name}/{args.name}/{args.name}/{args.name}.xyz", f"data/{args.name}/{args.name}/{args.name}/{args.name}.txt")

with open(f"data/{args.name}/{args.name}/{args.name}/{args.name}.txt", 'r+') as f:
    lines = f.readlines()
    f.seek(0)
    for line in lines:
        parts = line.strip().split()
        modified_line = ' '.join(parts) + ' 0.000000 0.000000 0.000000\n'
        f.write(modified_line)
    f.truncate()
f.close()

f = open(f"data/{args.name}/{args.name}/{args.name}_alignmentAngle.txt", "a")
f.write(f"{args.name} 0")
f.close()

shutil.copyfile(f"data/{args.name}/{args.name}/{args.name}/{args.name}.txt", f"data/{args.name}/{args.name}/{args.name}/Annotations/{args.name}.txt")


