import {
  getAllCustomers,
  getCustomerById,
} from "../repositories/customer-repository.js";

const getAllCustomersService = async (dc_id, skip, limit) => {
  return await getAllCustomers(dc_id, skip, limit);
};

const getCustomerByIdService = async (id) => {
  return await getCustomerById(id);
};

export { getAllCustomersService, getCustomerByIdService };
