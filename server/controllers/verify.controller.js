// controllers/verify.controller.js
import User from '../models/user.model.js';
import { genOtp, hashOtp } from '../utils/auth/otp.js';
import { sendOtpByPreference } from '../services/otpSender.js';

export const sendPhoneOtp = async (req, res) => {
    const userId = req.user?.id;               
    const user = await User.findById(userId);

    if (!user || !user.phoneNumber) return res.status(400).json({ message: "Phone not found" });

    // (Optional) throttle: if user.phoneOtpExpires && Date.now() < user.phoneOtpExpires - 4*60*1000 …

    const otp = genOtp();
    user.phoneOtpHash = hashOtp(otp);
    user.phoneOtpExpires = Date.now() + 5 * 60 * 1000; // 5 min
    user.phoneOtpAttempts = 0;
    await user.save();

    const result = await sendOtpByPreference(user, otp);
    if (!result.ok) return res.status(502).json({ message: "Failed to send OTP" });


    res.json({ ok: true });
};

export const verifyPhoneOtp = async (req, res) => {
    const { code } = req.body;
    const user = await User.findById(req.user.id);
    if (!user || !user.phoneOtpHash) return res.status(400).json({ message: "Invalid or expired OTP" });

    if (user.phoneOtpExpires < Date.now()) {
        user.phoneOtpHash = null; user.phoneOtpExpires = null;
        await user.save();
        return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // attempts guard
    if (user.phoneOtpAttempts >= 5) {
        return res.status(429).json({ message: "Too many attempts, try later" });
    }

    user.phoneOtpAttempts += 1;
    const ok = hashOtp(code) === user.phoneOtpHash;
    if (!ok) {
        await user.save();
        return res.status(400).json({ message: "Invalid or expired OTP" }); // uniform
    }

    // success
    user.phoneVerified = true;
    user.phoneOtpHash = null;
    user.phoneOtpExpires = null;
    user.phoneOtpAttempts = 0;
    await user.save();

    res.json({ ok: true });
};

// controllers/verify.controller.js (cont.)
import jwt from 'jsonwebtoken';
import sendEmail  from '../utils/auth/sendEmail.js';


export const sendEmailVerifyLink = async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user || !user.email) return res.status(400).json({ message: "Email not found" });

    const token = jwt.sign(
        { sub: user.id, purpose: "verify_email", v: user.emailVerifyVersion || 0 },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "10m" }
    );

    const url = `${process.env.APP_URL}/verify-email?token=${token}`;
    await sendEmail(user.email, "Verify your email", `Click to verify: ${url}`);

    res.json({ ok: true });
};

export const verifyEmailLink = async (req, res) => {
    try {
        const { token } = req.query;
        const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (payload.purpose !== "verify_email") throw new Error("bad purpose");

        const user = await User.findById(payload.sub);
        if (!user) throw new Error("no user");
        // optional: versioning check
        if ((user.emailVerifyVersion || 0) !== (payload.v || 0)) throw new Error("stale token");

        user.emailVerified = true;
        user.emailVerifyVersion = (user.emailVerifyVersion || 0) + 1; // invalidate old links
        await user.save();

        return res.redirect(`${process.env.APP_URL}/verify?email=1`);
    } catch (e) {
        return res.redirect(`${process.env.APP_URL}/verify?email=0`);
    }
};


export const verifyEmailToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Missing token" });

    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (payload.purpose !== "verify_email") return res.status(400).json({ message: "Bad token" });

    const user = await User.findById(payload.sub);
    if (!user) return res.status(404).json({ message: "User not found" });
    if ((user.emailVerifyVersion || 0) !== (payload.v || 0)) {
      return res.status(400).json({ message: "Stale token" });
    }

    user.emailVerified = true;
    user.emailVerifyVersion = (user.emailVerifyVersion || 0) + 1;
    await user.save();

    return res.json({ ok: true });
  } catch (e) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }
};

