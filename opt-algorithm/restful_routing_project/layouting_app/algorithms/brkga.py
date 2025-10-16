import math
import time
import numpy as np
import random
import copy
import json
import re
# from .model import PlacementProcedure, BRKGA
from .model_testing import PlacementProcedure, BRKGA

container_options = {
    "BLIND_VAN": (255, 146, 130),
    "CDE": (350, 160, 160)
}

def run_layouting_algorithm(shipment_data, selected_container, shipment_id, shipment_num):
    base_container = selected_container
    print("[Layouting][Algo] START shipment_id=", shipment_id, "container=", selected_container)
    try:
        do_count = len(shipment_data.keys()) if isinstance(shipment_data, dict) else -1
        total_boxes = sum(sum(v[-1] for v in do_map.values()) for do_map in shipment_data.values()) if isinstance(shipment_data, dict) else -1
        print("[Layouting][Algo] INPUT DOs=", do_count, "boxes=", total_boxes)
    except Exception as e:
        print("[Layouting][Algo] INPUT summary error:", str(e))

    # Mulai menghitung waktu
    start_time = time.time()

    boxes = []
    box_DO_map = []
    sorted_DOs = list(shipment_data.keys())[::-1]

    print("[Layouting][Algo] Sorted DOs:", sorted_DOs)

    for do_idx, do in enumerate(sorted_DOs):
        for box_id, dims in shipment_data[do].items():
            length, width, height, quantity = dims
            for _ in range(quantity):
                boxes.append((length, width, height))
                box_DO_map.append(do_idx)

    print("[Layouting][Algo] Boxes count:", len(boxes))

    inputs = {
        'v': boxes,
        'V': [container_options[selected_container]],
        'box_DO_map': box_DO_map,
        'DO_count': len(sorted_DOs),
        'DOs_num': sorted_DOs
    }

    # Step 1: Jalankan algoritma untuk container awal
    step1_start = time.time()
    model = BRKGA(inputs, 
             num_generations=20,
             num_individuals=30,
             num_elites=5, 
             num_mutants=5, 
             eliteCProb=0.8,
             multiProcess=True
        )
    model.fit(patient=10, verbose=False)
    decoder = PlacementProcedure(inputs, model.solution)
    fitness = decoder.evaluate()
    utilization = decoder.get_utilization()  # Dapatkan utilization
    step1_ms = (time.time() - step1_start) * 1000
    print("[Layouting][Algo] Step1 container=", selected_container, "fitness=", fitness, "util=", f"{utilization*100:.2f}%", "durMs=", int(step1_ms))

    # Step 2: Jika BLIND_VAN dan fitness >= 2, switch ke CDE
    if selected_container == "BLIND_VAN" and math.floor(fitness) >= 2:
        print("[Layouting][Algo] Switch to CDE due to fitness >= 2")
        selected_container = "CDE"
        inputs['V'] = [container_options[selected_container]]
        
        step2_start = time.time()
        model = BRKGA(inputs, 
                    num_generations=20,
                    num_individuals=30,
                    num_elites=5, 
                    num_mutants=5, 
                    eliteCProb=0.8,
                    multiProcess=True
             )
        model.fit(patient=15, verbose=False)
        decoder = PlacementProcedure(inputs, model.solution)
        fitness = decoder.evaluate()
        utilization = decoder.get_utilization()  # Update utilization
        step2_ms = (time.time() - step2_start) * 1000
        print("[Layouting][Algo] Step2 container=", selected_container, "fitness=", fitness, "util=", f"{utilization*100:.2f}%", "durMs=", int(step2_ms))
        
        if math.floor(fitness) > 1:
            required_bins = math.ceil(fitness)
            if required_bins > 10 or required_bins >= 10000:
                print("[Layouting][Algo] Capping required bins:", required_bins, "-> 10")
                required_bins = 10
            inputs['V'] = [container_options[selected_container]] * required_bins

            step3_start = time.time()
            model = BRKGA(inputs, 
                    num_generations=20,
                    num_individuals=30,
                    num_elites=5, 
                    num_mutants=5, 
                    eliteCProb=0.8,
                    multiProcess=True
                    )
            model.fit(patient=10, verbose=False)
            decoder = PlacementProcedure(inputs, model.solution)
            fitness = decoder.evaluate()
            utilization = decoder.get_utilization()  # Update utilization
            step3_ms = (time.time() - step3_start) * 1000
            print("[Layouting][Algo] Step3 container=", selected_container, "fitness=", fitness, "util=", f"{utilization*100:.2f}%", "durMs=", int(step3_ms))

    # Hitung total waktu eksekusi
    running_time = time.time() - start_time
    print("[Layouting][Algo] DONE totalSec=", f"{running_time:.2f}")

    # Format output
    output_layout = []
    for bin in decoder.Bins[:decoder.num_opend_bins]:
        for i, box_data in enumerate(bin.load_items):
            min_corner, max_corner, do_index = box_data
            do_num = inputs['DOs_num'][do_index]
            output_layout.append({
                "do_num": do_num,
                "box_id": i + 1,
                "do_index": int(do_index),
                "min_corner": [float(coord) for coord in min_corner],
                "max_corner": [float(coord) for coord in max_corner],
                "do_priority": do_index
            })

    output_layout.sort(key=lambda x: x["do_priority"])

    return {
        "shipment_id": shipment_id,
        "shipment_num": shipment_num,
        "fitness": fitness,
        "utilization": utilization,  # Tambahkan utilization
        "running_time": running_time,  # Tambahkan running time
        "base_container": base_container,
        "selected_container": selected_container,
        "layout": output_layout,
    }