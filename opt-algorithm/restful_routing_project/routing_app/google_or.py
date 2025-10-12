from ortools.constraint_solver import pywrapcp
from ortools.constraint_solver import routing_enums_pb2

def print_solution(data, manager, routing, solution):
    print(f'Objective: {solution.ObjectiveValue()}')
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
        print(plan_output)
        total_time += solution.Min(time_var)
    print('Total time of all routes: {} min'.format(total_time))
    return location_index

def google_or(data):
    manager = pywrapcp.RoutingIndexManager(len(data['time_matrix']), data['num_vehicles'], data['depot'])
    routing = pywrapcp.RoutingModel(manager)
    
    def time_callback(from_index, to_index):
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return data['time_matrix'][from_node][to_node] + data['service_times'][from_node]

    transit_callback_index = routing.RegisterTransitCallback(time_callback)
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
            routing.AddDisjunction([index], 100000)

    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC)

    solution = routing.SolveWithParameters(search_parameters)

    if solution:
        reachable_location = print_solution(data, manager, routing, solution)
        unreachable_location = []
        for location_idx in range(1, len(data['time_windows'])):
            if routing.IsStart(manager.NodeToIndex(location_idx)) or routing.IsEnd(manager.NodeToIndex(location_idx)):
                continue
            if solution.Value(routing.NextVar(manager.NodeToIndex(location_idx))) == manager.NodeToIndex(location_idx):
                print(f"Location {location_idx} could not be visited within its time window.")
                unreachable_location.append(location_idx)
        return {
            "reachable": reachable_location,
            "unreachable": unreachable_location
        }
    else:
        return "No solution found."