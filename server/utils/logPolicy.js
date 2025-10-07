// server/utils/logPolicy.js
const DEFAULT_GLOBAL_ACTIONS = new Set([
  'lead_created',
  'lead_archived',
  'lead_restored',
  'lead_deleted',       // soft delete if you use that name
  'lead_hard_deleted',
  'assignedTo_update',
]);

const STAGE_BOUNDARY_STATUSES = new Set([
  'Contacted', 'Qualified', 'Meeting Scheduled', 'Won', 'Lost',
]);

export const shouldAuditGlobally = (action, payload = {}) => {
  if (DEFAULT_GLOBAL_ACTIONS.has(action)) return true;
  if (action === 'status_update') {
    const to = (payload?.to ?? '').toString();
    return STAGE_BOUNDARY_STATUSES.has(to);
  }
  return false;
};
