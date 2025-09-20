const router = require('express').Router();
const AuditLog = require('../models/AuditLog');
const auth = require('../middlewares/authMiddleware');
const { requireRole, ROLES }  = require('../middlewares/roleMiddleware');

router.get('/', auth, requireRole(ROLES.ADMIN), async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(Number(limit));
    res.json({ items: logs });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch logs', error: err.message });
  }
});

module.exports = router;
