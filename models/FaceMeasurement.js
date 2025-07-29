import mongoose from "mongoose";

const faceMeasurementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  faceShape: String,
  measurementAccuracy: String,
  message: String,
  cheekboneWidth: Number,
  faceLength: Number,
  foreheadWidth: Number,
  jawWidth: Number,
  nasoPupillaryDistance: {
    leftEye: String,
    rightEye: String,
  },
  pupilHeight: String,
  pupillaryDistance: String,
}, { timestamps: true });

export default mongoose.model("FaceMeasurement", faceMeasurementSchema);
