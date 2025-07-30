import mongoose from "mongoose";

const centerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  city: String,
  state: String,
  pinCode: String,
  contactNumber: String,
  timeSlots: [
    {
      time: String,
      isBooked: { type: Boolean, default: false },
      status: {
        type: String,
        enum: ["available", "not_available"],
        default: "available",
      },
    },
  ],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  centerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Center",
    required: true,
  },

  date: { type: String, required: true },
  time: { type: String, required: true },
  status: {
    type: String,
    enum: [
      "booked",
      "cancelled_by_user",
      "cancelled_by_admin",
      "completed",
      "rescheduled",
    ],
    default: "booked",
  },
  createdAt: { type: Date, default: Date.now },
});

const Appointment = mongoose.model("Appointment", appointmentSchema);
const Center = mongoose.model("Center", centerSchema);

export { Appointment, Center };
