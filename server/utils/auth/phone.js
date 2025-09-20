// utils/auth/phone.js
const { parsePhoneNumberFromString } = require('libphonenumber-js');

exports.toE164 = (raw, defaultCountry = 'IN') => {
  if (!raw) return null;
  const digits = String(raw).replace(/\D+/g, '');
  const parsed = parsePhoneNumberFromString(digits, defaultCountry);
  return parsed?.isValid() ? parsed.number : null; // e.g. +919876543210
};
