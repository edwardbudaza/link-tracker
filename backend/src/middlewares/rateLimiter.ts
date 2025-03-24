import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import Redis from "ioredis";
import { logger } from "../config/logger";

// Redis client for rate limiting
let redisClient: Redis | null = null;

try {
  if (process.env.REDIS_URL) {
    redisClient = new Redis(process.env.REDIS_URL);
    logger.info("Redis client initialized for rate limiting");
  }
} catch (error) {
  logger.error("Failed to initialize Redis client:", { error: error instanceof Error ? error.message : String(error) });
}

// Create store based on available options
const createStore = () => {
  if (redisClient) {
    return new RedisStore({
      // @ts-ignore - Type mismatch in package, but it works
      sendCommand: (...args: unknown[]) => redisClient!.call(...args),
      prefix: "ratelimit:",
    });
  }
  
  logger.warn("Using memory store for rate limiting - not recommended for production");
  return undefined; // Will use default memory store
};

// General API rate limiter - applies to all routes
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  store: createStore(),
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
  handler: (req: Request, res: Response, _next: NextFunction) => {
    logger.warn("Rate limit exceeded", {
      ip: req.ip,
      path: req.path,
      method: req.method,
    });
    res.status(429).json({
      success: false,
      message: "Too many requests, please try again later.",
    });
  },
  skip: (req: Request) => {
    // Skip rate limiting for certain endpoints if needed
    return false;
  },
});

// Stricter rate limiter for auth routes to prevent brute force attacks
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore(),
  message: {
    success: false,
    message: "Too many login attempts, please try again later.",
  },
  handler: (req: Request, res: Response, _next: NextFunction) => {
    logger.warn("Auth rate limit exceeded", {
      ip: req.ip,
      path: req.path,
      method: req.method,
    });
    res.status(429).json({
      success: false,
      message: "Too many login attempts, please try again later.",
    });
  },
});

// URL shortening limiter
export const urlShorteningLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore(),
  message: {
    success: false,
    message: "Too many URL shortening requests, please try again later.",
  },
  handler: (req: Request, res: Response, _next: NextFunction) => {
    logger.warn("URL shortening rate limit exceeded", {
      ip: req.ip,
      path: req.path,
      method: req.method,
    });
    res.status(429).json({
      success: false,
      message: "Too many URL shortening requests, please try again later.",
    });
  },
}); 