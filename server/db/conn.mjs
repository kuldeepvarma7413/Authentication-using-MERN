import mongoose from 'mongoose';
import "dotenv/config";

const connectionString = process.env.ATLAS_URI || "";

let dbInstance;

export const connectToDatabase = async () => {
  if (dbInstance) {
    return dbInstance;
  }

  try {
    dbInstance = await mongoose.connect(connectionString);
    console.log("MongoDB connected successfully");
    return dbInstance;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
};

export const getDb = () => {
  if (!dbInstance) {
    throw new Error("Database not connected");
  }
  return dbInstance;
};
