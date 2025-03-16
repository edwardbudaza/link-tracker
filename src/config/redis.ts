import { createClient } from "redis";
import { logger } from "./logger";

export const REDIS_CONFIG = {
  url: process.env.REDIS_URL || "redis://localhost:6379",
  ttl: parseInt(process.env.REDIS_TTL || "86400", 10), // Default 24 hours
};

let redisClient: ReturnType<typeof createClient> | null = null;

export const getRedisClient = async () => {
  if (!redisClient) {
    redisClient = createClient({
      url: REDIS_CONFIG.url,
    });

    redisClient.on("error", (err) => {
      logger.error("Redis Client Error", err);
    });

    await redisClient.connect();
    logger.info("Redis connected successfully");
  }

  return redisClient;
};

export const closeRedisConnection = async () => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info("Redis connection closed");
  }
};
