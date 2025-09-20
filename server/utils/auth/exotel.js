// utils/auth/exotel.js
const axios = require('axios');

const {
  EXOTEL_ACCOUNT_SID,
  EXOTEL_API_KEY,
  EXOTEL_API_TOKEN,
  EXOTEL_SMS_SENDER_ID,
  DLT_ENTITY_ID,
  DLT_TEMPLATE_ID,
  OTP_DEV_BYPASS = '0',
} = process.env;

const http = axios.create({
  auth: { username: EXOTEL_API_KEY, password: EXOTEL_API_TOKEN },
  timeout: 10000,
});

/** Send OTP over SMS (adjust payload to your Exotel SMS API variant) */
async function sendSmsOtp(toE164, otp) {
  if (OTP_DEV_BYPASS === '1') { console.log('[DEV][SMS OTP]', toE164, otp); return { ok: true, channel: 'sms', id: 'dev' }; }

  try {
    const payload = {
      From: EXOTEL_SMS_SENDER_ID,        // DLT header/sender
      To: toE164,
      Body: `Dear Customer,Thank you for choosing Paisavidhya. Your registration is almost complete.To ensure compliance with telecom regulations, we require you to verify your registration using the following One-Time Password (OTP): ${otp}.Please enter this OTP on our registration page to complete the process. Kindly note that this OTP is valid for a single use and should not be shared with anyone for security reasons.If you did not initiate this registration, please ignore this message.Thank you for your cooperation.Best regards,Paisavidhya team.`,

      DltEntityId: DLT_ENTITY_ID,
      DltTemplateId: DLT_TEMPLATE_ID,


      // Body: `Your Paisavidhya OTP is ${otp}. It expires in 5 minutes. Do not share it.`,
      // template to be used 
      // Your Paisavidhya OTP is %d. It expires in %d minutes. Do not share it.


      // include TemplateId only if you have a real approved ID
      // ...(EXOTEL_SMS_TEMPLATE_ID ? { TemplateId: EXOTEL_SMS_TEMPLATE_ID } : {}),
    };

    const url = `https://api.exotel.com/v1/Accounts/${EXOTEL_ACCOUNT_SID}/Sms/send.json`;
    // const { data } = await http.post(url, payload);

    const params = new URLSearchParams(payload);
    const { data } = await http.post(url, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    return { ok: true, channel: 'sms', id: data?.SMSMessage?.Sid || data?.Sid || 'sms' };
  } catch (err) {
    console.error('[Exotel][SMS] failed', err?.response?.status, err?.response?.data || err.message);
    return { ok: false, error: 'SMS_FAILED' };
  }
}


module.exports = { sendSmsOtp };
