import mongoose from "mongoose";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

export const connectDatabase = async (): Promise<void> => {
  try {
    if (!env.DATABASE_URL) {
      throw new Error("DATABASE_URL is required");
    }

    await mongoose.connect(env.DATABASE_URL);

    logger.info("Database connected successfully");
  } catch (error) {
    logger.fatal(error, "Database connection failed");
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.connection.close();
};
