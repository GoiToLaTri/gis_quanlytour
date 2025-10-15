import { model, Schema } from "mongoose";

const tourSchema = new Schema({
  ten: { type: String, required: true },
  gia_nguoi_lon: { type: Number, required: true },
  gia_tre_em: { type: Number, required: true },
  so_ngay: { type: Number, required: true },
});

const TourSchema = model("tour", tourSchema);

export default TourSchema;
