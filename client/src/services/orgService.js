// src/services/orgService.js
import axiosInstance from "../api/axios";

const BASE = "/api/orgs";

/**
 * GET /api/orgs (admin)
 * query: { search, type, isActive, limit, skip }
 * returns: { items, total }
 */
export const getAllOrgs = async ({
  search = "",
  type = "",
  isActive = "true", // "true" | "false" | "all"
  limit = 20,
  skip = 0,
} = {}) => {
  const params = { search, type, isActive, limit, skip };
  const { data } = await axiosInstance.get(BASE, { params });
  return data;
};

/**
 * POST /api/orgs (admin)
 * body: { name, type, tagline, logoUrl, ... }
 */
export const createOrg = async (payload) => {
  const { data } = await axiosInstance.post(BASE, payload);
  return data;
};

/**
 * GET /api/orgs/:id (admin)
 */
export const getOrgById = async (id) => {
  const { data } = await axiosInstance.get(`${BASE}/${id}`);
  return data;
};

/**
 * PATCH /api/orgs/:id (admin)
 */
export const updateOrgById = async (id, patch) => {
  const { data } = await axiosInstance.patch(`${BASE}/${id}`, patch);
  return data;
};

/**
 * DELETE /api/orgs/:id (admin) – soft delete (isActive=false)
 */
export const deactivateOrgById = async (id) => {
  const { data } = await axiosInstance.delete(`${BASE}/${id}`);
  return data;
};

/**
 * GET /api/orgs/public/code/:code (public)
 * Used in pledge page: /pledge/:orgCode
 */
export const getOrgByCodePublic = async (code) => {
  const { data } = await axiosInstance.get(`${BASE}/public/code/${code}`);
  return data; // { name, shortCode, logoUrl, tagline, ... }
};


export const generateOrgPledgeLink = async (id) => {
  const { data } = await axiosInstance.post(`${BASE}/${id}/generate-link`);
  return data; // updated org
};
