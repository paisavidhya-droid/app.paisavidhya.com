// utils/auth/exotel.js
import axios from 'axios';

const {
  EXOTEL_ACCOUNT_SID,
  EXOTEL_API_KEY,
  EXOTEL_API_TOKEN,
  EXOTEL_SMS_SENDER_ID,
  DLT_ENTITY_ID,
  DLT_TEMPLATE_ID,
  OTP_DEV_BYPASS,
} = process.env;

const http = axios.create({
  auth: { username: EXOTEL_API_KEY, password: EXOTEL_API_TOKEN },
  timeout: 10000,
});


// run once at boot to verify Exotel creds
// async function exotelSelfTest() {
//   try {
//     const url = `https://api.exotel.com/v1/Accounts/${process.env.EXOTEL_ACCOUNT_SID}/Users.json`;
//     const res = await http.get(url); // uses same axios instance with Basic auth
//     console.log('[Exotel][SelfTest] OK', res.status);
//   } catch (e) {
//     console.error('[Exotel][SelfTest] FAIL', e?.response?.status, e?.response?.data);
//   }
// }
// exotelSelfTest();




/** Send OTP over SMS (adjust payload to your Exotel SMS API variant) */
async function sendSmsOtp(toE164, otp) {
  if (OTP_DEV_BYPASS === '1') { console.log('[DEV][SMS OTP]', toE164, otp); return { ok: true, channel: 'sms', id: 'dev' }; }

  try {
    const payload = {
      From: EXOTEL_SMS_SENDER_ID,        // DLT header/sender
      To: toE164,
      Body: `Dear Customer, thank you for choosing Paisavidhya. Your OTP for Paisavidhya account verification is ${otp}. It is valid for 5 minutes. Do not share it with anyone.`,

      DltEntityId: DLT_ENTITY_ID,
      DltTemplateId: DLT_TEMPLATE_ID,


      // Body: `Dear Customer,Thank you for choosing Paisavidhya. Your Paisavidhya OTP is ${otp}. It expires in 5 minutes. Do not share it.`,
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


export default sendSmsOtp ;
