// services/otpSender.js
import  sendSmsOtp  from '../utils/auth/exotel.js';
import { toE164 } from '../utils/auth/phone.js';

export const sendOtpByPreference = async (user, otp) => {
  const phone = toE164(user.phoneNumber, 'IN');
  if (!phone) return { ok: false, error: 'BAD_PHONE' };

  // Only SMS
  const sms = await sendSmsOtp(phone, otp);
  return sms;
};
