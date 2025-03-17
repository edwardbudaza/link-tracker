import { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger";
import { error } from "console";

interface ExtendedError extends Error {
  status?: number;
}

export const errorHandler = (
  err: ExtendedError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const status = err.status || 500;
  const message = err.message || "Something went wrong";

  logger.error(`${status} - ${message}`, {
    error: err.stack,
    method: req.method,
    path: req.path,
    ip: req.ip,
  });

  res.status(status).json({
    error: {
      message,
      status,
      timestamp: new Date().toISOString(),
    },
  });
};
