// src/store/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import { getCurrentUser } from "../../services/authService";



// Read once on startup
const initialToken = localStorage.getItem("token") || "";

export const authenticateUser = createAsyncThunk(
    "auth/authenticateUser",
    async (_, { getState, dispatch, rejectWithValue }) => {
        const { token } = getState().auth;

        // no token → treat as logged out
        if (!token) {
            return rejectWithValue("NO_TOKEN");
        }

        try {
            // 1) Check token expiry first
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;

            if (decoded.exp < currentTime) {
                // logout and notify
                dispatch(logout());
                toast.error("Session Timed Out! Please Login again");
                return rejectWithValue("TOKEN_EXPIRED");
            }
        } catch {
            dispatch(logout());
            toast.error("Invalid session. Please Login again");
            return rejectWithValue("TOKEN_INVALID");
        }

        // 2) fetch /me
        try {
            const user = await getCurrentUser();
            if (!user) return rejectWithValue("FETCH_FAILED");
            return user;
        } catch (err) {
            if (err.status === 401 || err.status === 403) {
                dispatch(logout()); // ✅ break the cycle
                toast.error(err.message || "Unauthorized. Please sign in.");
                return rejectWithValue("UNAUTHORIZED");
            }
            toast.error(err.message || "Failed to fetch user");
            return rejectWithValue("FETCH_FAILED");
        }
    }
);
const authSlice = createSlice({
    name: "auth",
    initialState: {
        token: initialToken,
        user: null,
        isFetching: false,
        initialized: false,
    },
    reducers: {
        storeToken(state, action) {
            state.token = action.payload || "";
            localStorage.setItem("token", state.token);
        },
        logout(state) {
            state.token = "";
            state.user = null;
            localStorage.removeItem("token");
            state.initialized = true;
        },
        setUser(state, action) {
            state.user = action.payload;
        },
        markInitialized(state) { state.initialized = true; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(authenticateUser.pending, (state) => {
                state.isFetching = true;
            })
            .addCase(authenticateUser.fulfilled, (state, action) => {
                state.isFetching = false;
                state.user = action.payload ?? null;
                state.initialized = true;
            })
            .addCase(authenticateUser.rejected, (state) => {
                state.isFetching = false;
                state.user = null;
                state.initialized = true;
                // if (["FETCH_FAILED", "UNAUTHORIZED"].includes(action.payload)) {
                //     state.user = null;
                // }
            });

    },
});

export const { storeToken, logout, setUser,markInitialized  } = authSlice.actions;

// Selectors
export const selectToken = (state) => state.auth.token;
export const selectUser = (state) => state.auth.user;
export const selectIsFetching = (state) => state.auth.isFetching;
export const selectIsLoggedIn = (state) => !!state.auth.token;
export const selectInitialized = (state) => state.auth.initialized;

export default authSlice.reducer;
