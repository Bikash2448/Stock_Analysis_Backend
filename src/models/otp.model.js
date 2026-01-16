import mongoose from "mongoose";
const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      lowercase: true,
      index: true,
      sparse: true,
    },
    mobile: {
      type: String,
      index: true,
      sparse: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Otp", otpSchema);