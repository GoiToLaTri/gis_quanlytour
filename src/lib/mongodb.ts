import mongoose from "mongoose";

const connect = async () => {
  let isConnected = false; // flag tránh kết nối nhiều lần
  if (isConnected) {
    console.log("Already connected to MongoDB");
    return;
  }
  isConnected = mongoose.connections[0].readyState === 1;
  if (isConnected) {
    console.log("Already connected to MongoDB");
    return;
  }
  try {
    await mongoose.connect(process.env.DATABASE_URL as string);
  } catch (error) {
    console.log("Failed to connect to database");
  }
  console.log("Connected to MongoDB");
};

export default connect;
