import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const dbUri = process.env.DB_URI;

    if (!dbUri) {
      throw new Error("DB_URI is not defined in environment variables");
    }

    await mongoose.connect(dbUri);

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};


mongoose.connection.on("connected", () => {
  console.log("MongoDB connection established");
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB error:", err.message);
});

export default connectDB;