import {
  getAllShipmentAdmin,
  getShipments,
  getShipmentsForMobile,
  searchShipmentsForMobile,
  getDetailShipmentByIdForMobile,
  getDetailShipmentByIdForWeb,
  getShipmentByNum,
  updateShipment,
  updateTruckTypeByShipmentId,
} from "../repositories/shipment-repository.js";
import {
  getDeliveryOrdersByShipmentId,
  updateStatusDO,
} from "../repositories/delivery-order-repository.js";
import axios from "axios";

const getAllShipmentAdminService = async (skip, limit) => {
  return await getAllShipmentAdmin(skip, limit);
};

const getAllShipmentService = async (dc_id, skip, limit) => {
  return await getShipments(dc_id, skip, limit);
};

const getBoxLayoutingCoordinatesService = async (id) => {
  // ini requestnya shipment_id aja
  // terus dapetin detail shipment by id (belum ada keknya servicenya) nanti ada data shipment kayak gini (done)
  const shipment = await getDetailShipmentWebService(id);
  const apiUrl = process.env.DJANGO_URL + "/api/layouting";

    const shipmentData = {};
    
    const doMap = {};
    shipment.delivery_orders.forEach(doItem => {
        doMap[doItem.loc_dest_id] = doItem;
    });
    
    // Process DOs in the order of location_routes
    shipment.location_routes.forEach(route => {
        const doItem = doMap[route.id];
        if (doItem) {
            const doKey = `${doItem.delivery_order_num}`;
            shipmentData[doKey] = {};
            
            doItem.boxes.forEach((box, boxIndex) => {
                shipmentData[doKey][boxIndex + 1] = [
                    box.length,
                    box.width, 
                    box.height,
                    box.quantity
                ];
            });
        }
    });
      
    const rawContainerName = shipment.truck?.truck_type?.name || 'Blind Van';
    const normalizedContainer = String(rawContainerName).toUpperCase().replace(/\s+/g, '_'); // e.g., 'Blind Van' -> 'BLIND_VAN'
    const requestData = {
      shipment_data: shipmentData,
      container: normalizedContainer,
      shipment_id: id,
      shipment_num: shipment.shipment_num,
    };
    
    try {
        const response = await axios.post(apiUrl, requestData, {
            headers: {
                Authorization: process.env.OPTIMIZATION_KEY,
                'Content-Type': 'application/json',
                Accept: '*/*',
                'Accept-Encoding': 'gzip, deflate, br',
                Connection: 'keep-alive',
            },
        })
        return [response.data]
    } catch (error) {
        return [error.message]
    }
}

const getAllMobileShipmentsService = async (dc_id, skip, limit) => {
  const { shipments, total } = await getShipmentsForMobile(dc_id, skip, limit);
  return {
    shipments: shipments.map((s) => ({
      id: s.id,
      shipment_num: s.shipment_num,
      status: s.status,
      eta: s.eta,
    })),
    total,
  };
};

const getDetailMobileShipmentService = async (id) => {
  const s = await getDetailShipmentByIdForMobile(id);

  if (!s) {
    throw new Error("Shipment not found");
  }

  return {
    id: s.id,
    shipment_num: s.shipment_num,
    status: s.status,
    eta: s.eta,
    total_dist: s.total_dist,
    total_time: s.total_time,
    plate_number: s.truck?.plate_number || "",
    deliveryOrders: s.ShipmentDO.map((doItem) => ({
      id: doItem.delivery_order.id,
      delivery_order_num: doItem.delivery_order.delivery_order_num,
      boxes: doItem.delivery_order.BoxDO.map((boxDo) => ({
        id: boxDo.box.id,
        name: boxDo.box.name,
        height: boxDo.box.height,
        width: boxDo.box.width,
        length: boxDo.box.length,
        pcUrl: boxDo.box.pcUrl,
        scannedAt: boxDo.box.scanned_at,
        quantity: boxDo.quantity,
      })),
    })),
  };
};

