// utils/auth/otp.js
const crypto = require("crypto");

exports.genOtp = () => String(Math.floor(100000 + Math.random() * 900000));

exports.hashOtp = (code) =>
  crypto.createHmac("sha256", process.env.OTP_PEPPER || "pepper")
        .update(code)
        .digest("hex");
