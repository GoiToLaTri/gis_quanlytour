import { model, models, Schema } from "mongoose";

const destinationsSpecialtySchema = new Schema(
  {
    ma_dac_san: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Specialty",
    },
    ma_dia_diem: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Destination",
    },
  },
  { collection: "des-spec" },
);

const DestinationsSpecialties =
  models["des-spec"] || model("des-spec", destinationsSpecialtySchema);

export default DestinationsSpecialties;
