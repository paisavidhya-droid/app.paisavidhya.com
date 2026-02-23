// src/services/profileService.js
import axiosInstance from "../api/axios";

/**
 * GET /api/profiles/me -> { profile }
 */
export const getMyProfile = async () => {
  const res = await axiosInstance.get("/api/profiles/me");
  return res.data.profile;
};

/**
 * PATCH /api/profiles/me -> { profile }
 * payload can include any subset of the Profile fields.
 */
export const saveMyProfile = async (payload) => {
  const res = await axiosInstance.patch("/api/profiles/me", payload);
  return res.data.profile;
};



/**
 * ADMIN: GET /api/profiles/:userId -> { profile }
 */
export const adminGetProfileByUserId = async (userId) => {
  const res = await axiosInstance.get(`/api/profiles/${userId}`);
  return res.data.profile;
};

/**
 * ADMIN: PATCH /api/profiles/:userId -> { profile }
 */
export const adminUpdateProfileByUserId = async (userId, patch) => {
  const res = await axiosInstance.patch(`/api/profiles/${userId}`, patch);
  return res.data.profile;
};
