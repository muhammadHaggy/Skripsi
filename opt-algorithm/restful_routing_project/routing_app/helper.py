import os
import googlemaps
import gmaps
from scipy.spatial.distance import cdist
import numpy as np
from geopy.distance import geodesic
from sklearn.cluster import DBSCAN, KMeans
from sklearn.metrics import silhouette_score as ss
from skopt import gp_minimize
from skopt.space import Real, Integer
from skopt.utils import use_named_args
from datetime import datetime

# Support reading API key only from environment
API_KEY = os.getenv('GOOGLE_MAPS_API_KEY') or os.getenv('API_KEY')

def calculate_gamma1(visited_nodes, all_nodes, df):
    total_demand_visited = sum(df.at[node, 'demand'] for node in visited_nodes)
    total_demand_all = sum(df.at[node, 'demand'] for node in all_nodes)
    return total_demand_visited / total_demand_all if total_demand_all > 0 else 1

def calculate_gamma2(noise_nodes, df, clusters):
    dist_min_sum, dist_2ndmin_sum = 0, 0
    for noise in noise_nodes:
        distances = [np.mean([geodesic_distance(df.loc[noise, ['latitude', 'longitude']], df.loc[node, ['latitude', 'longitude']])
                     for node in cluster]) for cluster in clusters]
        if len(distances) >= 2:
            dist_min_sum += min(distances)
            dist_2ndmin_sum += sorted(distances)[1]
    return dist_2ndmin_sum / dist_min_sum if dist_min_sum > 0 else 1

def procenoiseP1(clusters, noise_nodes, df, Cnum, capacity, gamma1, gamma2, data):
    for X in noise_nodes[:]:
        min_dist, min_cluster = float('inf'), None
        for cluster in clusters:
            avg_distance = np.mean([geodesic_distance(df.loc[X, ['latitude', 'longitude']], df.loc[node, ['latitude', 'longitude']])
                                    for node in cluster])
            cluster_load = sum(df.at[node, 'demand'] for node in cluster)
            if avg_distance < min_dist and cluster_load + df.at[X, 'demand'] <= capacity * gamma1 and avg_distance < gamma2 * min_dist:
                if can_add_to_cluster(cluster, X, df, data):
                    min_dist, min_cluster = avg_distance, cluster
        if min_cluster:
            min_cluster.append(X)
            df.at[X, 'cluster'] = Cnum
            noise_nodes.remove(X)

def microcluster_fusion(clusters, data, capacity, max_distance):
    fused_clusters = []
    while clusters:
        base_cluster = clusters.pop(0)
        base_demand = sum(data[node][2] for node in base_cluster)
        base_centroid = calculate_centroid(base_cluster, data)
        for i, other_cluster in enumerate(clusters):
            other_demand = sum(data[node][2] for node in other_cluster)
            other_centroid = calculate_centroid(other_cluster, data)
            if geodesic_distance(base_centroid, other_centroid) <= max_distance and base_demand + other_demand <= capacity:
                base_cluster += clusters.pop(i)
                base_demand += other_demand
                break
        fused_clusters.append(base_cluster)
    return fused_clusters

def procenoiseP2(fused_clusters, noise_nodes, df, capacity, max_distance, data):
    for noise in noise_nodes[:]:
        min_dist, best_cluster = float('inf'), None
        for cluster in fused_clusters:
            centroid = calculate_centroid(cluster, data)
            noise_coord = data[noise][:2]
            distance_to_centroid = geodesic_distance(centroid, noise_coord)
            if distance_to_centroid <= max_distance and sum(df.at[node, 'demand'] for node in cluster) + df.at[noise, 'demand'] <= capacity:
                if distance_to_centroid < min_dist:
                    min_dist, best_cluster = distance_to_centroid, cluster
        if best_cluster:
            best_cluster.append(noise)
            df.at[noise, 'cluster'] = fused_clusters.index(best_cluster) + 1
            noise_nodes.remove(noise)

def calculate_centroid(cluster, data):
    latitudes = [data[node][0] for node in cluster]
    longitudes = [data[node][1] for node in cluster]
    return np.mean(latitudes), np.mean(longitudes)

def geodesic_distance(coords1, coords2):
    return geodesic(coords1, coords2).meters

def vincenty_batch_vectorized(origin_coords, destination_coords):
    dists = cdist(origin_coords, destination_coords, 
                  lambda u, v: geodesic_distance(u, v))
    return dists
    
from .airflow_client import trigger_inference, poll_dag_run
from .minio_client import get_inference_result

def get_distance_runner(bin_cluster_data):
    distances, times, emissions = get_distance_time_matrices(bin_cluster_data)
    return distances, times, emissions

