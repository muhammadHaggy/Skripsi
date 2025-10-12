import {
  createBox,
  linkBoxToDO,
  deleteBoxById,
  updateBoxDimensions,
  findBoxById,
  findBoxByName,
  findBoxDO,
  getAllBoxes,
  updateStatusAndDGXIdBox,
} from "../repositories/box-repository.js";
import { getDOslbyID } from "../repositories/delivery-order-repository.js";
import { publishBoxJob } from "../rabbitmq/publisher.js";

const addBoxToDOService = async (doId, boxId, quantity) => {
  const doData = await getDOslbyID(doId);
  if (!doData || doData.is_deleted || doData.status === "DONE") {
    throw new Error("Invalid or completed Delivery Order");
  }

  const box = await findBoxById(boxId);
  if (!box || box.deleted_at) {
    throw new Error("Box tidak ditemukan atau sudah dihapus");
  }

  const existingRelation = await findBoxDO(boxId, doId);
  if (!existingRelation) {
    await linkBoxToDO(boxId, doId, quantity);
  }

  return { boxId, doId, quantity };
};

const getAllBoxesService = async () => {
  return await getAllBoxes();
};

const deleteBoxByIdService = async (boxId, doId) => {
  return await deleteBoxById(boxId, doId);
};

const updateBoxDimensionAndStatus = async (
  boxId,
  { length, width, height, volume, status }
) => {
  return await updateBoxDimensions(boxId, {
    length,
    width,
    height,
    volume,
    status,
  });
};

const findBoxByNameService = async (name) => {
  const box = await findBoxByName(name);

  if (!box || box.deleted_at) {
    return null;
  }

  return box;
};

const createBoxService = async (data) => {
  return await createBox(data);
};

const processBoxByIdService = async (box_id) => {
  const box = await findBoxById(box_id);
  if (!box) throw new Error(`Box ${box_id} not found`);

  await updateStatusAndDGXIdBox(box_id, "processing", box.dgx_id + 1);

  const payload = {
    box_id: box.id,
    pcUrl: box.pcUrl,
    dgx_id: box.dgx_id,
  };

  await publishBoxJob(payload);
};

export {
  addBoxToDOService,
  deleteBoxByIdService,
  updateBoxDimensionAndStatus,
  getAllBoxesService,
  findBoxByNameService,
  createBoxService,
  processBoxByIdService,
};
