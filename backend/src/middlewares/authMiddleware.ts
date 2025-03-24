import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../di/types";
import { AuthService } from "../services/authService";
import { AuthError } from "../errors/AuthError";
import { IAuthMiddleware } from "../interfaces/middlewares/IAuthMiddleware";
import { container } from "../di/container";
import jwt from "jsonwebtoken";
import { logger } from "../config/logger";
import { AUTH_CONFIG } from "../config/auth";
import UserModel, { UserDocument } from "../models/User";
import {
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../utils/tokenUtils";
import mongoose from "mongoose";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Add this to fix the import in authRoutes.ts
export type AuthRequest = AuthenticatedRequest;

@injectable()
export class AuthMiddleware implements IAuthMiddleware {
  constructor(@inject(TYPES.AuthService) private authService: AuthService) {}

  authenticate = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Check for token in Authorization header
      const authHeader = req.headers.authorization;

      // Get token from Authorization header or from cookies
      let token: string | undefined;

      if (authHeader && authHeader.startsWith("Bearer ")) {
        // Get token from header
        token = authHeader.split(" ")[1];
      } else if (req.cookies.accessToken) {
        // Get token from cookie
        token = req.cookies.accessToken;
      }

      if (!token) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      try {
        // Verify token
        const decoded = verifyAccessToken(token);

        // Set user in request object
        req.user = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role || "user",
        };

        next();
      } catch (error) {
        // If token verification fails, try to refresh token
        if (req.cookies.refreshToken) {
          try {
            // Verify refresh token
            const decoded = verifyRefreshToken(req.cookies.refreshToken);

            // Find user
            const user = await UserModel.findById(decoded.id);

            if (!user) {
              throw new Error("User not found");
            }

            // Create new tokens
            const accessToken = createAccessToken(user);
            const refreshToken = createRefreshToken(user);

            // Set new cookies
            setTokenCookies(res, accessToken, refreshToken);

            // Set user in request object
            req.user = {
              id:
                user._id instanceof mongoose.Types.ObjectId
                  ? user._id.toString()
                  : String(user._id),
              email: user.email,
              role: user.role || "user",
            };

            next();
          } catch (refreshError) {
            // If refresh token is invalid, clear cookies and return 401
            clearTokenCookies(res);
            res.status(401).json({
              success: false,
              message: "Session expired. Please login again.",
            });
          }
        } else {
          // No refresh token, clear cookies and return 401
          clearTokenCookies(res);
          res.status(401).json({
            success: false,
            message: "Authentication failed",
          });
        }
      }
    } catch (error) {
      logger.error("Auth middleware error:", {
        error: error instanceof Error ? error.message : String(error),
      });
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  requireRole = (roles: string[]) => {
    return (
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
    ): void => {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      if (roles.includes(req.user.role)) {
        next();
      } else {
        res.status(403).json({
          success: false,
          message: "You don't have permission to access this resource",
        });
      }
    };
  };
}

// Export a function that gets the middleware from the container
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const middleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);
  middleware.authenticate(req as AuthenticatedRequest, res, next);
};

// Export authenticateToken for direct usage in routes
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const middleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);
  middleware.authenticate(req as AuthenticatedRequest, res, next);
};

/**
 * Optional authentication middleware that doesn't require authentication
 * but still sets the user object if a valid token is provided
 */
export const optionalAuthenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check for token in Authorization header
    const authHeader = req.headers.authorization;

    // Get token from Authorization header or from cookies
    let token: string | undefined;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      // Get token from header
      token = authHeader.split(" ")[1];
    } else if (req.cookies.accessToken) {
      // Get token from cookie
      token = req.cookies.accessToken;
    }

    if (!token) {
      // No token, continue without authentication
      next();
      return;
    }

    try {
      // Verify token
      const decoded = verifyAccessToken(token);

      // Set user in request object
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role || "user",
      };

      next();
    } catch (error) {
      // If token verification fails, try refresh token
      if (req.cookies.refreshToken) {
        try {
          // Verify refresh token
          const decoded = verifyRefreshToken(req.cookies.refreshToken);

          // Find user
          const user = await UserModel.findById(decoded.id);

          if (user) {
            // Create new tokens
            const accessToken = createAccessToken(user);
            const refreshToken = createRefreshToken(user);

            // Set new cookies
            setTokenCookies(res, accessToken, refreshToken);

            // Set user in request object
            req.user = {
              id:
                user._id instanceof mongoose.Types.ObjectId
                  ? user._id.toString()
                  : String(user._id),
              email: user.email,
              role: user.role || "user",
            };
          }

          next();
        } catch (refreshError) {
          // Ignore refresh token errors in optional auth
          clearTokenCookies(res);
          next();
        }
      } else {
        next();
      }
    }
  } catch (error) {
    logger.error("Optional auth middleware error:", {
      error: error instanceof Error ? error.message : String(error),
    });
    // Continue without authentication
    next();
  }
};

/**
 * CSRF protection middleware
 */
export const csrfProtection = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Only apply to non-GET methods
  if (req.method !== "GET") {
    const csrfToken = req.headers["x-csrf-token"];
    const cookieToken = req.cookies.csrfToken;

    if (!csrfToken || !cookieToken || csrfToken !== cookieToken) {
      res.status(403).json({
        success: false,
        message: "CSRF validation failed",
      });
      return;
    }
  }

  next();
};

// Helper functions for token cookies

export const setTokenCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
): void => {
  // Set access token as HTTP-only cookie
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: AUTH_CONFIG.JWT_EXPIRATION * 1000, // Convert seconds to milliseconds
  });

  // Set refresh token as HTTP-only cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/v1/auth/refresh", // Only sent to refresh endpoint
    maxAge: AUTH_CONFIG.JWT_REFRESH_EXPIRATION * 1000, // Convert seconds to milliseconds
  });
};

export const clearTokenCookies = (res: Response): void => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken", { path: "/api/v1/auth/refresh" });
};
