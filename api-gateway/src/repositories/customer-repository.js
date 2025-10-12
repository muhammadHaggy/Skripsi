import { prisma } from "../config/database.js";
const getAllCustomers = async (dc_id, skip, limit) => {
  try {
    let dcQuery = {};
    if (dc_id != null) {
      dcQuery = {
        Location: {
          some: {
            dc_id: dc_id,
          },
        },
      };
    }

    const customers = await prisma.customer.findMany({
      skip: skip,
      take: limit,
      where: dcQuery,
      include: {
        Location: true,
      },
    });

    const total = await prisma.customer.count({
      where: dcQuery,
    });

    if (customers.length === 0) {
      throw new Error("Tidak ada customer yang ditemukan");
    }

    return { customers, total };
  } catch (error) {
    console.error("Error details: ", error);
    throw new Error("Gagal mengambil data customer");
  }
};

const getCustomerById = async (id) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: Number(id) },
    });
    if (!customer) {
      throw new Error("Customer tidak ditemukan");
    }
    return customer;
  } catch (error) {
    console.error("Error details: ", error);
    throw new Error("Gagal mengambil data customer berdasarkan ID");
  }
};

export { getAllCustomers, getCustomerById };
