import { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger";
import { AuthError } from "../errors/AuthError";

interface ExtendedError extends Error {
  status?: number;
  code?: string;
}

export const errorHandler = (
  err: ExtendedError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error details:', err);
  
  if (err instanceof AuthError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code
    });
    return;
  }

  const status = err.status || 500;
  const message = err.message || "Something went wrong";

  logger.error(`${status} - ${message}`, {
    error: err.stack,
    method: req.method,
    path: req.path,
    ip: req.ip,
  });

  res.status(status).json({
    success: false,
    message,
    code: err.code || 'INTERNAL_SERVER_ERROR'
  });
};
