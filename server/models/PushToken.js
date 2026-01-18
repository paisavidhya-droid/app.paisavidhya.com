import mongoose from "mongoose";

const PushTokenSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    token: { type: String, unique: true, index: true },
    platform: { type: String, enum: ["expo", "android", "ios"], default: "expo" },
    lastSeenAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("PushToken", PushTokenSchema);
