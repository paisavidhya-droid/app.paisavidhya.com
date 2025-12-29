// src/services/userService.js
import axiosInstance from "../api/axios";

const BASE = "/api/users";

/**
 * POST /api/users  (admin) – create STAFF/ADMIN/CUSTOMER
 * body: { name, email, password, phoneNumber, role? }
 */
export const adminCreateUser = async (payload) => {
  const res = await axiosInstance.post(`${BASE}`, payload);
  return res.data; // safe user (no password)
};

/**
 * GET /api/users  (admin) – optional filters: ?role=STAFF&q=abc
 */
export const getAllUsers = async ({ q = "", role = "", status = "", limit = 10, skip = 0 } = {}) => {
  const params = { q, role, status, limit, skip };
  const { data } = await axiosInstance.get(BASE, { params });
  return data; // { items, total, limit, skip }
};

/**
 * GET /api/users/staff  (admin) – list ALL staff/admin (any status)
 * Supports: q, limit, skip
 * Returns { items, total, limit, skip }
 */
export const listStaffUsers = async ({ q = "", limit = 50, skip = 0 } = {}) => {
  const params = { q, limit, skip };
  const { data } = await axiosInstance.get(`${BASE}/staff`, { params });
  return data; // { items, total, limit, skip }
};

/**
 * GET /api/users/assignable  (admin) – ACTIVE staff/admin only
 * Supports: limit
 * Returns { items }
 */
export const listAssignableUsers = async ({ limit = 200 } = {}) => {
  const params = { limit };
  const { data } = await axiosInstance.get(`${BASE}/assignable`, { params });
  return data; // { items }
};

/**
 * PATCH /api/users/:id  (admin or self)
 * Non-admin cannot change role/status (enforced by backend)
 */
export const updateUserById = async (id, patch) => {
  const res = await axiosInstance.patch(`${BASE}/${id}`, patch);
  return res.data; // updated user
};

/**
 * GET /api/users/:id  (admin or self)
 */
export const getUserById = async (id) => {
  const res = await axiosInstance.get(`${BASE}/${id}`);
  return res.data; // user
};


/**
 * DELETE /api/users/:id  (admin)
 */
export const deleteUserById = async (id) => {
  const res = await axiosInstance.delete(`${BASE}/${id}`);
  return res.data; // { message, id }
};

// with org association
export const takePledge = async (payload = {}) => {
  const res = await axiosInstance.post(`${BASE}/pledge`, payload);
  return res.data;
};


export const downloadCertificate = async () => {
  const res = await axiosInstance.get(`${BASE}/certificate`, {
    responseType: "arraybuffer",   
  });
  return res.data; 
};






// without org
// export const takePledge = async () => {
//   const res = await axiosInstance.post(`${BASE}/pledge`);
//   return res.data;             
// };