import mongoose from "mongoose";
import crypto from "crypto";

const generateNumericProductId = () => {
  const number = crypto.randomInt(100000, 999999);
  return `LENZOO-${number}`;
};

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      default: generateNumericProductId,
      unique: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    images: {
      type: [String],
      default: [],
    },

    // ✅ Pricing
    originalPrice: {
      type: Number,
      required: true,
    },
    sellingPrice: {
      type: Number,
      required: true,
    },

    // ✅ Product Details with Enums
    productType: {
      type: String,
      enum: [
        "Eyeglasses",
        "Sunglasses",
        "Computer Glasses",
        "Reading Glasses",
        "Contact Lenses",
      ],
      required: true,
    },
    frameType: {
      type: String,
      enum: ["Full Rim", "Half Rim", "Rimless"],
      required: true,
    },
    frameShape: {
      type: String,
      enum: [
        "Round",
        "Rectangle",
        "Square",
        "Aviator",
        "Cat Eye",
        "Hexagonal",
        "Wayfarer",
      ],
      required: true,
    },
    frameSize: {
      type: String,
      enum: [
        "Extra Narrow",
        "Narrow",
        "Medium",
        "Wide",
        "Extra Wide",
      ],
      required: true,
    },
    suitableFor: {
      type: [String],
      enum: ["Men", "Women", "Kids"],
      required: true,
    },

    // ✅ Optional Additional Frame Details
    frameWidth: {
      type: String, // e.g. "140 mm"
    },
    frameDimensions: {
      type: String, // e.g. "52-18-140"
    },
    frameColor: {
      type: String, // e.g. "Black", "Blue", "Transparent"
    },
    weight: {
      type: String, // e.g. "22g"
    },
    material: {
      type: String, // e.g. "Metal", "Plastic", "TR90", "Acetate"
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
