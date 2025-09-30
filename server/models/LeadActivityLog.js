// server/models/LeadActivityLog.js
import mongoose from "mongoose";

const LeadActivityLogSchema = new mongoose.Schema(
  {
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },       // optional if system
    action: { type: String, required: true },                             // e.g. status_update, lead_archived
    field:  { type: String },                                             // optional for lifecycle events
    from:   { type: mongoose.Schema.Types.Mixed },                        // preserve types
    to:     { type: mongoose.Schema.Types.Mixed },
    meta:   { type: mongoose.Schema.Types.Mixed, default: {} },           // extra context (archivedBy, etc.)
    ip:        { type: String },
    userAgent: { type: String },
    requestId: { type: String },                                          // if you add a request-id middleware
  },
  { timestamps: true }
);

LeadActivityLogSchema.index({ leadId: 1, createdAt: -1 });

export default mongoose.model("LeadActivityLog", LeadActivityLogSchema);
