import { getAllDC } from "../repositories/dc-repository.js";

const getAllDCService = async () => {
  return await getAllDC();
};

export { getAllDCService };
