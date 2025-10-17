import { model, models, Schema } from "mongoose";

const destinationsSpecialtiesSchema = new Schema(
  {
    maDS: { type: Schema.Types.ObjectId, required: true },
    maDD: { type: Schema.Types.ObjectId, required: true },
  },
  { collection: "destination-specialty" },
);

const DestinationsSpecialties =
  models["destination-specialty"] ||
  model("destination-specialty", destinationsSpecialtiesSchema);

export default DestinationsSpecialties;
