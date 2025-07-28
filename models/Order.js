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
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShippingAddress",
      required: true,
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

const shippingAddressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: String,
    email: String,
    phone: String,
    address: String,
    pincode: String,
    addressType: String,
    isDefault: Boolean,
  },
  { timestamps: true }
);

const ShippingAddress = mongoose.model(
  "ShippingAddress",
  shippingAddressSchema
);
const Order = mongoose.model("Order", orderSchema);
export { ShippingAddress, Order };
