import express from "express";
import { jwtMiddleware } from "../middlewares/jwt-middleware.js";
import userController from "../controllers/user-controller.js";
import {
  getAllDOAdminController,
  getAllDOController,
  getDOByIDController,
} from "../controllers/delivery-order-controller.js"; //DO
import {
  getAllLocationsAdminController,
  getAllLocationsController,
  getLocationByIdController,
} from "../controllers/location-controller.js"; //LOCATION
import {
  getAllTruckAdminController,
  getAllTrucksController,
  getTruckByIDController,
} from "../controllers/truck-controller.js"; //TRUCK
import { getAllRoleController } from "../controllers/role-controller.js"; //ROLE
import { getAllDCController } from "../controllers/dc-controller.js"; //DC
import { getAllProductController } from "../controllers/product-controller.js"; //PRODUCT
import { getAllProductLineController } from "../controllers/product-line-controller.js"; //PRODUCTLINE
import {
  getAllShipmentAdminController,
  getAllShipmentController,
  getAllMobileShipmentsController,
  searchAllMobileShipmentsController,
  getDetailMobileShipmentController,
  getDetailShipmentWebController,
  simpanShipmentStatusController,
  getBoxLayoutingCoordinatesController,
  updateTruckTypeInShipmentController,
} from "../controllers/shipment-controller.js"; //SHIPMENT
import {
  getAllCustomersController,
  getCustomerByIdController,
} from "../controllers/customers-controller.js"; //CUSTOMER
import { priorityOptimizationController } from "../controllers/optimization-controller.js"; //OPTIMIZATION
import {
  addBoxToDOController,
  boxDimensionCalculation,
  deleteBoxByIdController,
  getBoxByNameController,
  getAllBoxesController,
  createBoxController,
} from "../controllers/box-controller.js"; // BOX

const restrictedRouter = express.Router();
restrictedRouter.use(jwtMiddleware);

//user
/**
 * @swagger
 * /api/v1/user:
 *   post:
 *     summary: Register a new user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               roleId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: User created
 */
restrictedRouter.post("/api/v1/user", userController.registerUserController);
restrictedRouter.put("/api/v1/user", userController.updateUserController);
restrictedRouter.post(
  "/api/v1/refresh-token",
  userController.refreshTokenController
);
restrictedRouter.post(
  "/api/v1/activate-user",
  userController.activateUserController
);
restrictedRouter.post(
  "/api/v1/deactivate-user",
  userController.deactivateUserController
);
restrictedRouter.get(
  "/api/v1/administrator/users",
  userController.getAllUserController
);
restrictedRouter.post("/api/v1/logout", userController.logoutUserController);
restrictedRouter.get("/api/v1/dashboard", userController.dashboardController);
restrictedRouter.get(
  "/api/v1/administrator/dashboard",
  userController.dashboardAdminController
);

//delivery-order
/**
 * @swagger
 * /api/v1/administrator/delivery-orders:
 *   get:
 *     summary: Get all delivery orders (Admin)
 *     tags: [Delivery Order]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of delivery orders
 */
restrictedRouter.get(
  "/api/v1/administrator/delivery-orders",
  getAllDOAdminController
);
restrictedRouter.get("/api/v1/delivery-orders", getAllDOController);
restrictedRouter.get("/api/v1/delivery-order/:doId", getDOByIDController);

//locations
restrictedRouter.get(
  "/api/v1/administrator/locations",
  getAllLocationsAdminController
);
restrictedRouter.get("/api/v1/locations", getAllLocationsController);
restrictedRouter.get("/api/v1/location/:lokasiId", getLocationByIdController);

//trucks
restrictedRouter.get(
  "/api/v1/administrator/trucks",
  getAllTruckAdminController
);
restrictedRouter.get("/api/v1/trucks", getAllTrucksController);
restrictedRouter.get("/api/v1/truck/:truckId", getTruckByIDController);

//roles
restrictedRouter.get("/api/v1/administrator/roles", getAllRoleController);

//dc
restrictedRouter.get("/api/v1/dcs", getAllDCController);

//product
restrictedRouter.get("/api/v1/products", getAllProductController);

//product-line
restrictedRouter.get("/api/v1/product-lines", getAllProductLineController);

//shipment
/**
 * @swagger
 * /api/v1/administrator/shipments:
 *   get:
 *     summary: Get all shipments (Admin)
 *     tags: [Shipment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of shipments
 */
restrictedRouter.get(
  "/api/v1/administrator/shipments",
  getAllShipmentAdminController
);
restrictedRouter.get("/api/v1/shipments", getAllShipmentController);
restrictedRouter.get(
  "/api/v1/mobile/shipments",
  getAllMobileShipmentsController
);
restrictedRouter.get(
  "/api/v1/mobile/shipment/search",
  searchAllMobileShipmentsController
);
restrictedRouter.get(
  "/api/v1/mobile/shipment/:id",
  getDetailMobileShipmentController
);
restrictedRouter.get("/api/v1/shipment/:id", getDetailShipmentWebController);
restrictedRouter.patch(
  "/api/v1/shipment/simpan/:shipmentNum",
  simpanShipmentStatusController
);
restrictedRouter.post("/api/v1/priority-opt", priorityOptimizationController

);
restrictedRouter.post(
  "/api/v1/shipment/:id/update-truck-type",
  updateTruckTypeInShipmentController
);

//customers
restrictedRouter.get("/api/v1/customers", getAllCustomersController);
restrictedRouter.get("/api/v1/customer/:customerId", getCustomerByIdController);

//box
restrictedRouter.post(
  "/api/v1/delivery-order/:doId/boxes",
  addBoxToDOController
);
restrictedRouter.delete("/api/v1/box/:boxId", deleteBoxByIdController);
restrictedRouter.post("/api/v1/box/calculate", boxDimensionCalculation);
restrictedRouter.get("/api/v1/box/search", getBoxByNameController);
restrictedRouter.get("/api/v1/boxes", getAllBoxesController);
restrictedRouter.post("/api/v1/box", createBoxController);
restrictedRouter.post(
  "/api/v1/box-layouting/:idShipment",
  getBoxLayoutingCoordinatesController
);

export { restrictedRouter };
