from datetime import datetime, time, timedelta
import os
import googlemaps
import polyline

# Read API key from container environment (set via docker-compose)
API_KEY = os.getenv('GOOGLE_MAPS_API_KEY') or os.getenv('API_KEY')

def nearest_neighbor_runner(bin_cluster_data, distances, times, distance_from_DC, duration_from_DC, ori_lat, ori_long):
     
    NN_route_indexs, NN_unreachable_indexs, total_time, total_time_with_waiting, total_distance, location_dest_info = nearest_neighbor_vrptw(bin_cluster_data, distances, times, distance_from_DC, duration_from_DC)

    NN_route_loc_dest_ids = bin_cluster_data.iloc[NN_route_indexs]['loc_dest_id'].tolist()
    NN_unreachable_loc_dest_ids = bin_cluster_data.iloc[NN_unreachable_indexs]['loc_dest_id'].tolist()
    print("Route (loc_dest_id): ")
    print(NN_route_loc_dest_ids)
    print("Unreachable Route (loc_dest_id): ")
    print(NN_unreachable_loc_dest_ids)

    if (len(NN_unreachable_loc_dest_ids) == 0):
        print("\nAll locations can be reached")

    else:
        print("\nUnreachable Locations ID:")
        for address in NN_unreachable_loc_dest_ids:
            print(address)
    dc_banten_coords = f"{ori_lat},{ori_long}"
    google_maps_client = googlemaps.Client(key=API_KEY)
    NN_all_coords, NN_directions_results = fetch_concatenate_routes(NN_route_indexs, bin_cluster_data, google_maps_client, dc_banten_coords)
     
    return NN_all_coords, NN_directions_results, NN_route_loc_dest_ids, NN_unreachable_loc_dest_ids, total_time, total_time_with_waiting, total_distance, location_dest_info

def nearest_neighbor_vrptw(locations, distance_matrix, time_matrix, initial_distance, initial_duration):
    location_dest_info = []

    num_locations = len(locations)
    unvisited = set(range(num_locations))   
    route = []   
    unreachable = []   
    total_time = timedelta(seconds=initial_duration)   
    total_time_waiting = total_time
    total_distance = initial_distance   
     
    start_time = time(8, 0)
    current_time = datetime.combine(datetime.today(), start_time)
    service_time = timedelta(minutes=locations.iloc[0]['service_time'])  # 15 minutes service time
    print(" ")
    print("==========================Nearest Neighbor==================================")
    print(f"*****************Starting at DC Banten at {current_time.strftime('%H:%M:%S')}*****************")
    print(" ")
     

    first_location_index = 0   
    first_location = locations.iloc[first_location_index]

    route.append(first_location_index)
    unvisited.remove(first_location_index)
    current_time += timedelta(seconds=initial_duration)
    open_time = datetime.combine(datetime.today(), locations.iloc[first_location_index]['open_hour'])
    if current_time < open_time:
        waiting_duration = open_time - current_time
        total_time_waiting += waiting_duration
        current_time += waiting_duration
        print(f"Arrived early at {locations.iloc[first_location_index]['address']}. Waiting for {waiting_duration} until it opens at {open_time.strftime('%H:%M:%S')}")

    print(f"First stop: {first_location['address']} at {current_time.strftime('%H:%M:%S')}, travel time: {initial_duration/60} minutes, travel distance: {initial_distance} meters")
    location_dest_info.append({
        "loc_dest_id" : first_location['loc_dest_id'],
        "queue": 1,
        "eta": current_time.strftime('%H:%M:%S'),
        "travel_time" : initial_duration/60,
        "travel_distance" :initial_distance
    })
    # service time first location
    current_time += service_time
    total_time += service_time
    
    while unvisited:
        current_index = route[-1] if route else -1   
        next_index = None
        min_distance = float('inf')
        
        for loc_index in unvisited:
            travel_distance = distance_matrix[current_index][loc_index]
            travel_time_seconds = time_matrix[current_index][loc_index]
            travel_time = timedelta(seconds=travel_time_seconds)
            arrival_time = current_time + travel_time
            open_time = datetime.combine(datetime.today(), locations.iloc[loc_index]['open_hour'])
            close_time = datetime.combine(datetime.today(), locations.iloc[loc_index]['close_hour'])
            
            if arrival_time <= close_time and travel_distance < min_distance:
                if arrival_time < open_time:
                    waiting_duration = open_time - arrival_time
                    total_time_waiting += waiting_duration
                    arrival_time = open_time
                    print(f"Arrived early at {locations.iloc[loc_index]['address']}. Waiting for {waiting_duration} until it opens at {open_time.strftime('%H:%M:%S')}")
                    next_index = loc_index
                    min_time = arrival_time
                    min_travel_time = travel_time
                    min_distance = travel_distance
                if open_time <= arrival_time <= close_time:
                    next_index = loc_index
                    min_time = arrival_time
                    min_travel_time = travel_time
                    min_distance = travel_distance

        if next_index is None:
            unreachable.extend(unvisited)
            break

        total_time += min_travel_time
        total_time_waiting += min_travel_time
        total_distance += min_distance
        print(f"Next stop: {locations.iloc[next_index]['address']} at {min_time.strftime('%H:%M:%S')}, travel time: {min_travel_time}, travel distance: {min_distance} meters")
        location_dest_info.append({
            "loc_dest_id" : locations.iloc[next_index]['loc_dest_id'],
            "queue": len(location_dest_info) + 1,
            "eta": min_time.strftime('%H:%M:%S'),
            "travel_time" : min_travel_time.total_seconds() / 60,
            "travel_distance" :min_distance
        })

        current_time = min_time

        # service time each location
        current_time += timedelta(minutes=locations.iloc[next_index]['service_time']) 
        total_time += timedelta(minutes=locations.iloc[next_index]['service_time']) 
        
        route.append(next_index)
        unvisited.remove(next_index)
    
    print(f"Route Index: {route}")
    print(f"\nTotal travel time: {total_time}")
    print(f"Total travel time with waiting time: {total_time_waiting}")
    print(f"Total travel distance: {total_distance} meters")
    print("=========================================================================")
    return route, unreachable, total_time, total_time_waiting, total_distance, location_dest_info

