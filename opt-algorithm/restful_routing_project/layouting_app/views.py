from rest_framework.decorators import api_view
from rest_framework.response import Response
from .algorithms.brkga import run_layouting_algorithm

@api_view(['POST'])
def layouting_boxes(request):
    shipment_data = request.data.get("shipment_data")
    if not shipment_data:
        return Response({"error": "shipment_data is required"}, status=400)

    selected_container = request.data.get("container")
    shipment_id = request.data.get("shipment_id")
    shipment_num = request.data.get("shipment_num")

    result = run_layouting_algorithm(shipment_data, selected_container, shipment_id, shipment_num)

    return Response(result)
