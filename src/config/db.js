import mongoose from "mongoose";

export const connectdb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("Successfully connected to MongoDB!");
  } catch (error) {
    console.error("DB connection error:", error.message);
    process.exit(1);
  }
};