def calculate_total_distance(route_indices, distance_matrix, distance_from_DC):
    total_distance = 0
    for i in range(len(route_indices) - 1):
        total_distance += distance_matrix[route_indices[i]][route_indices[i+1]]
     
    return total_distance + distance_from_DC

def fetch_concatenate_route(latitude, longitude, ori_lat, ori_long):
    all_coords = []   
    first_location_coords = (latitude, longitude)  # Use a tuple for coordinates
    gmaps = googlemaps.Client(key=API_KEY)  # Initialize the client outside of the directions call
    
    # Fetch directions
    first_segment_result = gmaps.directions(
        origin=(ori_lat, ori_long),
        destination=first_location_coords,
        mode="driving",
        departure_time=datetime.now()
    )
    
    # Check if there is a result and extract polyline
    if first_segment_result:
        first_polyline_encoded = first_segment_result[0]['overview_polyline']['points']
        first_polyline_decoded = polyline.decode(first_polyline_encoded)
        all_coords.extend(first_polyline_decoded)
        
    return all_coords


def fetch_concatenate_routes(route_indices, location_data, google_maps_client, dc_banten_coords):
    all_direction_results = []
    all_coords = []   

    first_location = location_data.iloc[route_indices[0]]
    first_location_coords = [first_location['latitude'], first_location['longitude']]

    first_segment_result = google_maps_client.directions(
        dc_banten_coords,
        first_location_coords,
        mode="driving",
        departure_time=datetime.now()
    )
    if first_segment_result:
        all_direction_results.extend(first_segment_result)
        first_polyline_encoded = first_segment_result[0]['overview_polyline']['points']
        first_polyline_decoded = polyline.decode(first_polyline_encoded)
        all_coords.extend(first_polyline_decoded)

     
    for i in range(len(route_indices) - 1):
        start_point = location_data.iloc[route_indices[i]]
        end_point = location_data.iloc[route_indices[i + 1]]
        start_coords = [start_point['latitude'], start_point['longitude']]
        end_coords = [end_point['latitude'], end_point['longitude']]

         
        directions_result = google_maps_client.directions(
            start_coords,
            end_coords,
            mode="driving",
            departure_time=datetime.now()
        )
         
        if directions_result:
            all_direction_results.extend(directions_result)
            polyline_encoded = directions_result[0]['overview_polyline']['points']
            polyline_decoded = polyline.decode(polyline_encoded)
            all_coords.extend(polyline_decoded)

    return all_coords, all_direction_results
