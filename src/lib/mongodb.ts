import mongoose from "mongoose";

const connect = async () => {
  if (mongoose.connections[0].readyState) {
    console.log("Already connected to MongoDB");
    return;
  }
  try {
    await mongoose.connect(process.env.DATABASE_URL as string);
  } catch (error) {
    console.log('Failed to connect to database');
  }
  console.log("Connected to MongoDB");
};

export default connect;
