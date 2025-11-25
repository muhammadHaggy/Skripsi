from ortools.constraint_solver import pywrapcp
from ortools.constraint_solver import routing_enums_pb2
from .logger_utils import get_logger

logger = get_logger(__name__)

def print_solution(data, manager, routing, solution):
    logger.info(f"[OR-Tools] Solution found with objective value: {solution.ObjectiveValue()}")
    time_dimension = routing.GetDimensionOrDie('Time')
    total_time = 0
    location_index = []
    for vehicle_id in range(data['num_vehicles']):
        index = routing.Start(vehicle_id)
        plan_output = f'Route for vehicle {vehicle_id}:\n'
        while not routing.IsEnd(index):
            time_var = time_dimension.CumulVar(index)
            plan_output += f'{manager.IndexToNode(index)} Time({solution.Min(time_var)}, {solution.Max(time_var)}) -> '
            index = solution.Value(routing.NextVar(index))
            location_index.append(manager.IndexToNode(index))
        time_var = time_dimension.CumulVar(index)
        plan_output += f'{manager.IndexToNode(index)} Time({solution.Min(time_var)}, {solution.Max(time_var)})\n'
        plan_output += 'Time of the route: {} min\n'.format(solution.Min(time_var))
        logger.debug(plan_output)
        total_time += solution.Min(time_var)
    logger.info(f"[OR-Tools] Total time of all routes: {total_time} min")
    return location_index

def google_or(data):
    logger.info(f"[google_or] START - Optimizing {len(data['time_matrix'])} locations, objective={data.get('objective_type', 'time')}")
    manager = pywrapcp.RoutingIndexManager(len(data['time_matrix']), data['num_vehicles'], data['depot'])
    routing = pywrapcp.RoutingModel(manager)
    
    def time_callback(from_index, to_index):
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return data['time_matrix'][from_node][to_node] + data['service_times'][from_node]

    transit_callback_index = routing.RegisterTransitCallback(time_callback)

    # Define cost function based on objective
    if data.get('objective_type') == 'emission' and 'emission_matrix' in data:
        def emission_callback(from_index, to_index):
            from_node = manager.IndexToNode(from_index)
            to_node = manager.IndexToNode(to_index)
            # Multiply by 100 to keep precision as integers (OR-Tools requires integers)
            return int(data['emission_matrix'][from_node][to_node] * 100)
        
        emission_callback_index = routing.RegisterTransitCallback(emission_callback)
        routing.SetArcCostEvaluatorOfAllVehicles(emission_callback_index)
    else:
        routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    time = 'Time'
    routing.AddDimension(
        transit_callback_index,
        30,
        100000,
        False,
        time)
    time_dimension = routing.GetDimensionOrDie(time)

    for location_idx, time_window in enumerate(data['time_windows']):
        if location_idx == data['depot']:
            index = manager.NodeToIndex(location_idx)
            time_dimension.CumulVar(index).SetRange(time_window[0], time_window[1])
        else:
            index = manager.NodeToIndex(location_idx)
            time_dimension.CumulVar(index).SetRange(time_window[0], time_window[1])
            # Increased penalty to 10M to ensure locations are visited even in emission mode
            # where emission costs can be high (e.g., 1200g CO2 * 100 = 120,000)
            routing.AddDisjunction([index], 10000000)

    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC)

    solution = routing.SolveWithParameters(search_parameters)

    if solution:
        logger.info("[google_or] Solution found, processing results")
        reachable_location = print_solution(data, manager, routing, solution)
        unreachable_location = []
        for location_idx in range(1, len(data['time_windows'])):
            if routing.IsStart(manager.NodeToIndex(location_idx)) or routing.IsEnd(manager.NodeToIndex(location_idx)):
                continue
            if solution.Value(routing.NextVar(manager.NodeToIndex(location_idx))) == manager.NodeToIndex(location_idx):
                logger.warning(f"[google_or] Location {location_idx} could not be visited within its time window")
                unreachable_location.append(location_idx)
        
        result = {
            "reachable": reachable_location,
            "unreachable": unreachable_location
        }
        logger.info(f"[google_or] COMPLETE - {len(reachable_location)} reachable, {len(unreachable_location)} unreachable")
        return result
    else:
        logger.error("[google_or] No solution found")
        return "No solution found."