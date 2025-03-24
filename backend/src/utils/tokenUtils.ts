import jwt from "jsonwebtoken";
import { AUTH_CONFIG } from "../config/auth";
import { User } from "../models/User";

/**
 * Create an access token for authenticated users
 */
export const createAccessToken = (user: User): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    AUTH_CONFIG.JWT_SECRET,
    { expiresIn: AUTH_CONFIG.JWT_EXPIRATION }
  );
};

/**
 * Create a refresh token for extending sessions
 */
export const createRefreshToken = (user: User): string => {
  return jwt.sign(
    {
      id: user.id,
    },
    AUTH_CONFIG.JWT_REFRESH_SECRET,
    { expiresIn: AUTH_CONFIG.JWT_REFRESH_EXPIRATION }
  );
};

/**
 * Verify an access token
 */
export const verifyAccessToken = (token: string): jwt.JwtPayload => {
  return jwt.verify(token, AUTH_CONFIG.JWT_SECRET) as jwt.JwtPayload;
};

/**
 * Verify a refresh token
 */
export const verifyRefreshToken = (token: string): jwt.JwtPayload => {
  return jwt.verify(token, AUTH_CONFIG.JWT_REFRESH_SECRET) as jwt.JwtPayload;
}; 