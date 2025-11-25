from datetime import datetime, time, timedelta
from rest_framework.decorators import api_view
from rest_framework.response import Response
from sklearn.preprocessing import MinMaxScaler
from .nearest_neighbor import fetch_concatenate_route
from .helper import get_distance_runner, get_directions, dbscan_cluster, handle_noise_with_kmeans, geodesic_distance
from .google_or import google_or
import json
from .models import Truck
import pandas as pd
import collections
collections.Iterable = collections.abc.Iterable
import numpy as np
import time as time_module
from .logger_utils import get_logger, log_step, log_api_request, log_api_response, log_data_processing

# Initialize logger for this module
logger = get_logger(__name__)

def get_delivery_orders_dataframe(delivery_orders):
    df_delivery_orders = {
        'id': [],
        'delivery_order_num' : [],
        'volume' :[],
        'quantity' : [],
        'loc_dest_id' : [],
    }
    for do in delivery_orders:
        df_delivery_orders['id'].append(do['id'])
        df_delivery_orders['delivery_order_num'].append(do['delivery_order_num'])
        df_delivery_orders['volume'].append(do['volume'])
        df_delivery_orders['quantity'].append(do['quantity'])
        df_delivery_orders['loc_dest_id'].append(do['loc_dest']['id'])

    return pd.DataFrame(df_delivery_orders)

def get_delivery_orders__with_demand_dataframe(delivery_orders):
    df_delivery_orders = {
        'id': [],
        'delivery_order_num' : [],
        'volume' :[],
        'quantity' : [],
        'loc_dest_id' : [],
        'demand':[]
    }
    for do in delivery_orders:
        df_delivery_orders['id'].append(do['id'])
        df_delivery_orders['delivery_order_num'].append(do['delivery_order_num'])
        df_delivery_orders['volume'].append(do['volume'])
        df_delivery_orders['quantity'].append(do['quantity'])
        df_delivery_orders['loc_dest_id'].append(do['loc_dest']['id'])
        df_delivery_orders['demand'].append(do['demand'])

    return pd.DataFrame(df_delivery_orders)

def get_location_dataframe(locations):
    if isinstance(locations, dict):
        locations = [locations]
    elif not isinstance(locations, list):
        raise ValueError("Expected locations to be list or dict")

    df_locations = {
        'loc_dest_id': [],
        'address': [],
        'latitude': [],
        'longitude': [],
        'dist_to_origin': [],
        'open_hour': [],
        'close_hour': [],
        'service_time': []
    }

    for location in locations:
        if isinstance(location, dict):
            try:
                df_locations['loc_dest_id'].append(location.get('id'))
                df_locations['address'].append(location.get('address'))
                df_locations['latitude'].append(float(location.get('latitude', 0.0)))
                df_locations['longitude'].append(float(location.get('longitude', 0.0)))
                df_locations['dist_to_origin'].append(float(location.get('dist_to_origin', 0.0)))
                df_locations['open_hour'].append(
                    datetime.strptime(location.get("open_hour", "0001-01-01T00:00:00.000Z"), "%Y-%m-%dT%H:%M:%S.%fZ").time()
                )
                df_locations['close_hour'].append(
                    datetime.strptime(location.get("close_hour", "0001-01-01T00:00:00.000Z"), "%Y-%m-%dT%H:%M:%S.%fZ").time()
                )
                df_locations['service_time'].append(float(location.get('service_time', 0.0)))
            except Exception as e:
                print("Error processing location:", location)
                print("Exception:", e)
        else:
            print("Skipping non-dict item in locations:", location)

    return pd.DataFrame(df_locations)

