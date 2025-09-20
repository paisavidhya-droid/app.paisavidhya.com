// src/api/axios.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_SERVER_URL, // ✅ Vite-compatible
  // withCredentials: true, // Send cookies for cross-origin requests
});


export function setupAxiosInterceptors(store) {
  axiosInstance.interceptors.request.use(
    (config) => {
      const state = store.getState();
      const token = state?.auth?.token ||
        localStorage.getItem("token") ||
        sessionStorage.getItem("token"); // optional fallback

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        delete config.headers.Authorization;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
}

export default axiosInstance;

