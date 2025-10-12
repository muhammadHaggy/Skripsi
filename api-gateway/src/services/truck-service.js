import {
  getAllTruckAdmin,
  getAllTrucks,
  getTruckbyID,
} from "../repositories/truck-repository.js";

const getAllTruckAdminService = async () => {
  return await getAllTruckAdmin();
};

const getAllTrucksService = async (
  dc_id,
  first_status,
  second_status,
  type
) => {
  return await getAllTrucks(dc_id, first_status, second_status, type);
};

const getTruckByIDService = async (request) => {
  return await getTruckbyID(request);
};

export { getAllTruckAdminService, getAllTrucksService, getTruckByIDService };
