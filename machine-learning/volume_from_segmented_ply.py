import numpy as np
import open3d as o3d
from sklearn.cluster import DBSCAN

def compute_volume(points):
    pcd = o3d.geometry.PointCloud()
    pcd.points = o3d.utility.Vector3dVector(points)
    hull, _ = pcd.compute_convex_hull()
    hull.orient_triangles()
    return hull.get_volume()

def main():
    ply_path = "full_ply/testing.ply"
    label_path = "npy/testing.npy"

    pcd = o3d.io.read_point_cloud(ply_path)
    labels = np.load(label_path)

    xyz = np.asarray(pcd.points)
    rgb = np.asarray(pcd.colors) * 255
    data = np.concatenate([xyz, rgb, labels.reshape(-1, 1)], axis=1)

    # Filter hanya label 7 (meja)
    table_points = data[data[:, 6] == 7]
    print(data[:, 6])

    if table_points.shape[0] == 0:
        print("Tidak ada poin dengan label 'table' (7) ditemukan.")
        return

    # Cluster meja yang berbeda
    clustering = DBSCAN(eps=0.2, min_samples=10).fit(table_points[:, :3])
    cluster_labels = clustering.labels_

    print(f"Jumlah cluster meja: {len(set(cluster_labels)) - (1 if -1 in cluster_labels else 0)}")

    # Coba tampilkan centroid tiap cluster
    for c in np.unique(cluster_labels):
        if c == -1:
            continue
        cluster_pts = table_points[cluster_labels == c][:, :3]
        centroid = cluster_pts.mean(axis=0)
        print(f"Cluster {c} - Center at: {centroid}")

    # ==== GANTI dengan cluster ID yang ingin dihitung (misal 1) ====
    cluster_id = int(input("Masukkan cluster ID meja bundar yang ingin dihitung: "))

    selected = table_points[cluster_labels == cluster_id][:, :3]

    if selected.shape[0] < 4:
        print("Cluster terlalu kecil untuk dihitung volume.")
        return

    vol = compute_volume(selected)
    print(f"✅ Volume meja (cluster {cluster_id}): {vol:.4f} m³")

if __name__ == "__main__":
    main()
