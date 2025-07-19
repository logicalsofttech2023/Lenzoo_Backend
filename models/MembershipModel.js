import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      enum: ["Basic", "Plus", "Premium"],
      required: true,
      unique: true,
    },
    description: { type: String, required: true },

    planType: {
      type: String,
      enum: ["monthly", "6months", "1year"],
      required: true,
    },

    price: { type: Number, required: true },

    benefits: [
      {
        type: String, // e.g. "Free eye test", "AR fitting", "Priority delivery"
      },
    ],

    durationInDays: { type: Number, required: true }, // 30 / 180 / 365 etc.

    isRecurring: { type: Boolean, default: true }, // for future Pix/Stripe integration

    status: {
      type: String,
      enum: ["active", "expired"],
      default: "active",
    },
  },
  { timestamps: true }
);

const Membership = mongoose.model("Membership", membershipSchema);
export default Membership;
