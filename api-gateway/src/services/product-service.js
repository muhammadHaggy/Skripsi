import { getAllProduct } from "../repositories/product-repository.js";
const getAllProductService = async (skip, limit) => {
  return await getAllProduct(skip, limit);
};

export { getAllProductService };
