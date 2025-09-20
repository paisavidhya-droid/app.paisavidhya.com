// src/services/userService.js
import axiosInstance from "../api/axios";

/**
 * POST /api/users  (admin) – create STAFF/ADMIN/CUSTOMER
 * body: { name, email, password, phoneNumber, role? }
 */
export const adminCreateUser = async (payload) => {
  const res = await axiosInstance.post("/api/users", payload);
  return res.data; // safe user (no password)
};

/**
 * GET /api/users  (admin) – optional filters: ?role=STAFF&q=abc
 */
export const adminListUsers = async ({ role, q } = {}) => {
  const params = {};
  if (role) params.role = role;
  if (q) params.q = q;

  const res = await axiosInstance.get("/api/users", { params });
  return res.data; // { items: [...] }
};

/**
 * GET /api/users/:id  (admin or self)
 */
export const getUserById = async (id) => {
  const res = await axiosInstance.get(`/api/users/${id}`);
  return res.data; // user
};

/**
 * PATCH /api/users/:id  (admin or self)
 * Non-admin cannot change role/status (enforced by backend)
 */
export const updateUserById = async (id, patch) => {
  const res = await axiosInstance.patch(`/api/users/${id}`, patch);
  return res.data; // updated user
};

/**
 * DELETE /api/users/:id  (admin)
 */
export const deleteUserById = async (id) => {
  const res = await axiosInstance.delete(`/api/users/${id}`);
  return res.data; // { message, id }
};
