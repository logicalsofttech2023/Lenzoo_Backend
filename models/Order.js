import mongoose from "mongoose";
import crypto from "crypto";

const generateNumericOrderId = () => {
  const number = crypto.randomInt(100000, 999999);
  return `#LZ+${number}`;
};

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      default: generateNumericOrderId,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: Number,
        price: Number,
      },
    ],
    totalAmount: Number,
    shippingAddress: {
      name: String,
      phone: String,
      addressLine: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["placed", "processing", "shipped", "delivered", "cancelled"],
      default: "placed",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
