// server/utils/leadLogger.js
import LeadActivityLog from "../models/LeadActivityLog.js";
import { sanitizeForAudit } from "../utils/sanitize.js"; 
import { shouldAuditGlobally } from "./logPolicy.js";

const getUserId = (req, explicitUserId) =>
  explicitUserId ?? (req?.user ? (req.user._id || req.user.sub || null) : null);

export async function logLeadActivity({
  req,
  leadId,
  userId,
  action,
  field,
  from,
  to,
  meta,
}) {
  try {
    const actor = getUserId(req, userId);
    const safeFrom = sanitizeForAudit(from);
    const safeTo   = sanitizeForAudit(to);
    const requestId = req?.requestId || req?.id || undefined;

    // Always write the per-lead timeline
    LeadActivityLog.create({
      leadId,
      userId: actor,
      action,
      field,                      // optional is fine now
      from: safeFrom,
      to:   safeTo,
      meta: meta || {},
      ip: req?.ip,
      userAgent: req?.get?.('user-agent') || req?.headers?.['user-agent'],
      requestId,
    }).catch(e => console.error('LeadActivity save failed:', e.message));

    // Conditionally write to global AuditLog
    if (shouldAuditGlobally(action, { field, from: safeFrom, to: safeTo, meta })) {
      addAudit({
        req,
        action: `LEAD:${action}`,
        entity: 'lead',
        entityId: leadId?.toString?.() || leadId,
        before: safeFrom,
        after:  safeTo,
        meta: { ...(meta || {}), field, requestId },
      });
    }
  } catch (err) {
    console.error('logLeadActivity failed:', err.message);
  }
}