def get_trucks_model_sorted(trucks):
    trucks_model = []
    if not isinstance(trucks, list):
        trucks = list(trucks) if trucks else []
    for truck in trucks:
        if not isinstance(truck, dict):
            print("[dbg] Skipping non-dict truck:", truck)
            continue
        truck_type = truck.get("truck_type") or {}
        type_name = truck_type.get("name") or ""
        try:
            max_capacity = float(truck.get("max_individual_capacity_volume") or 0)
        except (TypeError, ValueError):
            max_capacity = 0.0
        try:
            current_volume = float(truck.get("current_volume") or 0)
        except (TypeError, ValueError):
            current_volume = 0.0
        if truck_type is None or not isinstance(truck_type, dict):
            print("[dbg] Truck has no truck_type dict:", json.dumps({
                "id": truck.get("id"),
                "type_id": truck.get("type_id"),
                "dc_id": truck.get("dc_id"),
                "truck_type": truck.get("truck_type"),
            }, default=str))
        if max_capacity == 0.0:
            print("[dbg] Truck max capacity parsed as 0.0:", json.dumps({
                "id": truck.get("id"),
                "raw_max_capacity": truck.get("max_individual_capacity_volume"),
            }, default=str))
        truck_model = Truck(
            id=truck.get("id"),
            plate_number=truck.get('plate_number'),
            type_id=truck.get("type_id"),
            dc_id=truck.get("dc_id"),
            type_name=type_name,
            max_individual_capacity_volume=max_capacity,
            current_volume=current_volume,
            cluster_order=-1
        )
        trucks_model.append(truck_model)
    return sorted(trucks_model, key=lambda t: t.get_max_capacity(), reverse=True)

@api_view(["GET"])
def testing(request, format=None):
    return Response("Your django app is running.....")

