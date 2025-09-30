// server/router/audit.routes.js
const router = require('express').Router();
const AuditLog = require('../models/AuditLog');
const auth = require('../middlewares/authMiddleware');
const { requireRole, ROLES }  = require('../middlewares/roleMiddleware');

router.get('/', auth, requireRole(ROLES.ADMIN), async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 50,
      q = '',
      action,
      entity,
      userId,
      from, // ISO date
      to,   // ISO date
      sort = 'createdAt',
      order = 'desc',
    } = req.query;

    const numericLimit = Math.min(Number(limit) || 50, 200);
    const numericPage  = Math.max(Number(page) || 1, 1);

    const filter = {};
    if (action) filter.action = action;
    if (entity) filter.entity = entity;
    if (userId) filter.userId = userId;

    // Date range
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to)   filter.createdAt.$lte = new Date(to);
    }

    // Free-text search on action/entity/entityId and IP/UA
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { action: rx },
        { entity: rx },
        { entityId: rx },
        { ip: rx },
        { userAgent: rx },
      ];
    }

    const sortObj = { [sort]: order === 'asc' ? 1 : -1 };

    const [items, total] = await Promise.all([
      AuditLog.find(filter)
        .sort(sortObj)
        .skip((numericPage - 1) * numericLimit)
        .limit(numericLimit)
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    res.json({
      items,
      page: numericPage,
      limit: numericLimit,
      total,
      totalPages: Math.ceil(total / numericLimit),
    });
  } catch (err) {
    // res.status(500).json({ message: 'Failed to fetch logs', error: err.message });
    console.log(err);
    next(err);
    
  }
});

// Optional CSV export
router.get('/export.csv', auth, requireRole(ROLES.ADMIN), async (req, res) => {
  try {
    const { limit = 5000 } = req.query;
    const rows = await AuditLog.find({})
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(limit) || 5000, 20000))
      .lean();

    const header = ['createdAt','userId','action','entity','entityId','ip','userAgent'];
    const escape = (v) => {
      if (v == null) return '';
      const s = typeof v === 'string' ? v : JSON.stringify(v);
      return `"${s.replace(/"/g, '""')}"`;
    };

    const csv = [
      header.join(','),
      ...rows.map(r => [
        r.createdAt?.toISOString?.() || '',
        r.userId || '',
        r.action || '',
        r.entity || '',
        r.entityId != null ? String(r.entityId) : '',
        r.ip || '',
        r.userAgent || '',
      ].map(escape).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="audit_export.csv"');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: 'Failed to export logs', error: err.message });
  }
});

module.exports = router;
