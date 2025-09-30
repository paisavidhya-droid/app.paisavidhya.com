const AuditLog = require('../models/AuditLog');
const { sanitizeForAudit } = require('./sanitize');

exports.addAudit = ({ req, action, entity, entityId, before, after, meta }) => {
  try {
    const log = new AuditLog({
      userId: req.user ? (req.user._id || req.user.sub) : null,
      action,
      entity,
      entityId,
      before: sanitizeForAudit(before),
      after: sanitizeForAudit(after),
      meta: meta || {},
      ip: req.ip,
      userAgent: req.get('user-agent') || ''
    });
    // Fire and forget
    log.save().catch(err => console.error('Audit log save failed:', err.message));
  } catch (err) {
    console.error('Audit logging error:', err.message);
  }
};



// // utils/audit.js
// const AuditLog = require('../models/AuditLog');
// const { sanitizeForAudit } = require('./sanitize');

// exports.addAudit = async ({ req, action, entity, entityId, before, after }) => {
//   try {
//     const log = new AuditLog({
//       userId: req.user ? req.user.sub : null,
//       action,
//       entity,
//       entityId,
//        before: sanitizeForAudit(before),
//       after:  sanitizeForAudit(after),
//       ip: req.ip,
//       userAgent: req.get('user-agent') || ''
//     });
//     await log.save();
//   } catch (err) {
//     console.error('Failed to save audit log:', err.message);
//   }
// };
