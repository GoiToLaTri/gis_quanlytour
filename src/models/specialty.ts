import { model, models, Schema } from "mongoose";

const specialtySchema = new Schema({
  ten: { type: String, required: true },
});

const Specialty = models.Specialty || model("Specialty", specialtySchema);

export default Specialty;
