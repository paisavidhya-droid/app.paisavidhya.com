// src/services/authService.js
import axiosInstance from "../api/axios";

/**
 * POST /api/auth/register  → { user, token }
 */
export const register = async (payload) => {
      try {
    // payload: { name, email, password, phoneNumber }
    const res = await axiosInstance.post("/api/auth/register", payload);
    return res.data; // { user, token }
    } catch (e) {
    throw {
      message: e.response?.data?.message || "Registration failed",
      status: e.response?.status || 500,
    };
  }
};

/**
 * POST /api/auth/login  → { user, token }
 */
export const login = async (payload) => {
    // payload: { email, password }
    try {
        const res = await axiosInstance.post("/api/auth/login", payload);
        return res.data;
    } catch (e) {
        throw {
            message: e.response?.data?.message || "Login failed",
            status: e.response?.status || 500,
        };
    }
};

/**
 * GET /api/auth/me  → { user }
 */
export const getCurrentUser = async () => {
     try {
    const res = await axiosInstance.get("/api/auth/me");
    return res.data.user; // { user }
    } catch (e) {
    throw {
      message: e.response?.data?.message || "Failed to fetch current user",
      status: e.response?.status || 500,
    };
  }
};

