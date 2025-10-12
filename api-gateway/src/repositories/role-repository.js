import { prisma } from "../config/database.js";

async function getAllRoles() {
  return await prisma.role.findMany({
    select: {
      id: true,
      name: true,
      is_allowed_location: true,
      is_allowed_do: true,
      is_allowed_shipment: true,
      is_allowed_truck: true,
      is_allowed_user: true,
      dc_id: true,
      dc: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}
export { getAllRoles };
