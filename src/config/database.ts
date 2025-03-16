import mongoose from "mongoose";
import { logger } from "./logger";

export const DB_CONFIG = {
  uri:
    process.env.MONGODB_URI ||
    "mongodb://[localhost:27017/link-tracker](http://localhost:27017/link-tracker)",
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
};

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(DB_CONFIG.uri);
    logger.info("MongoDB connected successfully");
  } catch (error) {
    logger.error("MongoDB connection error", error);
    process.exit(1);
  }
};
