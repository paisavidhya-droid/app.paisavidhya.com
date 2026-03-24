import mongoose from "mongoose";

const appSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "global",
    },
    verification: {
      otpBypassEnabled: {
        type: Boolean,
        default: false,
      },
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

const AppSettings = mongoose.model("AppSettings", appSettingsSchema);

export default AppSettings;