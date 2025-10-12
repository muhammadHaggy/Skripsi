import {
  getAllLocationsAdmin,
  getAllLocations,
  getLocationByID,
} from "../repositories/locations-repository.js";

const getAllLocationsAdminService = async (skip, limit) => {
  return await getAllLocationsAdmin(skip, limit);
};

const getAllLocationsService = async (dc_id, skip, limit) => {
  return await getAllLocations(dc_id, skip, limit);
};

const getLocationByIDService = async (request) => {
  return await getLocationByID(request);
};

export {
  getAllLocationsAdminService,
  getAllLocationsService,
  getLocationByIDService,
};
