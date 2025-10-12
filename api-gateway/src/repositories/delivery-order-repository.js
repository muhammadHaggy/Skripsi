import { prisma } from "../config/database.js";

async function getAllDOsAdministrator(skip, limit) {
  const total = await prisma.deliveryOrder.count({
    where: {
      is_deleted: false,
    },
  });

  const result = await prisma.deliveryOrder.findMany({
    skip: skip,
    take: limit,
    where: {
      is_deleted: false,
    },
    include: {
      loc_ori: true,
      loc_dest: true,
    },
  });

  return {
    deliveryOrders: result,
    total: total,
  };
}

async function getAllDOs(dc_id, skip, limit, start_date, end_date, status) {
  const filters = [{ is_deleted: false }, { loc_ori: { dc_id: dc_id } }];

  if (start_date != "" && end_date != "") {
    const startDateParts = start_date.split("/");
    const endDateParts = end_date.split("/");

    const startDate = new Date(
      `${startDateParts[2]}-${startDateParts[1]}-${startDateParts[0]}T00:00:00.000Z`
    );
    const endDate = new Date(
      `${endDateParts[2]}-${endDateParts[1]}-${endDateParts[0]}T23:59:59.999Z`
    );

    filters.push({
      order_date: {
        gte: startDate,
        lte: endDate,
      },
    });
  }

  if (status != null) {
    filters.push({
      status: status,
    });
  }

  const total = await prisma.deliveryOrder.count({
    where: {
      AND: filters,
    },
  });
  const deliveryOrders = await prisma.deliveryOrder.findMany({
    skip: skip,
    take: limit,
    where: {
      AND: filters,
    },
    include: {
      loc_ori: {
        include: {
          dc: {
            select: {
              id: true,
              name: true,
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      loc_dest: {
        include: {
          dc: {
            select: {
              id: true,
              name: true,
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  return { deliveryOrders, total };
}

async function getDOslbyID(do_id) {
  return await prisma.deliveryOrder.findFirst({
    where: {
      id: parseInt(do_id),
    },
    include: {
      loc_ori: {
        include: {
          dc: true,
        },
      },
      loc_dest: {
        include: {
          customer: true,
        },
      },
    },
  });
}

async function updateStatusDO(status, do_id) {
  try {
    const shipment = await prisma.deliveryOrder.update({
      where: { id: do_id },
      data: { status: status },
    });
    console.log("DO status berhasil diubah:", shipment);
    return shipment;
  } catch (error) {
    console.error("Terjadi kesalahan saat update DO status:", error.message);
    throw error;
  }
}

async function getAllDOsOptimization(
  dos_id,
  has_shipment,
  do_date,
  status,
  dc_id,
  is_deleted
) {
  let dos_id_query = {};
  if (dos_id != null) {
    dos_id_query = {
      id: {
        in: dos_id,
      },
    };
  }

  let shipment_query = {};
  if (has_shipment != null) {
    if (has_shipment === "true") {
      shipment_query = {
        ShipmentDO: {
          some: {
            shipment: {
              NOT: [{ status: "DONE" }, { status: "RUNNING" }],
            },
          },
        },
      };
    } else {
      shipment_query = {
        ShipmentDO: {
          none: {},
        },
      };
    }
  }

  let do_date_query = {};
  if (do_date != null) {
    const startDate = new Date(do_date + "T00:00:00.000Z");
    const endDate = new Date(do_date + "T23:59:59.999Z");
    do_date_query = {
      order_date: {
        gte: startDate,
        lte: endDate,
      },
    };
  }

  let status_query = {};
  if (status != null) {
    status_query = {
      status: status,
    };
  }

  let dc_query = {};
  if (dc_id != null) {
    dc_query = {
      loc_dest: {
        dc_id: parseInt(dc_id),
      },
    };
  }

  let is_deleted_query = {};
  if (is_deleted != null) {
    is_deleted_query = {
      is_deleted: is_deleted,
    };
  }

  return await prisma.deliveryOrder.findMany({
    where: {
      AND: [
        dos_id_query,
        shipment_query,
        do_date_query,
        status_query,
        dc_query,
        is_deleted_query,
      ],
    },
    orderBy: {
      id: "asc",
    },
    select: {
      id: true,
      delivery_order_num: true,
      description: true,
      volume: true,
      quantity: true,
      status: true,
      order_date: true,
      eta: true,
      etd: true,
      atd: true,
      ata: true,
      loc_dest: {
        select: {
          id: true,
        },
      },
      loc_ori: {
        select: {
          id: true,
        },
      },
      ProductLine: {
        select: {
          volume: true,
          quantity: true,
        },
      },
    },
  });
}

async function countDeliveryOrder(dc_id) {
  return await prisma.deliveryOrder.count({
    where: {
      is_deleted: false,
      ...(dc_id !== null ? { loc_ori: { dc_id } } : {}),
    },
  });
}

async function countUnprocessedDO(dc_id) {
  return await prisma.deliveryOrder.count({
    where: {
      status: "READY",
      is_deleted: false,
      ...(dc_id !== null ? { loc_ori: { dc_id } } : {}),
    },
  });
}

async function getDeliveryOrdersByShipmentId(shipmentId) {
  return await prisma.deliveryOrder.findMany({
    where: {
      ShipmentDO: {
        some: {
          shipment_id: shipmentId,
        },
      },
    },
  });
}

export {
  getAllDOsAdministrator,
  getAllDOs,
  getDOslbyID,
  updateStatusDO,
  getAllDOsOptimization,
  countDeliveryOrder,
  countUnprocessedDO,
  getDeliveryOrdersByShipmentId,
};
