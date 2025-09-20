// src/services/verifyService.js
import axiosInstance from "../api/axios";

export const sendPhoneOtp = async () => {
    try {
        const { data } = await axiosInstance.post("/api/auth/send-phone-otp");
        return data;
    } catch (e) {
        const msg = e?.response?.data?.message || "Failed to send OTP";
        const err = new Error(msg);
        err.code = e?.response?.data?.code;
        throw err;
    }
};
export const verifyPhoneOtp = async (code) => {
    try {
        const { data } = await axiosInstance.post("/api/auth/verify-phone-otp", { code });
        return data;
    } catch (e) {
        const msg = e?.response?.data?.message || "Invalid or expired OTP";
        throw new Error(msg);
    }
};

export const sendEmailVerifyLink = async () => {
    try {
        const { data } = await axiosInstance.post("/api/auth/send-email-link");
        return data;
    } catch (e) {
        const msg = e?.response?.data?.message || "Failed to send link";
        throw new Error(msg);
    }
};
// magic link arrives via email, user clicks it; app receives /verified?email=1
