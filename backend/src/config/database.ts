import mongoose from "mongoose";
import { logger } from "./logger";

export const DB_CONFIG = {
  uri:
    process.env.MONGODB_URI ||
    `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@localhost:27017/link-tracker`,
  options: {
    serverSelectionTimeoutMS: 5000, // New default option to handle connection timeouts
    authSource: "admin",
  },
};

export const connectDB = async (): Promise<void> => {
  try {
    logger.info('Attempting to connect to MongoDB');
    await mongoose.connect(DB_CONFIG.uri, DB_CONFIG.options);
    logger.info("✅ MongoDB connected successfully");
  } catch (error) {
    logger.error("❌ MongoDB connection error", error);
    process.exit(1);
  }
};
