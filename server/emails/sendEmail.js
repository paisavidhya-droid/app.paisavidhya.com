import { SendEmailCommand } from "@aws-sdk/client-ses";
import { sesClient } from "./sesClient.js";

export async function sendEmail({ to, subject, text, html, replyTo }) {
  if (!to) throw new Error("sendEmail: 'to' is required");
  if (!subject) throw new Error("sendEmail: 'subject' is required");

  const fromEmail = process.env.SES_FROM_EMAIL;
  const fromName = process.env.MAIL_FROM_NAME || process.env.APP_NAME || "App";

  if (!fromEmail) {
    throw new Error("Missing SES_FROM_EMAIL in env");
  }

  const source = `"${fromName}" <${fromEmail}>`;

  const cmd = new SendEmailCommand({
    Source: source,
    Destination: {
      ToAddresses: Array.isArray(to) ? to : [to],
    },
    Message: {
      Subject: { Data: subject, Charset: "UTF-8" },
      Body: {
        ...(html ? { Html: { Data: html, Charset: "UTF-8" } } : {}),
        ...(text ? { Text: { Data: text, Charset: "UTF-8" } } : {}),
      },
    },
    ...(replyTo ? { ReplyToAddresses: [replyTo] } : {}),
  });

  const res = await sesClient.send(cmd);
  return res; // contains MessageId
}
