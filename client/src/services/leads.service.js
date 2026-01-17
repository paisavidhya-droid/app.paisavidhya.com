// src/services/leadsService.js
import axiosInstance from "../api/axios";

const BASE = "/api/leads";

/**
 * POST /api/leads (public/admin)
 * Creates a lead (dedupe handled server-side)
 * headers: x-dedupe-minutes
 * body: { name, phone, email?, message?, source?, tags?, interests?, consent?, context?, preferredTimeType?, preferredTimeAt? }
 * returns: { leadId, deduped, status, preferredTimeType, preferredTimeAt }
 */
export const createLead = async (payload, { dedupeMinutes = 10 } = {}) => {
    const { data } = await axiosInstance.post(BASE, payload, {
        headers: { "x-dedupe-minutes": String(dedupeMinutes) },
    });
    return data;
};


export const createLeadOps = async (payload) => {
  const { data } = await axiosInstance.post("/api/leads/ops", payload, {
    headers: { "x-dedupe-minutes": "0" }, // bypass for manual
  });
  return data;
};

/**
 * GET /api/leads (ops/admin)
 * Query: { status, source, phone, limit, skip, includeArchived? }
 * Returns: { items, total }
 */
export const listLeads = async (params = {}) => {
  const { data } = await axiosInstance.get(BASE, { params });
  return data;
};

/**
 * GET /api/leads/:id (ops/admin)
 * Returns: lead document
 */
export const getLeadById = async (id) => {
    const { data } = await axiosInstance.get(`${BASE}/${id}`);
    return data;
};

/**
 * PATCH /api/leads/:id/outreach (ops/admin)
 * patch: { status?, note?, followUpAt?, assignedTo? }
 * Returns: { leadId, status, followUpAt, assignedTo, lastActivityAt, notesCount, latestNote }
 */
export const updateLeadOutreach = async (id, patch = {}) => {
    const { data } = await axiosInstance.patch(`${BASE}/${id}/outreach`, patch);
    return data;
};

/**
 * POST /api/leads/:id/transfer (ops/admin)  ✅ (recommended if you add a dedicated backend route)
 * body: { assigneeId }
 * Returns: { leadId, assignedTo, lastActivityAt }
 *
 * If you DIDN'T create this backend route yet, use updateLeadOutreach(id,{assignedTo})
 */
/**
 * Transfer lead is just "assignedTo" update (keep API consistent)
 */
export const transferLead = async ({ leadId, assigneeId }) => {
    return updateLeadOutreach(leadId, { assignedTo: assigneeId });
};

/**
 * DELETE /api/leads/:id (ops/admin) – soft delete (archive)
 * Returns: { leadId, archivedAt, archivedBy }
 */
export const archiveLeadById = async (id) => {
    const { data } = await axiosInstance.delete(`${BASE}/${id}`);
    return data;
};

/**
 * POST /api/leads/:id/restore (ops/admin)
 * Returns: { leadId, archivedAt: null }
 */
export const restoreLeadById = async (id) => {
    const { data } = await axiosInstance.post(`${BASE}/${id}/restore`);
    return data;
};

/**
 * DELETE /api/leads/:id/hard (admin) – irreversible
 * Returns: 204 No Content (or JSON if you change backend)
 */
export const hardDeleteLeadById = async (id) => {
    const res = await axiosInstance.delete(`${BASE}/${id}/hard`);
    return res.data;
};

export const updateLeadById = async (id, patch = {}) => {
  const { data } = await axiosInstance.patch(`${BASE}/${id}`, patch);
  return data;
};



// Bulk operations
export const bulkArchiveLeads = async (leadIds = []) => {
  const { data } = await axiosInstance.post(`${BASE}/bulk/archive`, { leadIds });
  return data;
};

export const bulkRestoreLeads = async (leadIds = []) => {
  const { data } = await axiosInstance.post(`${BASE}/bulk/restore`, { leadIds });
  return data;
};

export const bulkTransferLeads = async ({ leadIds = [], assigneeId }) => {
  const { data } = await axiosInstance.post(`${BASE}/bulk/transfer`, {
    leadIds,
    assigneeId,
  });
  return data;
};

export const bulkHardDeleteLeads = async (leadIds = []) => {
  const { data } = await axiosInstance.post(`${BASE}/bulk/hard-delete`, { leadIds });
  return data;
};


export const getLeadActivities = async (leadId, { limit = 100, skip = 0 } = {}) => {
    const { data } = await axiosInstance.get(`${BASE}/${leadId}/activities`, {
        params: { limit, skip },
    });
    return data;
};




