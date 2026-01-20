// client/src/services/adminSummaryService.js
import axiosInstance from "../api/axios";

/**
 * GET /api/admin/summary
 * params: { from, to, team, q }
 */
export const getAdminSummary = async (params = {}) => {
  const { data } = await axiosInstance.get("/api/admin/summary", { params });
  return data;
};



/**
 * GET /api/health
 */
export const getServerHealth = async () => {
  const { data } = await axiosInstance.get("/api/health");
  return data;
};
