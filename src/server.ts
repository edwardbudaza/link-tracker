import App from "./app";
import { logger } from "./config/logger";
import { closeRedisConnection } from "./config/redis";

const app = new App();

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM signal received. Shutting down gracefully");
  await closeRedisConnection();
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT signal received. Shutting down gracefully");
  await closeRedisConnection();
  process.exit(0);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception", error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled promise rejection", { reason, promise });
  process.exit(1);
});

// Start the application
app.start().catch((error) => {
  logger.error("Failed to start application", error);
  process.exit(1);
});
