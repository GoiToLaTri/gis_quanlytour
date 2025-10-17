import { model, models, Schema } from "mongoose";

const specialtySchema = new Schema(
  {
    ten: { type: String, required: true },
  },
  {
    collection: "specialty",
  },
);

const Specialty = models.Specialty || model("Specialty", specialtySchema);

export default Specialty;
