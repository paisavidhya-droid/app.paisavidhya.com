import User from "../models/user.model.js";
import Certificate from "../models/certificate.model.js";

// GET /api/public/pledge/stats
export const pledgeStats = async (req, res, next) => {
  try {
    // Option 1 (recommended): count certificates of pledge type
    const totalPledges = await Certificate.countDocuments({ type: "PV-FSP" });

    // Today range (UTC). If you want India time, I’ll give that version too.
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);

    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setUTCDate(startOfToday.getUTCDate() + 1);

    const todayPledges = await Certificate.countDocuments({
      type: "PV-FSP",
      issuedAt: { $gte: startOfToday, $lt: startOfTomorrow },
    });

    const last7Start = new Date();
    last7Start.setUTCDate(last7Start.getUTCDate() - 7);

    const last7Days = await Certificate.countDocuments({
      type: "PV-FSP",
      issuedAt: { $gte: last7Start },
    });

    return res.json({
      success: true,
      totalPledges,
      todayPledges,
      last7Days,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
};
