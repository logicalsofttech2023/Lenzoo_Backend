import mongoose from "mongoose";

const visualAcuitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    currentStep: { type: Number, default: 1 },
    activeEye: { type: String, enum: ["left", "right"], required: true },
    rightEyeAcuity: {
      value: { type: Number, default: 0 },
      finished: { type: Boolean, default: false },
      directionChangeCounter: { type: Number, default: 0 },
      highestStepCounter: { type: Number, default: 0 },
      smallestStepCounter: { type: Number, default: 0 },
    },
    leftEyeAcuity: {
      value: { type: Number, default: 0 },
      finished: { type: Boolean, default: false },
      directionChangeCounter: { type: Number, default: 0 },
      highestStepCounter: { type: Number, default: 0 },
      smallestStepCounter: { type: Number, default: 0 },
    },
    logs: [
      {
        step: Number,
        size: Number,
        selectedOption: String,
        correct: Boolean,
        eye: String,
      },
    ],
  },
  { timestamps: true }
);

const contrastSensitivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    currentStep: { type: Number, default: 1 },
    activeEye: {
      type: String,
      enum: ["left", "right"],
      required: true,
    },
    rightEyeResult: {
      discriminationScore: { type: Number, default: 0 }, // Score based on correct answers
      finished: { type: Boolean, default: false },
      correctCounter: { type: Number, default: 0 },
      incorrectCounter: { type: Number, default: 0 },
    },
    leftEyeResult: {
      discriminationScore: { type: Number, default: 0 },
      finished: { type: Boolean, default: false },
      correctCounter: { type: Number, default: 0 },
      incorrectCounter: { type: Number, default: 0 },
    },
    logs: [
      {
        step: Number,
        colors: [String], // Array of 9 hex color codes
        differentColor: String, // Hex code of the different color
        opacityLevel: Number, // Opacity of the different color (0 to 1)
        selectedIndex: Number, // Index of user's selection (0-8)
        correct: Boolean,
        eye: String,
      },
    ],
  },
  { timestamps: true }
);

const VisualAcuity = mongoose.model("VisualAcuity", visualAcuitySchema);
const ContrastSensitivity = mongoose.model(
  "ContrastSensitivity",
  contrastSensitivitySchema
);
export { VisualAcuity, ContrastSensitivity };
