import { prisma } from "../config/database.js";

async function createBox(data) {
  return await prisma.box.create({ data });
}

async function linkBoxToDO(box_id, delivery_order_id, quantity = 1) {
  return await prisma.boxDO.create({
    data: {
      box_id,
      delivery_order_id,
      quantity,
    },
  });
}

async function updateBox(boxId, data) {
  return await prisma.box.update({
    where: { id: boxId },
    data: data,
  });
}

async function deleteBoxById(boxId, doId) {
  const deletedRelation = await prisma.boxDO.delete({
    where: {
      box_id_delivery_order_id: {
        box_id: boxId,
        delivery_order_id: doId,
      },
    },
  });
  return deletedRelation;
}

async function findBoxById(boxId) {
  return await prisma.box.findUnique({
    where: { id: boxId },
  });
}

async function updateStatusAndDGXIdBox(boxId, status, dgx_id) {
  return await prisma.box.update({
    where: { id: boxId },
    data: {
      dgx_id: dgx_id,
      status: status,
    },
  });
}

async function updateBoxDimensions(
  boxId,
  { length, width, height, volume, status }
) {
  return await prisma.box.update({
    where: { id: boxId },
    data: {
      length,
      width,
      height,
      volume,
      status,
    },
  });
}

async function findBoxByName(name) {
  return await prisma.box.findUnique({
    where: { name: name },
  });
}

async function findBoxDO(boxId, doId) {
  return await prisma.boxDO.findFirst({
    where: {
      box_id: boxId,
      delivery_order_id: doId,
    },
  });
}

async function getAllBoxes() {
  return await prisma.box.findMany({
    where: {
      deleted_at: null,
    },
    orderBy: {
      scanned_at: "desc",
    },
    select: {
      id: true,
      name: true,
      height: true,
      width: true,
      length: true,
      pcUrl: true,
      status: true,
    },
  });
}

export {
  createBox,
  linkBoxToDO,
  deleteBoxById,
  findBoxById,
  updateStatusAndDGXIdBox,
  updateBoxDimensions,
  findBoxByName,
  findBoxDO,
  updateBox,
  getAllBoxes,
};
