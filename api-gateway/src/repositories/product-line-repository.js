import { prisma } from "../config/database.js";

async function getAllProductLine(dc_id, doId, productId, skip, limit) {
  let dcIdQuery = {};
  if (dc_id != null) {
    dcIdQuery = {
      delivery_order: {
        loc_ori: {
          dc_id: parseInt(dc_id),
        },
      },
    };
  }

  let doQuery = {};
  if (doId != null) {
    doQuery = {
      delivery_order_id: parseInt(doId),
    };
  }

  let productQuery = {};
  if (productId != null) {
    productQuery = {
      product_id: parseInt(productId),
    };
  }
  const total = await prisma.productLine.count({
    where: {
      AND: [dcIdQuery, doQuery, productQuery],
    },
  });
  const result = await prisma.productLine.findMany({
    skip: skip,
    take: limit,
    where: {
      AND: [dcIdQuery, doQuery, productQuery],
    },
    include: {
      delivery_order: {
        select: {
          so_origin: true,
          delivery_order_num: true,
          status: true,
        },
      },
      product: {
        select: {
          name: true,
        },
      },
    },
  });
  return { productLine: result, total: total };
}

export { getAllProductLine };
