// client\src\api\users.js
import axiosInstance from "../api/axios";

const BASE = "/api/users";

export const UsersAPI = {
  list({ q = "", role = "", status = "", limit = 10, skip = 0 } = {}) {
    const params = { q, role, status, limit, skip };
    return axiosInstance.get(BASE, { params }).then(r => r.data);
  },
  get(id) {
    return axiosInstance.get(`${BASE}/${id}`).then(r => r.data);
  },
  invite(payload) {
    // { name, email, role }
    return axiosInstance.post(`${BASE}/invite`, payload).then(r => r.data);
  },
  update(id, patch) {
    // { role?, status? }  status: 'active' | 'disabled'
    return axiosInstance.patch(`${BASE}/${id}`, patch).then(r => r.data);
  },
  resetPassword(id) {
    return axiosInstance.post(`${BASE}/${id}/reset-password`).then(r => r.data);
  },
};
