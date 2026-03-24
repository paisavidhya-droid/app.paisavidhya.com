import axiosInstance from "../api/axios";

export const getVerificationOptions = async () => {
  try {
    const { data } = await axiosInstance.get("/api/auth/verification-options");
    return data;
  } catch (e) {
    const msg =
      e?.response?.data?.message || "Failed to load verification options";
    throw new Error(msg);
  }
};

export const verifyPhoneBypass = async (code) => {
  try {
    const { data } = await axiosInstance.post("/api/auth/verify-phone-bypass", {
      code,
    });
    return data;
  } catch (e) {
    const msg = e?.response?.data?.message || "Invalid bypass code";
    throw new Error(msg);
  }
};

export const getAdminVerificationSettings = async () => {
  try {
    const { data } = await axiosInstance.get("/api/admin/verification-settings");
    return data;
  } catch (e) {
    const msg =
      e?.response?.data?.message || "Failed to load admin verification settings";
    throw new Error(msg);
  }
};

export const updateAdminVerificationSettings = async (payload) => {
  try {
    const { data } = await axiosInstance.patch(
      "/api/admin/verification-settings",
      payload
    );
    return data;
  } catch (e) {
    const msg =
      e?.response?.data?.message || "Failed to update verification settings";
    throw new Error(msg);
  }
};