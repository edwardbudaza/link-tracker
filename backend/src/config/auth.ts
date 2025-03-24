/**
 * Authentication configuration
 */
export const AUTH_CONFIG = {
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key",
  JWT_EXPIRATION: 15 * 60, // 15 minutes in seconds
  JWT_REFRESH_EXPIRATION: 7 * 24 * 60 * 60, // 7 days in seconds
}; 