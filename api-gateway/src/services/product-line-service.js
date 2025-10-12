import { getAllProductLine } from "../repositories/product-line-repository.js";
const getAllProductLineService = async (
  dc_id,
  doId,
  productId,
  skip,
  limit
) => {
  return await getAllProductLine(dc_id, doId, productId, skip, limit);
};

export { getAllProductLineService };
