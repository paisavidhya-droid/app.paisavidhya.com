// server/controllers/adminSummary.controller.js
import User from "../models/user.model.js";
import Lead from "../models/leadModel.js";
import AuditLog from "../models/AuditLog.js";

const escapeRegex = (s = "") => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getAdminSummary = async (req, res, next) => {
    try {
        const t0 = Date.now();

        const { from, to, q = "" } = req.query;

        // audit date filter (only for timeline)
        const createdAt = {};
        if (from) createdAt.$gte = new Date(from);
        if (to) createdAt.$lte = new Date(to);

        const auditFilter = {};
        if (from || to) auditFilter.createdAt = createdAt;

        if (q) {
            const rx = new RegExp(escapeRegex(q), "i");
            auditFilter.$or = [
                { action: rx },
                { entity: rx },
                { entityId: rx },
                { ip: rx },
                { userAgent: rx },
            ];
        }

        // Active today: distinct userIds in last 24h
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // Leads by status (robust)
        const leadsByStatusAgg = await Lead.aggregate([
            {
                $match: {
                    $or: [{ archivedAt: { $exists: false } }, { archivedAt: null }],
                },
            },
            {
                $group: {
                    _id: { $ifNull: ["$outreach.status", "$status"] },
                    count: { $sum: 1 },
                },
            },
        ]);

        const leadsByStatus = {};
        for (const r of leadsByStatusAgg) {
            leadsByStatus[r._id || "Unknown"] = r.count;
        }

        const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const [newLeads24h, followUpCount] = await Promise.all([
            Lead.countDocuments({
                createdAt: { $gte: since24h },
                $or: [{ archivedAt: { $exists: false } }, { archivedAt: null }],
            }),
            Lead.countDocuments({
                $or: [{ archivedAt: { $exists: false } }, { archivedAt: null }],
                $or: [
                    { "outreach.status": "Follow-Up" },
                    { status: "Follow-Up" },
                ],
            }),
        ]);


        // Leads by interest (robust + future-proof)
        const leadsByInterestAgg = await Lead.aggregate([
            {
                $match: {
                    $or: [{ archivedAt: { $exists: false } }, { archivedAt: null }],
                },
            },
            {
                $group: {
                    _id: { $ifNull: ["$interests", "Unknown"] },
                    count: { $sum: 1 },
                },
            },
        ]);

        const leadsByInterest = {};
        for (const r of leadsByInterestAgg) {
            leadsByInterest[r._id || "Unknown"] = r.count;
        }



        const [orgUsers, leadsTotal, activeUserIds, recentAudit] = await Promise.all([
            User.countDocuments({}),
            Lead.countDocuments({ $or: [{ archivedAt: { $exists: false } }, { archivedAt: null }] }),
            AuditLog.distinct("userId", { createdAt: { $gte: since } }),
            AuditLog.find(auditFilter).sort({ createdAt: -1 }).limit(6).lean(),
        ]);

        const activity = (recentAudit || []).map((x) => ({
            // send raw fields + a title (frontend can use either)
            action: x.action,
            entity: x.entity,
            entityId: x.entityId,
            userId: x.userId,
            createdAt: x.createdAt,

            title: `${x.action || "ACTIVITY"} · ${x.entity || "SYSTEM"}${x.entityId ? ` (${String(x.entityId).slice(-6)})` : ""
                }`,
            time: x.createdAt,
            actor: x.userId || "System",
        }));

        const serverLatencyMs = Date.now() - t0;

        res.json({
            filtersApplied: { from: from || "", to: to || "", q: q || "" },

            orgUsers,
            activeToday: (activeUserIds || []).filter(Boolean).length,

            leads: {
                total: leadsTotal,
                byStatus: leadsByStatus,
                new24h: newLeads24h,
                followUp: followUpCount,
                byInterest: leadsByInterest,
            },

            incidents: 0,
            activity,

            system: {
                serverLatencyMs,
                uptimeSec: Math.floor(process.uptime()),
                node: process.version,
                env: process.env.NODE_ENV || "development",
            },
        });
    } catch (err) {
        next(err);
    }
};
