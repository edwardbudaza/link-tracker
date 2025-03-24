import { createClient } from "redis";
import { logger } from "./logger";

export const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || "localhost", // Use localhost as fallback
  port: Number(process.env.REDIS_PORT) || 6379,
  ttl: Number(process.env.REDIS_TTL) || 3600, // 1 hour in seconds
  prefix: process.env.REDIS_PREFIX || "link-tracker:", // Set a prefix for all keys
  enabled: process.env.REDIS_ENABLED !== "false", // Enable Redis by default
};

let redisClient: any = null;
let redisConnectionFailed = false;

export const getRedisClient = async () => {
  // If Redis is disabled or previous connection attempts failed, return a mock client
  if (!REDIS_CONFIG.enabled || redisConnectionFailed) {
    return createMockRedisClient();
  }

  if (!redisClient) {
    try {
      redisClient = createClient({
        url: `redis://${REDIS_CONFIG.host}:${REDIS_CONFIG.port}`,
      });

      redisClient.on("error", (err: any) => {
        logger.error("Redis Client Error", err);
        redisConnectionFailed = true;
        redisClient = null;
      });

      await redisClient.connect();
      logger.info("Redis client connected");
    } catch (error) {
      logger.error("Failed to connect to Redis", error);
      redisConnectionFailed = true;
      return createMockRedisClient();
    }
  }

  return redisClient;
};

// Create a mock client that doesn't do anything but doesn't crash
function createMockRedisClient() {
  return {
    get: async () => null,
    set: async () => true,
    del: async () => true,
    exists: async () => 0,
    incr: async () => 1,
    disconnect: async () => {},
  };
}

// Cleanup function
export const closeRedisConnection = async () => {
  if (redisClient) {
    await redisClient.disconnect();
    redisClient = null;
  }
};
