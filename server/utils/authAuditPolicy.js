// utils/authAuditPolicy.js
export const shouldAuditLoginSuccess = ({ role, isCustomer, newIp, newUa }) => {
  if (!role) return true;
  if (role === 'ADMIN' || role === 'STAFF') return true;    // always
  if (isCustomer) {
    // only when security-relevant
    if (newIp || newUa) return true;
    return false;
  }
  return true;
};
