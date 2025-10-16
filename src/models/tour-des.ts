import mongoose from "mongoose";

const tourDesSchema = new mongoose.Schema({
  ma_tour: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tour",
    required: true,
  },
  ma_dia_diem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Destination",
    required: true,
  },
  diem_den: { type: Boolean, required: true },
  diem_khoi_hanh: { type: Boolean, required: true },
});

const TourDes =
  mongoose.models.TourDes || mongoose.model("TourDes", tourDesSchema);

export default TourDes;
