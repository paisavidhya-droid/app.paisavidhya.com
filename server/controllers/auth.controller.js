// authController.js
import User from '../models/user.model.js';
import sendEmail from '../utils/auth/sendEmail.js';


// Generate and send OTP
const sendOtp = async (req, res) => {
    const { email } = req.body;

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const otpExpires = Date.now() + 10 * 60 * 1000; // Expires in 10 mins

    let user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }


    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    const subject = 'Paisavidhya: One-Time Password (OTP) for Password Reset';
    const message = `
Dear User,

You have requested to reset your password. Please use the following OTP to proceed:

Your One-Time Password (OTP) is: ${otp}

This OTP is valid for 10 minutes. Do not share this code with anyone.

If you did not request this, please ignore this email or contact our support team immediately.

Thank you,
The Support Team
  `;

    try {
        await sendEmail(email, subject, message);
        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (err) {
        // res.status(500).json({ message: 'Error sending email' });
        console.log(err)
    }
};
// Verify OTP and 
const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    res.status(200).json({ message: 'OTP verified' });
};

// Reset password
const resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }

    user.password = newPassword;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
};


export default {
  sendOtp,
  verifyOtp,
  resetPassword,
};