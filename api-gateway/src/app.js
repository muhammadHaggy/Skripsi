import express from "express";
import { logHttpRequest } from "./config/logging.js";
import { errorMiddleware } from "./middlewares/error-middleware.js";
import { publicRouter } from "./routes/public-route.js";
import { restrictedRouter } from "./routes/restricted-route.js";
import cors from "cors";

export const app = express();

app.use(
  cors({
    origin: function (origin, callback) {
      if (origin) {
        callback(null, origin);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

app.use(logHttpRequest);

app.use(publicRouter);

app.use(restrictedRouter);

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    code: 404,
    message: "Not Found",
    data: null,
    error: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

app.use(errorMiddleware);
