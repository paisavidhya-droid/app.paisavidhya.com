// utils/sanitize.js
exports.sanitizeForAudit = (obj) => {
  if (!obj) return obj;
  const data = JSON.parse(JSON.stringify(obj));
  if (data.password) delete data.password;
  if (data.pan) data.pan = '***MASKED***';
  if (data.aadhaar) data.aadhaar = '***MASKED***';
  return data;
};