const searchAllMobileShipmentsService = async (request) => {
  const dc_id = request.decodedToken.role.dc_id;
  const shipments = await searchShipmentsForMobile(
    request.query.shipment_num,
    dc_id
  );

  return shipments.map((s) => ({
    id: s.id,
    shipment_num: s.shipment_num,
    status: s.status,
    eta: s.eta,
  }));
};

const getDetailShipmentWebService = async (id) => {
  const shipment = await getDetailShipmentByIdForWeb(id);
  if (!shipment) throw new Error("Shipment not found");

  const truck = shipment.truck;
  const deliveryOrdersRaw = shipment.ShipmentDO.sort(
    (a, b) => a.queue - b.queue
  ).map((sdo) => sdo.delivery_order);

  const locationRoutes = shipment.ShipmentLocation.map((sl) => sl.location);
  const defaultStartTime = new Date();
  defaultStartTime.setHours(8, 0, 0, 0);

  let accumulatedMinutes = 0;

  const additionalInfo = shipment.ShipmentLocation.map((sl) => {
    accumulatedMinutes += sl.travel_time ?? 0;
    const etaDate = new Date(
      defaultStartTime.getTime() + accumulatedMinutes * 60000
    );

    return {
      loc_dest_id: sl.location_id,
      queue: sl.queue,
      eta: etaDate.toTimeString().split(" ")[0],
      travel_time: sl.travel_time,
      travel_distance: sl.travel_distance,
    };
  });

  const current_capacity = deliveryOrdersRaw.reduce((acc, do_) => {
    const productLines = do_.ProductLine ?? [];
    let orderDemand = 0;
    for (const pl of productLines) {
      if (pl.volume != null && pl.quantity != null) {
        orderDemand += pl.volume * pl.quantity;
      }
    }
    return acc + orderDemand;
  }, 0);

  const deliveryOrders = deliveryOrdersRaw.map(
    ({ ProductLine, BoxDO, ...do_ }) => ({
      ...do_,
      boxes:
        BoxDO?.map((bd) => ({
          ...bd.box,
          quantity: bd.quantity,
        })) ?? [],
    })
  );

  return {
    shipment_num: shipment.shipment_num,
    isSaved: shipment.isSaved,
    total_time: shipment.total_time,
    total_time_with_waiting: shipment.total_time_with_waiting,
    total_dist: shipment.total_dist,
    shipment_cost: shipment.shipment_cost,
    max_capacity: truck?.max_individual_capacity_volume ?? 0,
    current_capacity: current_capacity,
    truck,
    delivery_orders: deliveryOrders,
    location_routes: locationRoutes,
    all_coords: JSON.parse(shipment.all_coords),
    additional_info: additionalInfo,
  };
};

const simpanShipmentStatusService = async (request) => {
  const shipmentNum = request.params.shipmentNum;

  const shipment = await getShipmentByNum(shipmentNum);

  if (!shipment) {
    console.error("Shipment not found");
    throw new Error("Shipment not found");
  }

  const newStatus = "RUNNING";

  console.log(`Updating shipment ${shipment.id} to status ${newStatus}`);
  await updateShipment(shipment.id, { status: newStatus, isSaved: true });

  const deliveryOrders = await getDeliveryOrdersByShipmentId(shipment.id);

  for (let order of deliveryOrders) {
    console.log(`Updating delivery order ${order.id} to status RUNNING`);
    await updateStatusDO("RUNNING", order.id);
  }
};

const updateTruckTypeInShipmentService = async (shipmentId, newTypeId) => {
  try {
    // Validasi input
    if (!shipmentId || !newTypeId) {
      throw new Error('Shipment ID and Truck Type ID are required');
    }

    const result = await updateTruckTypeByShipmentId(shipmentId, newTypeId);
    return result;
  } catch (error) {
    console.error("Failed to update truck in shipment:", error);
    throw error; // Biarkan controller menangani error
  }
};

export {
  getAllShipmentAdminService,
  getAllShipmentService,
  getAllMobileShipmentsService,
  searchAllMobileShipmentsService,
  getDetailMobileShipmentService,
  getDetailShipmentWebService,
  simpanShipmentStatusService,
  getBoxLayoutingCoordinatesService,
  updateTruckTypeInShipmentService
};
