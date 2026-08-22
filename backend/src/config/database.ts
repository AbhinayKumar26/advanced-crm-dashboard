import mongoose from "mongoose";
import { env } from "./env";

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGODB_URI);

    console.log("=================================");
    console.log("MongoDB connected successfully");
    console.log("=================================");
  } catch (error) {
    console.error("MongoDB connection failed:", error);

    process.exit(1);
  }
};

