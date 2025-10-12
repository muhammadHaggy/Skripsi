import {
  getAllTrucks,
  getTruckbyID,
  getCost,
  getCostId,
} from "../repositories/truck-repository.js";
import {
  getLocationByID,
  getDCLocations,
  getLocationByListId,
} from "../repositories/locations-repository.js";
import {
  getDOslbyID,
  updateStatusDO,
  getAllDOsOptimization,
} from "../repositories/delivery-order-repository.js";
import {
  createShipment,
  countShipment,
  createShipmentDO,
  createShipmentLocation,
} from "../repositories/shipment-repository.js";
import { IdGenerator } from "../utils/helper.js";
import axios from "axios";

const priorityOptimizationService = async (request) => {
  const dc_id = parseInt(request.headers.dc_id);
  const list_delivery_orders = request.body.delivery_orders_id;
  const priority = request.body.priority;

  const delivery_orders = await getAllDOsOptimization(
    list_delivery_orders,
    null,
    null,
    null,
    null,
    false
  );

  const list_destination_location = [
    ...new Set(delivery_orders.map((do_) => do_.loc_dest.id)),
  ];
  const dest_location = await getLocationByListId(list_destination_location);
  const origin_location = await getDCLocations(true, dc_id);
  const trucks = await getAllTrucks(dc_id, "AVAILABLE", null, null);

  const apiUrl = process.env.DJANGO_URL + "/api/priority";
  const requestData = {
    trucks,
    delivery_orders,
    ori_location: origin_location,
    dest_location,
    priority,
  };

  try {
    const response = await axios.post(apiUrl, requestData, {
      headers: {
        Authorization: process.env.OPTIMIZATION_KEY,
        "Content-Type": "application/json",
      },
    });

    const response_data = response.data;
    const shipments = [];
    const failedDO = [];

    for (const shipment of response_data) {
      const delivery_orders = [];

      for (const doItem of shipment.delivery_orders) {
        const delivery_order = await getDOslbyID(doItem.delivery_order_id);
        delivery_orders.push(delivery_order);
      }

      if (shipment.id_truck !== -1) {
        const locations = [];

        for (const loc of shipment.location_routes) {
          const location = await getLocationByID(loc.location_id);
          locations.push(location);
        }

        const truck = await getTruckbyID(shipment.id_truck);
        const fuel_consumption = parseInt(
          truck.fuel_consumption_liters_per_km.split(":")[1]
        );
        const fuel_total = shipment.total_dist / 1000 / fuel_consumption;
        const cost_id = await getCostId(truck.id);
        const bbm_cost = await getCost(cost_id);
        const total_cost = bbm_cost.cost_value * fuel_total;

        shipments.push({
          truck,
          delivery_orders,
          location_routes: locations,
          all_coords: shipment.all_coords,
          total_time: shipment.total_time,
          total_time_with_waiting: shipment.total_time_with_waiting,
          total_dist: shipment.total_dist,
          additional_info: shipment.additional_info,
          current_capacity: shipment.current_capacity,
          max_capacity: shipment.max_capacity,
          shipment_cost: total_cost,
        });
      } else {
        failedDO.push(...delivery_orders);
      }
    }

    // No valid shipment
    if (shipments.length === 0) {
      return {
        shipments: [],
        failedDO,
        status: 200,
      };
    }

    const shipmentResponse = [];
    for (const shipment of shipments) {
      const shipment_count = await countShipment();
      const createdShipment = await createShipment({
        shipment_num: await IdGenerator("shipment", shipment_count + 1),
        total_dist: shipment.additional_info.reduce(
          (total, info) => total + info.travel_distance,
          0
        ),
        total_dist_unit: "meter",
        total_time: shipment.total_time,
        total_time_unit: "menit",
        total_time_with_waiting: shipment.total_time_with_waiting,
        total_time_with_waiting_unit: "menit",
        all_coords: JSON.stringify(shipment.all_coords),
        total_volume: shipment.current_capacity,
        truck_id: shipment.truck.id,
        status: "DRAF",
        created_at: new Date().toISOString(),
        created_by: "User",
        shipment_cost: shipment.shipment_cost,
      });

      await Promise.all(
        shipment.additional_info.map((info) =>
          createShipmentLocation({
            shipment_id: createdShipment.id,
            location_id: info.loc_dest_id,
            queue: info.queue,
            travel_time: info.travel_time,
            travel_distance: info.travel_distance,
            travel_time_unit: "menit",
            travel_distance_unit: "meter",
          })
        )
      );

      await Promise.all(
        shipment.delivery_orders.map(async (deliveryOrder) => {
          await createShipmentDO({
            shipment_id: createdShipment.id,
            delivery_order_id: deliveryOrder.id,
          });
          await updateStatusDO("IN_CALCULATION", deliveryOrder.id);
        })
      );

      shipmentResponse.push({
        ...shipment,
        shipment_num: createdShipment.shipment_num,
      });
    }

    return {
      shipments: shipmentResponse,
      failedDO,
      status: 200,
    };
  } catch (error) {
    return {
      status: error?.response?.status || 500,
      message: error?.message || "Unknown error",
    };
  }
};

export { priorityOptimizationService };
