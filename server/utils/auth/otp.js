// utils/auth/otp.js
import crypto from "crypto";

export const genOtp = () => String(Math.floor(100000 + Math.random() * 900000));

export const hashOtp = (code) =>
  crypto.createHmac("sha256", process.env.OTP_PEPPER || "pepper")
        .update(code)
        .digest("hex");
