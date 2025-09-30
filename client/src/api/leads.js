// src/api/leads.js
import axiosInstance from '../api/axios.js'; // your axiosInstance

const BASE = '/api/leads';

export const LeadsAPI = {
  // Create lead (dedupe handled server-side)
  create(payload, { dedupeMinutes = 10 } = {}) {
    return axiosInstance.post(BASE, payload, {
      headers: { 'x-dedupe-minutes': String(dedupeMinutes) },
    }).then(r => r.data);
  },

  // List leads with filters & pagination
  list({ status, source, phone, limit = 10, skip = 0 } = {}) {
    const params = {};
    if (status) params.status = status;
    if (source) params.source = source;
    if (phone)  params.phone  = phone.trim();
    params.limit = limit;
    params.skip  = skip;

    return axiosInstance.get(BASE, { params }).then(r => r.data);
  },

    get(id) {
    return axiosInstance.get(`${BASE}/${id}`).then(r => r.data);
  },

  // Update outreach of a lead
  updateOutreach(id, patch) {
    return axiosInstance.patch(`${BASE}/${id}/outreach`, patch).then(r => r.data);
  },
};
