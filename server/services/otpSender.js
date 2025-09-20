// services/otpSender.js
const { sendSmsOtp } = require('../utils/auth/exotel');
const { toE164 } = require('../utils/auth/phone');

exports.sendOtpByPreference = async (user, otp) => {
  const phone = toE164(user.phoneNumber, 'IN');
  if (!phone) return { ok: false, error: 'BAD_PHONE' };

  // Only SMS
  const sms = await sendSmsOtp(phone, otp);
  return sms;
};
