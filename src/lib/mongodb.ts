import mongoose from "mongoose";

const connect = () => {
  if (mongoose.connections[0].readyState) {
    console.log("Already connected to MongoDB");
    return;
  }
  mongoose.connect(process.env.DATABASE_URL as string);
  console.log("Connected to MongoDB");
};

export default connect;
