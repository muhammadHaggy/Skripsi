import os
import glob

def clean_file(path):
    print(f"Cleaning: {path}")
    with open(path, "rb") as f:
        raw = f.read()
    # Keep only printable ASCII and tab/newline
    clean = bytearray([b for b in raw if 32 <= b <= 126 or b in (9, 10)])
    with open(path, "wb") as f:
        f.write(clean)

def clean_all_txt_files(root):
    txt_files = glob.glob(os.path.join(root, "**", "*.txt"), recursive=True)
    print(f"Found {len(txt_files)} .txt files to clean.")
    for txt in txt_files:
        clean_file(txt)

if __name__ == "__main__":
    clean_all_txt_files("data/S3DIS")
