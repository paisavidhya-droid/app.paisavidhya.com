// server/utils/auth/sendEmail.js
import { sendEmail as sesSendEmail } from "../../emails/sendEmail.js";

// Keep backward compatible signature:
// sendEmail(to, subject, text, html)
export default async function sendEmail(to, subject, text, html) {
  return sesSendEmail({ to, subject, text, html });
}

// // sendEmail.js
// import nodemailer from 'nodemailer';

// const { EMAIL_HOST, EMAIL_USER, EMAIL_PASS, EMAIL_PORT,  MAIL_FROM_NAME,   } = process.env;

// if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) {
//     throw new Error('Missing EMAIL_HOST/EMAIL_USER/EMAIL_PASS in env');
// }

// const port = Number(EMAIL_PORT);
// const secure = port === 465;


// const transporter = nodemailer.createTransport({
//     host: EMAIL_HOST,
//     port,
//     secure,
//     auth: {
//         user: EMAIL_USER,
//         pass: EMAIL_PASS,
//     },
//     // Debugging (enable temporarily if you need):
//     // logger: true,
//     // debug: true,
// });


// export default async function sendEmail(to, subject, text, html) {
//   const fromName = MAIL_FROM_NAME;
//   const fromAddr =  EMAIL_USER;

//   const info = await transporter.sendMail({
//     from: `"${fromName}" <${fromAddr}>`,
//     to,
//     subject,
//     text,     // plain-text fallback
//     html,     // HTML body
//   });

//   return info; // caller can log messageId if desired
// }

// // const sendEmail = async (to, subject, text, next) => {
// //     try {
// //         const info = await transporter.sendMail({
// //             from: `"Paisavidhya" <${EMAIL_USER}>`,
// //             to,
// //             subject,
// //             text,
// //         });

// //         // console.log("Email sent:", info.messageId);
// //     } catch (err) {
// //         // console.error("Failed to send email:", err);
// //         next(err);
// //     }
// // }
// // export default sendEmail;