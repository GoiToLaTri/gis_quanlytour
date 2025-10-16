import { model, models, Schema } from "mongoose";

const destinationsSpecialtiesSchema = new Schema({
  ma_dac_san: { type: Schema.Types.ObjectId, required: true },
  ten: { type: String, required: true },
});

const DestinationsSpecialties =
  models.DestinationsSpecialties ||
  model("destinationsSpecialties", destinationsSpecialtiesSchema);

export default DestinationsSpecialties;
