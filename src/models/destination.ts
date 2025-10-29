import mongoose from "mongoose";

const destinationSchema = new mongoose.Schema({
  ten: { type: String, required: true },
  dia_chi: { type: String, required: true },
  kinh_do: { type: Number, required: true },
  vi_do: { type: Number, required: true },
});

const Destination =
  mongoose.models.Destination ||
  mongoose.model("Destination", destinationSchema);

export default Destination;
