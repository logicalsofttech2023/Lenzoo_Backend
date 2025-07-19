import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  prescriptionFile: { type: String },
  notes: { type: String },
  uploadedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Prescription", prescriptionSchema);
