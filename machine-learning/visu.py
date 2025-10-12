

import open3d as o3d
from pathlib import Path
import torch
import numpy as np

from matplotlib import pyplot as plt
from scipy import stats

_label_to_color_uint8 = {
    0: [158, 218, 228],  # counter
    1: [151, 223, 137],  # floor
    2: [174, 198, 232],  # wall
    3: [255, 187, 120],  # bed
    4: [254, 127, 13],  # refrigerator
    5: [196, 176, 213],  # window
    6: [213, 39, 40],  # door
    7: [188, 189, 35],  # chair
    8: [255, 152, 151],  # table
    9: [140, 86, 74],  # sofa
    10: [196, 156, 147],  # bookshelf
    11: [148, 103, 188],  # picture
    12: [0, 0, 0],  # clutter
}

_label_to_color = dict([
    (label, (np.array(color_uint8).astype(np.float64) / 255.0).tolist())
    for label, color_uint8 in _label_to_color_uint8.items()
])

_name_to_color_uint8 = {
    "ceiling": [158, 218, 228],  # counter
    "floor": [151, 223, 137],  # floor
    "wall": [174, 198, 232],  # wall
    "beam": [255, 187, 120],  # bed
    "column": [254, 127, 13],  # refrigerator
    "window": [196, 176, 213],  # window
    "door": [213, 39, 40],  # door
    "chair": [188, 189, 35],  # chair
    "table": [255, 152, 151],  # table
    "sofa": [140, 86, 74],  # sofa
    "bookcase": [196, 156, 147],  # bookshelf
    "board": [148, 103, 188],  # picture
    "clutter": [0, 0, 0],  # clutter
}

_name_to_color = dict([(name, np.array(color_uint8).astype(np.float64) / 255.0)
                       for name, color_uint8 in _name_to_color_uint8.items()])


def load_real_data(pth_path):
    """
    Args:
        pth_path: Path to the .pth file.
    Returns:
        points: (N, 3), float64
        colors: (N, 3), float64, 0-1
        labels: (N, ), int64, {1, 2, ..., 36, 39, 255}.
    """
    # - points: (N, 3), float32           -> (N, 3), float64
    # - colors: (N, 3), float32, 0-255    -> (N, 3), float64, 0-1
    # - labels: (N, 1), float64, 0-19,255 -> (N,  ), int64, 0-19,255
    te = torch.load(pth_path)

    print(te)
    points, colors, labels, _= torch.load(pth_path)
    print(points)
    points = te[points].astype(np.float64)
    colors = te[colors].astype(np.float64) / 255.0
    labels = te[labels]
    assert len(points) == len(colors) == len(labels)

    labels = labels.astype(np.int64).squeeze()
    return points, colors, labels


def load_pred_labels(label_path):
    """
    Args:
        label_path: Path to the .txt file.
    Returns:
        labels: (N, ), int64, {1, 2, ..., 36, 39}.
    """
    def read_labels(label_path):
        labels = []
        with open(label_path, "r") as f:
            for line in f:
                labels.append(int(line.strip()))
        return np.array(labels)

    return np.array(read_labels(label_path))


def render_to_image(pcd, save_path):
    vis = o3d.visualization.Visualizer()
    vis.create_window()
    vis.add_geometry(pcd)
    vis.update_geometry(pcd)
    vis.poll_events()
    vis.update_renderer()
    vis.capture_screen_image(save_path)


