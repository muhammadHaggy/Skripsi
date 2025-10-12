import os
import glob
import numpy as np

def clean_annotations(dataset_root):
    print(f"Scanning dataset root: {dataset_root}")
    area_dirs = [d for d in os.listdir(dataset_root) if d.startswith("Area_")]

    for area in area_dirs:
        area_path = os.path.join(dataset_root, area)
        if not os.path.isdir(area_path):
            continue

        rooms = [r for r in os.listdir(area_path) if os.path.isdir(os.path.join(area_path, r))]
        for room in rooms:
            anno_dir = os.path.join(area_path, room, "Annotations")
            if not os.path.exists(anno_dir):
                continue

            txt_files = glob.glob(os.path.join(anno_dir, "*.txt"))
            for txt_file in txt_files:
                try:
                    if os.path.getsize(txt_file) == 0:
                        print(f"Empty file: {txt_file} -> removed")
                        os.remove(txt_file)
                        continue

                    data = np.loadtxt(txt_file)
                    if data.size == 0 or data.shape[1] < 6:
                        print(f"Invalid shape: {txt_file} -> removed")
                        os.remove(txt_file)
                except Exception as e:
                    print(f"Load error: {txt_file} -> removed | Reason: {e}")
                    os.remove(txt_file)

if __name__ == "__main__":
    # Ganti path ini sesuai kebutuhan
    clean_annotations("data/S3DIS")
