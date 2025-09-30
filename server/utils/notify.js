// Internal notifications (optional). No-op by default.
// You can extend with Slack webhook or SMTP if env vars are set.
import nodemailer from 'nodemailer';


export async function notifyNewLead(lead) {
    const { SLACK_WEBHOOK_URL, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, NOTIFY_TO } = process.env;


    // Example: Email notification if SMTP configured
    if (SMTP_HOST && SMTP_USER && SMTP_PASS && NOTIFY_TO) {
        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: Number(SMTP_PORT || 587),
            secure: false,
            auth: { user: SMTP_USER, pass: SMTP_PASS },
        });
        await transporter.sendMail({
            from: `Lead Bot <${SMTP_USER}>`,
            to: NOTIFY_TO,
            subject: `New Lead: ${lead.name} (${lead.phone})`,
            text: `Source: ${lead.source}\nPreferred Time: ${lead.preferredTime || '-'}\nTags: ${lead.tags?.join(', ') || '-'}\nCreated At: ${lead.createdAt}`,
        });
    }


    // TODO: Slack webhook support if SLACK_WEBHOOK_URL provided
}