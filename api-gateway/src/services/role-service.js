import { getAllRoles } from "../repositories/role-repository.js";

const getAllRoleService = async () => {
  return await getAllRoles();
};

export { getAllRoleService };