@api_view(["POST"])
def priority_optimization(request, format=None):
    start_time = time_module.time()
    
    # Log API request
    log_api_request(logger, "POST", "/api/priority")
    
    data = json.loads(request.body.decode('utf-8'))
    
    # Log input summary
    input_summary = {
        "trucks_count": len(data.get('trucks', [])) if isinstance(data.get('trucks'), list) else 0,
        "dest_locations_count": len(data.get('dest_location', [])) if isinstance(data.get('dest_location'), list) else 0,
        "origin_locations_count": len(data.get('ori_location', [])) if isinstance(data.get('ori_location'), list) else 0,
        "delivery_orders_count": len(data.get('delivery_orders', [])) if isinstance(data.get('delivery_orders'), list) else 0,
        "priority_mode": data.get('priority'),
    }
    log_step(logger, "Received optimization request", input_summary)
    
    try:
        if isinstance(data.get('trucks'), list) and len(data['trucks']) > 0:
            t0 = data['trucks'][0]
            logger.info(f"[INPUT] Sample truck: id={t0.get('id')}, type_id={t0.get('type_id')}, max_capacity={t0.get('max_individual_capacity_volume')}")
        
        if isinstance(data.get('delivery_orders'), list) and len(data['delivery_orders']) > 0:
            d0 = data['delivery_orders'][0]
            logger.info(f"[INPUT] Sample delivery order: id={d0.get('id')}, DO_num={d0.get('delivery_order_num')}, products={len(d0.get('ProductLine', []))}")
    except Exception as e:
        logger.warning(f"Error logging input samples: {e}")
    trucks = data['trucks']
    dest_location = data['dest_location']
    origin_location = data['ori_location']
    origin_latitude = origin_location[0]['latitude']
    origin_longitude = origin_location[0]['longitude']
    warehouse = [origin_latitude, origin_longitude]
    delivery_orders = data["delivery_orders"]
    priority = data["priority"]

    log_step(logger, "Calculating demand for delivery orders")
    for i in range(len(delivery_orders)):
        volumes = 0
        quantities = 0
        demand = 0
        for j in range(len(delivery_orders[i]["ProductLine"])):
            quantities += delivery_orders[i]["ProductLine"][j]["quantity"]
            volumes += (delivery_orders[i]["ProductLine"][j]["volume"])
            demand += (delivery_orders[i]["ProductLine"][j]["volume"]) *delivery_orders[i]["ProductLine"][j]["quantity"]
        delivery_orders[i]["demand"] = demand
        delivery_orders[i]["volume"] = volumes   
        delivery_orders[i]["quantity"] = quantities
    
    logger.info(f"[PROCESSING] Total demand calculated for {len(delivery_orders)} delivery orders")
    
    log_step(logger, "Building truck models and sorting by capacity")
    trucks_model = get_trucks_model_sorted(trucks)
    logger.info(f"[DATA] Created {len(trucks_model)} truck models")
    
    try:
        if len(trucks_model) > 0:
            logger.info(f"[DATA] Largest truck: id={trucks_model[0].id}, max_capacity={trucks_model[0].max_individual_capacity_volume}")
    except Exception as e:
        logger.warning(f"Error logging truck model details: {e}")
    
    log_step(logger, "Creating dataframes for delivery orders and locations")
    df_delivery_orders = get_delivery_orders__with_demand_dataframe(delivery_orders)
    df_do_dest_location = get_location_dataframe(dest_location)
    df_do_origin_location = get_location_dataframe(origin_location[0])
    
    log_data_processing(logger, "Dataframe creation", 
        {"delivery_orders": len(delivery_orders), "locations": len(dest_location)},
        {"df_delivery_orders_shape": df_delivery_orders.shape, 
         "df_dest_location_shape": df_do_dest_location.shape,
         "df_origin_location_shape": df_do_origin_location.shape})

    log_step(logger, "Merging dataframes and calculating distances")
    df = pd.merge(df_delivery_orders, df_do_dest_location, on='loc_dest_id', how='left')  
    df['distance_from_origin'] = df.apply(lambda row: geodesic_distance((row['latitude'], row['longitude']), warehouse), axis=1)
    df['relative_position'] = df['longitude'].apply(lambda x: relative_position(x, warehouse[1]))
    df['truck_id'] = -1
    min_max_scaler = MinMaxScaler()
    df[['distance_from_origin', 'demand_scaled']] = min_max_scaler.fit_transform(df[['distance_from_origin', 'demand']])   

    log_step(logger, f"Calculating priority using mode: {priority}")
    if(priority=="balance"):
        df['priority'] = df.apply(calculate_balance_priority, axis=1)
    elif(priority=="distance"):
        df['priority'] = df.apply(calculate_distance_priority, axis=1)
    elif(priority=="load"):
        df['priority'] = df.apply(calculate_load_priority, axis=1)
    elif(priority=="emission"):
        df['priority'] = df.apply(calculate_emission_priority, axis=1)

    df_positive = df[df['priority'] >= 0].sort_values(by='priority', ascending=False)
    df_negative = df[df['priority'] < 0].sort_values(by='priority', ascending=True)

    df_sorted = pd.concat([df_positive, df_negative])
    logger.info(f"[DATA] Sorted {len(df_sorted)} orders by priority ({len(df_positive)} positive, {len(df_negative)} negative)")

    log_step(logger, "Starting truck assignment and route optimization")
    shipment = []
    unassigned_orders = []
    truck_counter = 0
    
    for truck in trucks_model:
        truck_counter += 1
        logger.info(f"[TRUCK {truck_counter}/{len(trucks_model)}] Processing truck_id={truck.get_id()}, capacity={truck.get_max_capacity()}")
        
        if len(df_sorted[df_sorted['truck_id'] == -1]) > 0:
            assigned_count = 0
            for _, order_location in df_sorted[df_sorted['truck_id'] == -1].iterrows():
                order_total_volume = float(order_location['demand'])
                if order_total_volume <= truck.get_avaiable_capacity():
                    df_sorted.loc[(df_sorted['id'] == order_location['id']), 'truck_id'] = truck.get_id()
                    truck.add_new_order(order_total_volume)
                    assigned_count += 1
            
            logger.info(f"[TRUCK {truck_counter}] Assigned {assigned_count} orders, current_capacity={truck.get_current_capacity()}/{truck.get_max_capacity()}")
                    
            unique_loc_dest_ids = df_sorted[df_sorted['truck_id'] == truck.get_id()]['loc_dest_id'].unique()
            filtered_loc = df_sorted[df_sorted['loc_dest_id'].isin(unique_loc_dest_ids)]   

            if truck.get_current_capacity() > 0:
                logger.info(f"[TRUCK {truck_counter}] Computing routes for {len(unique_loc_dest_ids)} unique locations")
                
                filtered_origin_loc = pd.concat([pd.DataFrame(df_do_origin_location), filtered_loc]).drop_duplicates().reset_index(drop=True)
                
                log_step(logger, f"[TRUCK {truck_counter}] Calculating distance/time/emission matrices")
                _, times, emissions = get_distance_runner(filtered_origin_loc)
                
                times = [[t / 60.0 for t in row] for row in times]
                time_windows = list(zip(
                    filtered_origin_loc['open_hour'].apply(lambda x: x.hour * 60 + x.minute),
                    filtered_origin_loc['close_hour'].apply(lambda x: x.hour * 60 + x.minute)
                ))
                services_time = list(filtered_origin_loc['service_time'])
                data = {}
                time_windows[0] = (480,480)
                services_time[0] = 0
                data['time_matrix'] = times
                data['emission_matrix'] = emissions
                data['time_windows'] = time_windows
                data['service_times'] = services_time
                data['num_vehicles'] = 1
                data['depot'] = 0
                data['objective_type'] = 'emission' if priority == 'emission' else 'time'
                
                log_step(logger, f"[TRUCK {truck_counter}] Running Google OR-Tools optimization")
                result = google_or(data=data)
                
                if isinstance(result, dict):
                    logger.info(f"[TRUCK {truck_counter}] OR-Tools result: {len(result.get('reachable', []))} reachable, {len(result.get('unreachable', []))} unreachable")
                else:
                    logger.warning(f"[TRUCK {truck_counter}] OR-Tools returned: {result}")
                       
                reachable_locations_index = result['reachable']                
                actual_reachable_locations_index = []
                actual_unreachable_locations_index = []

                actual_reachable_locations_id = []
                actual_unreachable_locations_id = []
                
                arbitrary_date = datetime.today().date()
                prev_loc_index = 0
                prev_eta = datetime.combine(arbitrary_date, time(hour=8, minute=0))

                loc_dest_info = []
                total_time = 0
                total_time_with_waiting = 0
                total_distance = 0
                
                log_step(logger, f"[TRUCK {truck_counter}] Validating routes and calculating ETAs")
                for index , loc_index in enumerate(reachable_locations_index):
                    loc = filtered_origin_loc.iloc[loc_index]
                    prev_loc = filtered_origin_loc.iloc[prev_loc_index]
                    loc_lon_lat = (loc['latitude'], loc['longitude'])
                    prev_loc_lon_lat = (prev_loc['latitude'], prev_loc['longitude'])
                    
                    prev_to_loc = get_directions(prev_loc_lon_lat, loc_lon_lat)
                    if loc_index == 0:
                        break
                    
                    estimated_travel_time = ((prev_to_loc[0]['legs'][0]['duration']['value']) / 60 ) + prev_loc['service_time'] 

                    eta = (prev_eta + timedelta(minutes=estimated_travel_time)).time()
                    if(eta <loc['close_hour']):
                        estimated_travel_distance = prev_to_loc[0]['legs'][0]['distance']['value']
                
                        actual_reachable_locations_index.append(loc_index)
                        actual_reachable_locations_id.append(loc['loc_dest_id'])
                        loc_dest_info.append({
                            "loc_dest_id" : loc['loc_dest_id'],
                            "queue": index + 1,
                            "eta": eta.strftime('%H:%M:%S'),
                            "travel_time" :estimated_travel_time,
                            "travel_distance" :estimated_travel_distance
                        })
                        if (eta < loc['open_hour']):
                            open_hour_dt = datetime.combine(arbitrary_date, loc['open_hour'])
                            eta_dt = datetime.combine(arbitrary_date, eta)
                            waiting_duration = open_hour_dt - eta_dt
                            waiting_duration_minutes = waiting_duration.total_seconds() / 60.0
                            total_time_with_waiting += (waiting_duration_minutes + estimated_travel_time)
                            logger.debug(f"[TRUCK {truck_counter}] Location {loc['loc_dest_id']}: arrived early, waiting {waiting_duration_minutes:.1f} min")

                            eta_with_waiting = prev_eta + timedelta(minutes=(waiting_duration_minutes + estimated_travel_time))
                            prev_eta = eta_with_waiting
                        else:
                            prev_eta = datetime.combine(arbitrary_date, eta)
                            total_time_with_waiting += estimated_travel_time
                        total_time += estimated_travel_time
                        total_distance += estimated_travel_distance
                        prev_loc_index = loc_index
                    else:
                        actual_unreachable_locations_index.append(loc_index)
                        actual_unreachable_locations_id.append(loc['loc_dest_id'])
                        logger.warning(f"[TRUCK {truck_counter}] Location {loc['loc_dest_id']} unreachable: ETA {eta} after close_hour {loc['close_hour']}")
                
                actual_reachable_locations = filtered_origin_loc.iloc[actual_reachable_locations_index]    
                actual_unreachable_locations = filtered_origin_loc.iloc[actual_unreachable_locations_index]
                
                # Remove unreachable orders from truck
                for _ , unreachable_order in df_sorted[(df_sorted['loc_dest_id'].isin(actual_unreachable_locations_id)) & (df_sorted['truck_id'] == truck.get_id())].iterrows():
                    order_total_volume = float(unreachable_order['demand'])
                    truck.drop_order(order_total_volume)

                df_sorted.loc[
                    (df_sorted['loc_dest_id'].isin(actual_unreachable_locations_id)) & 
                    (df_sorted['truck_id'] == truck.get_id()), 
                    'truck_id'
                ] = -1

                log_step(logger, f"[TRUCK {truck_counter}] Fetching route coordinates")
                list_of_location_routes = []
                all_cords = []
                prev_locaction = filtered_origin_loc.iloc[0]
                for index, location in actual_reachable_locations.iterrows():
                    list_of_location_routes.append({'location_id': location['loc_dest_id']})
                    for cord in fetch_concatenate_route(location['latitude'], location['longitude'], prev_locaction['latitude'], prev_locaction['longitude']):
                        all_cords.append(list(cord))
                    prev_locaction = location
        

                reachable_loc_dest_ids = set(actual_reachable_locations_id)
                valid_dos = df_sorted[
                    (df_sorted['truck_id'] == truck.get_id()) &
                    (df_sorted['loc_dest_id'].isin(reachable_loc_dest_ids))
                ]
                
                shipment_entry = {
                        "id_truck": truck.get_id(),
                        "delivery_orders": [{"delivery_order_id": do_id} for do_id in valid_dos["id"].tolist()],
                        "location_routes": list_of_location_routes,  
                        "all_coords": all_cords,
                        "total_time": total_time,       
                        "total_time_with_waiting": total_time_with_waiting,
                        "total_dist": total_distance,
                        "additional_info" : loc_dest_info,
                        "current_capacity": truck.get_current_capacity(),
                        "max_capacity": truck.get_max_capacity(),   
                }
                shipment.append(shipment_entry)
                
                logger.info(f"[TRUCK {truck_counter}] COMPLETED - {len(valid_dos)} orders, {len(list_of_location_routes)} locations, distance={total_distance}m, time={total_time:.1f}min")
               
    
        all_trucks_full = all(truck.get_avaiable_capacity() == 0 for truck in trucks_model)
        if all_trucks_full: 
            logger.warning("All trucks are full. Remaining orders will be unassigned.")
            unassigned_orders.extend(
                [{"delivery_order_id": row['id']} for _, row in df_sorted.iterrows()]
            )
            continue 
    
    unassigned_orders.extend([{'delivery_order_id': row['id']} for _, row in df_sorted[df_sorted['truck_id'] == -1].iterrows()])

    if unassigned_orders:
        logger.warning(f"[RESULT] {len(unassigned_orders)} orders could not be assigned to any truck")
        shipment.append({
            "id_truck": -1,
            "delivery_orders": unassigned_orders
    })

    # Log final response
    duration = time_module.time() - start_time
    response_summary = {
        "shipments_count": len([s for s in shipment if s.get('id_truck') != -1]),
        "unassigned_orders_count": len(unassigned_orders),
        "total_trucks_used": len([s for s in shipment if s.get('id_truck') != -1]),
    }
    log_api_response(logger, "/api/priority", 200, duration, response_summary)
    
    return Response(shipment, 200)

def relative_position(longitude, reference_longitude):
    return '+' if longitude > reference_longitude else '-'

def calculate_balance_priority(row):
    priority_value = 0.5 * row['demand_scaled'] + 0.5 * row['distance_from_origin']
    return priority_value if row['relative_position'] == '+' else -priority_value

def calculate_distance_priority(row):
    priority_value = 0.1 * row['demand_scaled'] + 0.9 * row['distance_from_origin']
    return priority_value if row['relative_position'] == '+' else -priority_value

def calculate_load_priority(row):
    priority_value = 0.9 * row['demand_scaled'] + 0.1 * row['distance_from_origin']
    return priority_value if row['relative_position'] == '+' else -priority_value

def calculate_emission_priority(row):
    # Prioritize closer locations (lower distance) to minimize emissions
    # We invert distance_from_origin because we want smaller distances to have higher priority
    priority_value = 1.0 * (1.0 - row['distance_from_origin']) 
    return priority_value if row['relative_position'] == '+' else -priority_value