def visualize_scene_by_path(scene_path, save_as_image=False):
    label_dir = Path("exp/s3dis/s3dis-semseg-pt-v3m1-0-rpe/result")

    print(f"Visualizing {scene_path}")
    label_path = label_dir / f"{scene_path.stem}_pred.npy"

    # Load pcd and real labels.
    points, colors, real_labels = load_real_data(scene_path)

    # Visualize rgb colors
    #pcd = o3d.geometry.PointCloud()
    #pcd.points = o3d.utility.Vector3dVector(points)
    #pcd.colors = o3d.utility.Vector3dVector(colors)
    #if save_as_image:
     #   render_to_image(pcd, f"image/{scene_path.stem}_rgb.png")
        #o3d.visualization.draw_geometries([pcd], window_name="RGB colors")

    # Visualize real labels
    #real_label_colors = np.array([_label_to_color[l] for l in real_labels])
    #pcd = o3d.geometry.PointCloud()
    #pcd.points = o3d.utility.Vector3dVector(points)
    #pcd.colors = o3d.utility.Vector3dVector(real_label_colors)
    #if save_as_image:
     #   render_to_image(pcd, f"image/{scene_path.stem}_real.png")
    #else:
     #   saved_path =  f"exp/s3dis/semseg-pt-v2m2-0-new/result/{scene_path.stem}_gt.ply"
      #  o3d.io.write_point_cloud(saved_path,pcd)
        #o3d.visualization.draw_geometries([pcd], window_name="Real labels")

    # Load predicted labels
    pred_labels = np.load(label_path)
    pred_label_colors = np.array([_label_to_color[l] for l in pred_labels])
    pcd = o3d.geometry.PointCloud()
    pcd.points = o3d.utility.Vector3dVector(points)
    pcd.colors = o3d.utility.Vector3dVector(pred_label_colors)
    if save_as_image:
        render_to_image(pcd, f"image/{scene_path.stem}_pred.png")
    else:
        saved_path =  f"exp/s3dis/s3dis-semseg-pt-v3m1-0-rpe/result/{scene_path.stem}_pred.ply"
        o3d.io.write_point_cloud(saved_path,pcd)
        #o3d.visualization.draw_geometries([pcd], window_name="Pred labels")


def visualize_scene_by_name(scene_name, save_as_image=False):
    data_root = Path("data") / "s3dis" / "Area_9"
    scene_paths = sorted(list(data_root.glob("*.pth")))

    found = False
    for scene_path in scene_paths:
        if scene_path.stem == scene_name:
            found = True
            visualize_scene_by_path(scene_path, save_as_image=save_as_image)
            break

    if not found:
        raise ValueError(f"Scene {scene_name} not found.")


# visualize_scene_by_name("2401")

if __name__ == "__main__":
    # Used in main text
    # hallway_10
    # lobby_1
    # office_27
    # office_30

    # Use in supplementary
    # visualize_scene_by_name("conferenceRoom_2")
    # visualize_scene_by_name("office_35")
    # visualize_scene_by_name("office_18")
    # visualize_scene_by_name("office_5")
    # visualize_scene_by_name("office_28")
    # visualize_scene_by_name("office_3")
    # visualize_scene_by_name("hallway_12")
    visualize_scene_by_name("kursi_abu_rgb_1")

    # Visualize all scenes
    # data_root = Path("data") / "scannetv2" / "val"
    # scene_paths = sorted(list(data_root.glob("*.pth")))
    # scene_names = [p.stem for p in scene_paths]
    # for scene_name in scene_names:
    #     visualize_scene_by_name(scene_name, save_as_image=True)

# +
# def load_real_data(pth_path):
#     """
#     Args:
#         pth_path: Path to the .pth file.
#     Returns:
#         points: (N, 3), float64
#         colors: (N, 3), float64, 0-1
#         labels: (N, ), int64, {1, 2, ..., 36, 39, 255}.
#     """
#     # - points: (N, 3), float32           -> (N, 3), float64
#     # - colors: (N, 3), float32, 0-255    -> (N, 3), float64, 0-1
#     # - labels: (N, 1), float64, 0-19,255 -> (N,  ), int64, 0-19,255
#     te = torch.load(pth_path)
    

#     print(te)
#     points, colors, labels, k, l = torch.load(pth_path)
#     print(points)
#     points = te[points].astype(np.float64)
#     colors = te[colors].astype(np.float64) / 255.0
#     labels = te[labels]
#     assert len(points) == len(colors) == len(labels)

#     labels = labels.astype(np.int64).squeeze()
#     return points, colors, labels
# -

# data_root = Path("data") / "s3dis" / "Area_5"
# load_real_data("data/s3dis/Area_5/office_1.pth")

# load_real_data("data/s3dis/Area_7/2401.pth")
