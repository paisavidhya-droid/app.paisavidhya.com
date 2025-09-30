// client\src\app\slices\auditSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axios";
import { normalizeDate } from "../../utils/dateUtils";

// Async thunk to fetch audit logs
export const fetchAuditLogsThunk = createAsyncThunk(
  "audit/fetchLogs",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState().audit;
      const { page, limit, filters, sort, order } = state;

      const qs = new URLSearchParams({
        page,
        limit,
        q: filters.q || "",
        action: filters.action || "",
        entity: filters.entity || "",
        userId: filters.userId || "",
        from: normalizeDate(filters.from) || "",
        to: normalizeDate(filters.to) || "",
        sort: sort || "createdAt",
        order: order || "desc",
      }).toString();

      const res = await axiosInstance.get(`/api/audit?${qs}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const initialState = {
  items: [],
  total: 0,
  totalPages: 1,
  page: 1,
  limit: 50,
  sort: "createdAt",
  order: "desc",
  filters: {
    q: "",
    action: "",
    entity: "",
    userId: "",
    from: "",
    to: "",
  },
  autoRefresh: false,
  loading: { fetch: false },
  error: null,
};

const auditSlice = createSlice({
  name: "audit",
  initialState,
  reducers: {
    setFilter: (state, action) => {
      const { key, value } = action.payload;
      state.filters[key] = value;
      state.page = 1;
    },
    resetAuditFilters: (state) => {
      state.filters = {
        q: "",
        action: "",
        entity: "",
        userId: "",
        from: "",
        to: "",
      };
      state.page = 1;
      state.sort = "createdAt";
      state.order = "desc";
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setLimit: (state, action) => {
      state.limit = action.payload;
      state.page = 1;
    },
    setSort: (state, action) => {
      if (state.sort === action.payload.key) {
        state.order = state.order === "asc" ? "desc" : "asc";
      } else {
        state.sort = action.payload.key;
        state.order = "desc";
      }
      state.page = 1;
    },
    toggleAutoRefresh: (state, action) => {
      state.autoRefresh = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuditLogsThunk.pending, (state) => {
        state.loading.fetch = true;
        state.error = null;
      })
      .addCase(fetchAuditLogsThunk.fulfilled, (state, action) => {
        state.loading.fetch = false;
        state.items = action.payload.items || [];
        state.total = action.payload.total || 0;
        state.page = action.payload.page || 1;
        state.totalPages = action.payload.totalPages || 1;
      })
      .addCase(fetchAuditLogsThunk.rejected, (state, action) => {
        state.loading.fetch = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const {
  setFilter,
  resetAuditFilters,
  setPage,
  setLimit,
  setSort,
  toggleAutoRefresh,
} = auditSlice.actions;

export const selectAudit = (state) => state.audit;
export const selectAuditParams = (state) => ({
  ...state.audit.filters,
  page: state.audit.page,
  limit: state.audit.limit,
  sort: state.audit.sort,
  order: state.audit.order,
});

export default auditSlice.reducer;