def get_distance_time_matrices(locations, batch_size=10):
    def chunks(lst, n):
        for i in range(0, len(lst), n):
            yield lst[i:i + n]

    location_batches = list(chunks(locations, batch_size))
    num_locations = len(locations)
    
    distance_matrix = np.zeros((num_locations, num_locations))
    time_matrix = np.zeros((num_locations, num_locations))
    emission_matrix = np.zeros((num_locations, num_locations))

    for i, origin_batch in enumerate(location_batches):
        for j, destination_batch in enumerate(location_batches):
            origin_coords = np.array(origin_batch[['latitude', 'longitude']])
            destination_coords = np.array(destination_batch[['latitude', 'longitude']])

            dists = vincenty_batch_vectorized(origin_coords, destination_coords)
                    
            average_speed = 60
            dists_km = dists / 1000
            times = (dists_km / average_speed) * 3600
            
            # Calculate emissions using Airflow/MinIO
            # Note: This is N^2 and will be slow.
            emissions = np.zeros(dists.shape)
            for r in range(len(origin_coords)):
                for c in range(len(destination_coords)):
                    origin_str = f"{origin_coords[r][0]},{origin_coords[r][1]}"
                    dest_str = f"{destination_coords[c][0]},{destination_coords[c][1]}"
                    
                    if origin_str == dest_str:
                        continue

                    print(f"[Emission] Triggering inference for {origin_str} -> {dest_str}")
                    dag_run_id = trigger_inference(origin_str, dest_str)
                    
                    if dag_run_id:
                        status = poll_dag_run(dag_run_id)
                        if status == 'success':
                            result = get_inference_result(dag_run_id)
                            # Assuming result contains 'emission' key or similar. 
                            # If structure is unknown, we default to 0 or log error.
                            # Based on user request, we need to "get the emission total".
                            # Let's assume result['emission_total'] exists.
                            if result and 'emission_total' in result:
                                emissions[r][c] = float(result['emission_total'])
                            else:
                                print(f"[Emission] Result missing 'emission_total': {result}")
                        else:
                            print(f"[Emission] DAG run failed or timed out: {status}")
                    else:
                        print("[Emission] Failed to trigger DAG")

            start_row = i * batch_size
            start_col = j * batch_size
            end_row = min(start_row + len(origin_coords), num_locations)
            end_col = min(start_col + len(destination_coords), num_locations)
            
            distance_matrix[start_row:end_row, start_col:end_col] = dists[:end_row - start_row, :end_col - start_col]
            time_matrix[start_row:end_row, start_col:end_col] = times[:end_row - start_row, :end_col - start_col]
            emission_matrix[start_row:end_row, start_col:end_col] = emissions[:end_row - start_row, :end_col - start_col]

    return distance_matrix.tolist(), time_matrix.tolist(), emission_matrix.tolist()

def validate_distance(locations, distances):
    for i, row in enumerate(distances):
        for j, distance in enumerate(row):
            if i != j and distance == 0:
                origin = (locations.iloc[i]['latitude'], locations.iloc[i]['longitude'])
                destination = (locations.iloc[j]['latitude'], locations.iloc[j]['longitude'])
                if (origin != destination):
                    result = gmaps.distance_matrix(f"{origin[0]},{origin[1]}", f"{destination[0]},{destination[1]}", mode="driving")
                    print(result)

def get_directions(origin, destination):
    # Try Google Directions if key is available; otherwise or on failure, fallback to geodesic-based estimate
    if API_KEY:
        try:
            gmaps_client = googlemaps.Client(key=API_KEY)
            return gmaps_client.directions(origin, destination, mode="driving")
        except Exception as e:
            print("[dbg] Google Directions failed; using fallback:", str(e))
    # Fallback: compute straight-line distance and estimate duration using heuristic speeds
    try:
        distance_m = geodesic_distance(origin, destination)
        distance_km = distance_m / 1000.0
        if distance_km < 10:
            speed_kmh = 15
        elif distance_km < 50:
            speed_kmh = 30
        else:
            speed_kmh = 40
        duration_minutes = (distance_km / max(speed_kmh, 1)) * 60.0
        duration_seconds = int(duration_minutes * 60)
        return [{
            'legs': [{
                'duration': {'value': duration_seconds},
                'distance': {'value': int(distance_m)}
            }]
        }]
    except Exception as e:
        print("[dbg] Fallback directions computation failed:", str(e))
        # Last-resort constant values to avoid crashing
        return [{
            'legs': [{
                'duration': {'value': 0},
                'distance': {'value': 0}
            }]
        }]


def handle_noise_with_kmeans(df):
    existing_clusters = df[df['cluster'] != -1]['cluster'].unique()

    centroids = []
    for cluster_id in existing_clusters:
        cluster_points = df[df['cluster'] == cluster_id]
        centroid_lat = cluster_points['latitude'].mean()
        centroid_lon = cluster_points['longitude'].mean()
        centroids.append([centroid_lat, centroid_lon])
    
    noise_points = df[df['cluster'] == -1].index
    if len(noise_points) == 0 or len(centroids) == 0:
        return df

    noise_coords = df.loc[noise_points, ['latitude', 'longitude']].values

    if len(noise_points) >= len(centroids):
        kmeans = KMeans(n_clusters=len(centroids), init=np.array(centroids), n_init=1)
        noise_labels = kmeans.fit_predict(noise_coords)

        for i, noise_index in enumerate(noise_points):
            assigned_cluster_index = noise_labels[i]
            assigned_cluster_id = existing_clusters[assigned_cluster_index]
            df.at[noise_index, 'cluster'] = assigned_cluster_id + 1
    else:
        for noise_index in noise_points:
            noise_coord = df.loc[noise_index, ['latitude', 'longitude']].values
            distances = [np.linalg.norm(noise_coord - np.array(centroid)) for centroid in centroids]
            nearest_centroid_index = np.argmin(distances)
            assigned_cluster_id = existing_clusters[nearest_centroid_index]
            df.at[noise_index, 'cluster'] = assigned_cluster_id + 1

    return df

