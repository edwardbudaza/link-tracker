import dotenv from "dotenv";
dotenv.config();

export const APP_CONFIG = {
  port: process.env.PORT || 5000,
  environment: process.env.NODE_ENV || "development",
  baseUrl: process.env.BASE_URL || "http://localhost:5000",
  apiPrefix: "/api/v1",
  jwtSecret: process.env.JWT_SECRET || "your-default-jwt-secret-key-change-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "24h",
};
