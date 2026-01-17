import { sendEmail } from "./sendEmail.js";
import { renderTemplate } from "./renderTemplate.js";

export async function sendPasswordResetOtpEmail({ to, otp, validityMinutes = 10, userName }) {
  const appName = process.env.APP_NAME || "Paisavidhya";
  const supportEmail = process.env.SUPPORT_EMAIL || "support@yourdomain.com";

  const subject = `${appName}: OTP for Password Reset`;

  const payload = {
    appName,
    otp,
    validityMinutes,
    supportEmail,
    userName: userName || "User",
  };

  const [text, html] = await Promise.all([
    renderTemplate("auth/reset-otp.text.hbs", payload),
    renderTemplate("auth/reset-otp.html.hbs", payload),
  ]);

  return sendEmail({ to, subject, text, html });
}
