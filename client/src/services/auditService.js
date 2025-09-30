// src/services/auditService.js
import axiosInstance from "../api/axios";
import { normalizeDate } from "../utils/dateUtils";

/**
 * GET /api/audit
 * params: { page, limit, q, action, entity, userId, from, to, sort, order }
 */
export const listAuditLogs = async (params) => {
  const qs = {
    ...params,
    from: normalizeDate(params?.from) || "",
    to: normalizeDate(params?.to) || "",
  };
  const res = await axiosInstance.get("/api/audit", { params: qs });
  return res.data; // { items, page, limit, total, totalPages }
};

/**
 * Download audit logs as CSV with proper Authorization
 */
export const downloadAuditCsv = async (params = {}) => {
  const qs = new URLSearchParams({
    ...params,
    from: normalizeDate(params?.from) || "",
    to: normalizeDate(params?.to) || "",
  }).toString();

  const res = await axiosInstance.get(`/api/audit/export.csv?${qs}`, {
    responseType: "blob", // 👈 ensures raw CSV
  });

  // Convert response to downloadable file
  const blob = new Blob([res.data], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "audit_export.csv");
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};