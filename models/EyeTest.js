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
      discriminationScore: { type: Number, default: 0 },
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
        colors: [String],
        differentColor: String,
        opacityLevel: Number,
        selectedIndex: Number,
        correct: Boolean,
        eye: String,
      },
    ],
  },
  { timestamps: true }
);

const colorVisionTestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    currentStep: { type: Number, default: 1 },
    activeEye: { type: String, enum: ["left", "right"], required: true },
    rightEyeResult: {
      correctCounter: { type: Number, default: 0 },
      incorrectCounter: { type: Number, default: 0 },
      finished: { type: Boolean, default: false },
    },
    leftEyeResult: {
      correctCounter: { type: Number, default: 0 },
      incorrectCounter: { type: Number, default: false },
      finished: { type: Boolean, default: false },
    },
    logs: [
      {
        step: Number,
        imageName: String,
        options: [String],
        correctOption: String,
        selectedOption: String,
        correct: Boolean,
        eye: String,
      },
    ],
  },
  { timestamps: true }
);

const astigmatismTestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    activeEye: {
      type: String,
      enum: ["left", "right"],
      required: true,
    },
    currentStep: { type: Number, default: 1 },

    rightEyeResult: {
      seesAllLinesEqually: { type: Boolean, default: null }, // true = Yes, false = No
      finished: { type: Boolean, default: false },
    },

    leftEyeResult: {
      seesAllLinesEqually: { type: Boolean, default: null },
      finished: { type: Boolean, default: false },
    },

    logs: [
      {
        step: Number,
        eye: { type: String, enum: ["left", "right"] },
        userResponse: { type: Boolean }, // true = Yes, false = No
        imageShown: { type: String }, // optional: you can save SVG name if needed
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const tumblingETestSchema = new mongoose.Schema(
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
      correctCounter: { type: Number, default: 0 },
      incorrectCounter: { type: Number, default: 0 },
      finished: { type: Boolean, default: false },
    },

    leftEyeResult: {
      correctCounter: { type: Number, default: 0 },
      incorrectCounter: { type: Number, default: 0 },
      finished: { type: Boolean, default: false },
    },

    logs: [
      {
        step: Number,
        eye: { type: String, enum: ["left", "right"] },
        shownDirection: { type: String, enum: ["up", "down", "left", "right"] },
        selectedDirection: { type: String, enum: ["up", "down", "left", "right"] },
        correct: Boolean,
        imageShown: String, // optional - agar image ka naam save karna ho
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const TumblingETest = mongoose.model("TumblingETest", tumblingETestSchema);
const AstigmatismTest = mongoose.model("AstigmatismTest", astigmatismTestSchema);
const ColorVisionTest = mongoose.model("ColorVisionTest", colorVisionTestSchema);
const VisualAcuity = mongoose.model("VisualAcuity", visualAcuitySchema);
const ContrastSensitivity = mongoose.model(
  "ContrastSensitivity",
  contrastSensitivitySchema
);
export { VisualAcuity, ContrastSensitivity, ColorVisionTest, AstigmatismTest, TumblingETest };
