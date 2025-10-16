from rest_framework.decorators import api_view
from rest_framework.response import Response
from .algorithms.brkga import run_layouting_algorithm
import time

@api_view(['POST'])
def layouting_boxes(request):
    t0 = time.time()
    print(f"[Layouting][View] START method=POST path=/api/layouting")
    shipment_data = request.data.get("shipment_data")
    if not shipment_data:
        print("[Layouting][View] ERROR: shipment_data missing")
        return Response({"error": "shipment_data is required"}, status=400)

    selected_container = request.data.get("container")
    shipment_id = request.data.get("shipment_id")
    shipment_num = request.data.get("shipment_num")

    try:
        do_count = len(shipment_data.keys()) if isinstance(shipment_data, dict) else -1
        total_boxes = sum(sum(v[-1] for v in do_map.values()) for do_map in shipment_data.values()) if isinstance(shipment_data, dict) else -1
        print(f"[Layouting][View] INPUT shipment_id={shipment_id} shipment_num={shipment_num} container={selected_container} DOs={do_count} boxes={total_boxes}")
    except Exception as e:
        print(f"[Layouting][View] INPUT summary error: {e}")

    algo_start = time.time()
    result = run_layouting_algorithm(shipment_data, selected_container, shipment_id, shipment_num)
    algo_dur = time.time() - algo_start

    t_total = time.time() - t0
    print(f"[Layouting][View] DONE shipment_id={shipment_id} algoMs={algo_dur*1000:.0f} totalMs={t_total*1000:.0f}")

    return Response(result)
