import { prisma } from "../config/database.js";

async function getAllProduct(skip, limit) {
  const result = await prisma.product.findMany({
    skip: skip,
    take: limit,
  });

  const total = await prisma.product.count();

  return { product: result, total: total };
}

export { getAllProduct };
