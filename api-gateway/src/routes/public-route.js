import express from "express";
import userController from "../controllers/user-controller.js";
import { apiKeyMiddleware } from "../middlewares/api-key-middleware.js";
import { returnBoxDimesionResultController } from "../controllers/box-controller.js";
import { getChannel } from "../rabbitmq/connection.js";

const publicRouter = express.Router();

publicRouter.get("/api/v1/health", (_, res) =>
  res.status(200).json({ success: true, message: "Gateway is running" })
);
publicRouter.post("/api/v1/login", userController.loginUserWebController);
publicRouter.post(
  "/api/v1/mobile/login",
  userController.loginUserMobileController
);
publicRouter.post(
  "/api/v1/box/dimension-result",
  apiKeyMiddleware,
  returnBoxDimesionResultController
);
publicRouter.get("/api/v1/rabbitmq/health", (_, res) => {
  try {
    const channel = getChannel();

    const isClosed =
      !channel.connection ||
      channel.connection.closing ||
      channel.connection._closed;

    if (isClosed) {
      throw new Error("Channel or connection is closed");
    }

    res.status(200).json({ success: true, message: "RabbitMQ connected" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "RabbitMQ NOT connected",
      error: err.message,
    });
  }
});

export { publicRouter };
