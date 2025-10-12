import sys
import numpy as np
import open3d as o3d
from sklearn.decomposition import PCA
from sklearn.cluster import DBSCAN

def remove_statistical_outliers(pcd, nb_neighbors=50, std_ratio=1.0):
    pcd, _ = pcd.remove_statistical_outlier(
        nb_neighbors=nb_neighbors,
        std_ratio=std_ratio
    )
    return pcd

def scale_point_cloud(pcd, scale_factor=0.8):
    pts = np.asarray(pcd.points)
    pcd.points = o3d.utility.Vector3dVector(pts * scale_factor)
    return pcd

def pca_align_point_cloud(pcd):
    pts = np.asarray(pcd.points)
    pca = PCA(n_components=3)
    pca.fit(pts)
    R = pca.components_.T
    pts_aligned = (R.T @ (pts - pca.mean_).T).T
    aligned = o3d.geometry.PointCloud(o3d.utility.Vector3dVector(pts_aligned))
    return aligned

def main():
    if len(sys.argv) != 3:
        print("Usage: python volume-est.py <point_cloud.ply> <labels.npy>")
        sys.exit(1)

    ply_file_path   = sys.argv[1]
    labels_npy_path = sys.argv[2]

    raw_pcd = o3d.io.read_point_cloud(ply_file_path)
    labels  = np.load(labels_npy_path)
    pts     = np.asarray(raw_pcd.points)[labels == 1]
    pcd     = o3d.geometry.PointCloud(o3d.utility.Vector3dVector(pts))

    pcd = remove_statistical_outliers(pcd)

    db_labels = DBSCAN(eps=0.05, min_samples=12).fit_predict(np.asarray(pcd.points))
    keep_idxs = np.where(db_labels != -1)[0]
    pcd       = pcd.select_by_index(keep_idxs)

    pcd = scale_point_cloud(pcd)

    aligned_pcd = pca_align_point_cloud(pcd)

    aabb   = aligned_pcd.get_axis_aligned_bounding_box()
    L, W, H = aabb.get_extent()
    volume_cm3 = L * W * H * 1e6 

    print(f"Dimensions (L×W×H): {L*100:.2f} cm × {W*100:.2f} cm × {H*100:.2f} cm")
    print(f"Volume: {volume_cm3:.2f} cm³")


if __name__ == "__main__":
    main()
