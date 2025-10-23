// sendEmail.js
import nodemailer from 'nodemailer';

const { EMAIL_HOST, EMAIL_USER, EMAIL_PASS, EMAIL_PORT } = process.env;

if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) {
    throw new Error('Missing EMAIL_HOST/EMAIL_USER/EMAIL_PASS in env');
}

const port = Number(EMAIL_PORT);
const secure = port === 465;


const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port,
    secure,
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
    // Debugging (enable temporarily if you need):
    // logger: true,
    // debug: true,
});



const sendEmail = async (to, subject, text, next) => {
    try {
        const info = await transporter.sendMail({
            from: `"Paisavidhya" <${EMAIL_USER}>`,
            to,
            subject,
            text,
        });

        // console.log("Email sent:", info.messageId);
    } catch (err) {
        // console.error("Failed to send email:", err);
        next(err);
    }
}
export default sendEmail;