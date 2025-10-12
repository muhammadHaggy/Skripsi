import winston from "winston";
import { prisma } from "./database.js";

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [new winston.transports.Console({})],
});

// Prisma event-based logging; compatible with clients where middleware is unavailable
prisma.$on("query", (event) => {
  console.log(`Query took ${event.duration}ms`);
});
prisma.$on("error", (event) => {
  console.error(`Prisma error: ${event.message}`);
});
prisma.$on("warn", (event) => {
  console.warn(`Prisma warn: ${event.message}`);
});
prisma.$on("info", (event) => {
  console.log(`Prisma info: ${event.message}`);
});

export function logHttpRequest(req, res, next) {
  const start = Date.now();
  console.log(`Starting ${req.method} ${req.originalUrl}`);

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`Completed ${req.method} ${req.originalUrl} in ${duration}ms`);
    console.log(" ");
  });

  next();
}
