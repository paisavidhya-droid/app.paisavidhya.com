// server/models/org.model.js
import mongoose from "mongoose";

const orgSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    shortCode: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["school", "college", "business", "ngo", "institute", "other"],
      default: "other",
    },
    logoUrl: String,
    tagline: String,

    contactPerson: String,
    contactEmail: String,
    contactPhone: String,
    website: String,

    address: String,
    city: String,
    state: String,
    pincode: String,

    isActive: { type: Boolean, default: true },

    pledgeLinkGeneratedAt: Date,

    stats: {
      totalPledges: { type: Number, default: 0 },
      lastPledgeAt: Date,
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Org", orgSchema);
