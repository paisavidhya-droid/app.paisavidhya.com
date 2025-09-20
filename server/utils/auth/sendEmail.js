// sendEmail.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true, // Use SSL
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

    

const sendEmail = async (to, subject, text) => {
    try {
        const info = await transporter.sendMail({
            from: '"Paisavihya" <zeeshan@ganitschool.com>',
            to,
            subject,
            text,
        });

        // console.log("Email sent:", info.messageId);
    } catch (err) {
        console.error("Failed to send email:", err);
    }
}
module.exports = sendEmail;