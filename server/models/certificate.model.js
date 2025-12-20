import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    certificateId: { type: String, unique: true, index: true, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },

    type: { type: String, default: "PV-FSP" }, // Financial Safety Pledge
    pledgeTitle: { type: String, default: "Financial Discipline & Safety Pledge" },

    issuedAt: { type: Date, required: true },
    status: { type: String, enum: ["active", "revoked"], default: "active" },

    // Optional metadata (nice to have)
    nameSnapshot: { type: String }, // store name at issue time
  },
  { timestamps: true }
);

const Certificate = mongoose.model("Certificate", certificateSchema);

export default Certificate;