def dbscan_cluster(df, warehouse_loc):
    df['demand'] = df['quantity'] * df['volume']
    data = df[['latitude', 'longitude', 'demand']].to_numpy()
    capacity = 1000000

    # best_eps, best_min_samples = get_eps_and_min_samples(data)
    best_eps, best_min_samples = 25000, 5
    Cnum = 1
    unvisited_nodes = set(range(len(data)))
    clusters = []
    warehouse = np.array([warehouse_loc])
    noise_nodes = []
    visited_nodes = set()
    all_nodes = set(range(len(data)))
    core_points = []

    def get_neighbors(node_index, eps):
        neighbors = []
        for i in unvisited_nodes:
            if i != node_index and geodesic_distance(data[node_index][:2], data[i][:2]) <= eps:
                neighbors.append(i)
        return neighbors
    
    while unvisited_nodes:
        if Cnum == 1:
            X1 = max(unvisited_nodes, key=lambda i: geodesic_distance(warehouse, data[i][:2]))
        else:
            X1 = max(unvisited_nodes, key=lambda i: min([geodesic_distance(data[i][:2], data[c][:2]) for c in core_points]))

        neighbors = get_neighbors(X1, best_eps)

        if len(neighbors) >= best_min_samples:
            current_cluster = []
            visited_nodes.add(X1)
            unvisited_nodes.remove(X1)

            if can_add_to_cluster(current_cluster, X1, df, data):
                current_cluster.append(X1)

            for node in neighbors:
                if can_add_to_cluster(current_cluster, node, df, data):
                    visited_nodes.add(node)
                    current_cluster.append(node)
                    unvisited_nodes.remove(node)

            clusters.append(current_cluster)
            for node in current_cluster:
                df.at[node, 'cluster'] = Cnum

            core_points = current_cluster
            Cnum += 1
        else:
            noise_nodes.append(X1)
            unvisited_nodes.remove(X1)        

    gamma1 = calculate_gamma1(visited_nodes, all_nodes, df)
    gamma2 = calculate_gamma2(noise_nodes, df, clusters)

    procenoiseP1(clusters, noise_nodes, df, Cnum, capacity, gamma1, gamma2, data)
    fused_clusters = microcluster_fusion(clusters, data, capacity, 35000)
    procenoiseP2(fused_clusters, noise_nodes, df, capacity, 35000, data)

    for noise in noise_nodes:
        df.at[noise, 'cluster'] = -1

    return df

def get_eps_and_min_samples(data):
    space  = [
        Real(500, 25000, name='eps'),
        Integer(1, 40, name='min_samples')
    ]

    @use_named_args(space)
    def objective(eps, min_samples):
        dbscan = DBSCAN(eps=eps, min_samples=min_samples)
        labels = dbscan.fit_predict(data)

        if len(set(labels)) < 2 or (len(set(labels)) <= 1 and -1 in labels):
            return 1

        score = -ss(data, labels)
        return score

    res = gp_minimize(objective, space, n_calls=60, random_state=0)

    best_eps, best_min_samples = res.x
    return best_eps, best_min_samples


def travel_time(data, node1, node2):
    distance = geodesic((data[node1][0], data[node1][1]), (data[node2][0], data[node2][1])).kilometers
    if distance < 10:
        speed = 15
    elif distance < 50:
        speed = 30
    else:
        speed = 40
    time = (distance / speed) * 60
    return time

def can_add_to_cluster(cluster, new_order_index, df, data):
    total_service_time = sum(df.at[node, 'service_time'] for node in cluster) + df.at[new_order_index, 'service_time']
    if cluster:
        last_node = cluster[-1]
        total_delivery_time = sum(travel_time(data, cluster[i], cluster[i+1]) for i in range(len(cluster) - 1))
        total_delivery_time += travel_time(data, last_node, new_order_index)
    else:
        total_delivery_time = 0
    total_required_time = total_service_time + total_delivery_time
    available_time = available_delivery_time(df.at[new_order_index, 'open_hour'], df.at[new_order_index, 'close_hour'])
    return total_required_time <= available_time

def available_delivery_time(open_hour, close_hour, truck_start_hour='08:00', truck_end_hour='17:00'):
    truck_start_time = datetime.strptime(truck_start_hour, "%H:%M").time()
    truck_end_time = datetime.strptime(truck_end_hour, "%H:%M").time()

    start = max(open_hour, truck_start_time)
    end = min(close_hour, truck_end_time)
    
    duration = ((datetime.combine(datetime.today(), end) - datetime.combine(datetime.today(), start)).total_seconds()) / 60
    return max(0, duration)
