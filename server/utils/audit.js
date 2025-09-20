// utils/audit.js
const AuditLog = require('../models/AuditLog');
const { sanitizeForAudit } = require('./sanitize');

exports.addAudit = async ({ req, action, entity, entityId, before, after }) => {
  try {
    const log = new AuditLog({
      userId: req.user ? req.user.sub : null,
      action,
      entity,
      entityId,
       before: sanitizeForAudit(before),
      after:  sanitizeForAudit(after),
      ip: req.ip,
      userAgent: req.get('user-agent') || ''
    });
    await log.save();
  } catch (err) {
    console.error('Failed to save audit log:', err.message);
  }
};
