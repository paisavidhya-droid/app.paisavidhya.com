// server/controllers/leadActivity.controller.js
import LeadActivityLog from "../models/LeadActivityLog.js";

export async function listLeadActivities(req, res) {
  try {
    const { leadId } = req.params;

    const items = await LeadActivityLog.find({ leadId })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("userId", "name email") 

    res.json({ items });
  } catch (e) {
    console.error("listLeadActivities error:", e);
    res.status(500).json({ error: "internal_error" });
  }
}
