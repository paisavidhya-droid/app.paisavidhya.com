// src/store/usersSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as userService from "../../services/userService";
import toast from "react-hot-toast";

/* =========================
   Thunks
   ========================= */

// List (all users; supports q, role, status, limit, skip)
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (params, { rejectWithValue }) => {
    try {
      // params: { q, role, status, limit, skip }
      const data = await userService.getAllUsers(params || {});
      return data; // { items, total, limit, skip }
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message);
    }
  }
);

// Staff/Admin list (any status; supports q, limit, skip)
export const fetchStaffUsers = createAsyncThunk(
  "users/fetchStaffUsers",
  async (params, { rejectWithValue }) => {
    try {
      const data = await userService.listStaffUsers(params || {});
      return data; // { items, total, limit, skip }
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message);
    }
  }
);

// Assignable (ACTIVE staff/admin only; supports limit)
export const fetchAssignableUsers = createAsyncThunk(
  "users/fetchAssignableUsers",
  async (params, { rejectWithValue }) => {
    try {
      const data = await userService.listAssignableUsers(params || {});
      return data; // { items }
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message);
    }
  }
);

// Single user
export const fetchUserById = createAsyncThunk(
  "users/fetchUserById",
  async (id, { rejectWithValue }) => {
    try {
      const data = await userService.getUserById(id);
      return data; // user
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || err.message);
    }
  }
);

// Create user (admin)
export const createUser = createAsyncThunk(
  "users/createUser",
  async (payload, { rejectWithValue, dispatch, getState }) => {
    try {
      const data = await userService.adminCreateUser(payload);
      toast.success("User created");
      // refresh current list with existing filters/pagination
      const { users: { list } } = getState();
      dispatch(fetchUsers({
        q: list.filters.q,
        role: list.filters.role,
        status: list.filters.status,
        limit: list.limit,
        skip: list.skip,
      }));
      return data;
    } catch (err) {
      const msg = err?.response?.data?.message || err.message;
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// Update user (admin or self)
export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ id, patch }, { rejectWithValue, dispatch, getState }) => {
    try {
      const data = await userService.updateUserById(id, patch);
      toast.success("User updated");
      // refresh list
      const { users: { list } } = getState();
      dispatch(fetchUsers({
        q: list.filters.q,
        role: list.filters.role,
        status: list.filters.status,
        limit: list.limit,
        skip: list.skip,
      }));
      return data;
    } catch (err) {
      const msg = err?.response?.data?.message || err.message;
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// Delete user (admin)
export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (id, { rejectWithValue, dispatch, getState }) => {
    try {
      await userService.deleteUserById(id);
      toast.success("User deleted");
      // refresh list
      const { users: { list } } = getState();
      dispatch(fetchUsers({
        q: list.filters.q,
        role: list.filters.role,
        status: list.filters.status,
        limit: list.limit,
        skip: list.skip,
      }));
      return { id };
    } catch (err) {
      const msg = err?.response?.data?.message || err.message;
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);


/* =========================
   Slice
   ========================= */

const initialState = {
  // paginated all-users list
  list: {
    items: [],
    total: 0,
    limit: 10,
    skip: 0,
    filters: { q: "", role: "", status: "" },
    loading: false,
    error: null,
  },

  // staff/admin directory (any status)
  staff: {
    items: [],
    total: 0,
    limit: 50,
    skip: 0,
    q: "",
    loading: false,
    error: null,
  },

  // assignable (active staff/admin only)
  assignable: {
    items: [],
    loading: false,
    error: null,
  },

  // byId cache (simple map)
  byId: {
    entities: {}, // { [id]: user }
    loading: false,
    error: null,
  },
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    // convenience setters for list filters/paging
    setUserListFilters(state, { payload }) {
      state.list.filters = {
        q: payload?.q ?? state.list.filters.q,
        role: payload?.role ?? state.list.filters.role,
        status: payload?.status ?? state.list.filters.status,
      };
    },
    setUserListPage(state, { payload }) {
      // payload: { limit?, skip? }
      if (typeof payload?.limit === "number") state.list.limit = payload.limit;
      if (typeof payload?.skip === "number") state.list.skip = payload.skip;
    },
    setStaffQuery(state, { payload }) {
      state.staff.q = payload ?? "";
    },
    setStaffPage(state, { payload }) {
      if (typeof payload?.limit === "number") state.staff.limit = payload.limit;
      if (typeof payload?.skip === "number") state.staff.skip = payload.skip;
    },
    // manual cache update if you want to push a user into byId
    cacheUser(state, { payload }) {
      if (payload?._id) state.byId.entities[payload._id] = payload;
    },
  },
  extraReducers: (builder) => {
    builder
      /* --- fetchUsers (all) --- */
      .addCase(fetchUsers.pending, (state) => {
        state.list.loading = true;
        state.list.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, { payload }) => {
        state.list.loading = false;
        state.list.items = payload.items || [];
        state.list.total = Number(payload.total || 0);
        state.list.limit = Number(payload.limit || state.list.limit);
        state.list.skip = Number(payload.skip || state.list.skip);
      })
      .addCase(fetchUsers.rejected, (state, { payload }) => {
        state.list.loading = false;
        state.list.error = payload || "Failed to load users";
      })

      /* --- fetchStaffUsers --- */
      .addCase(fetchStaffUsers.pending, (state) => {
        state.staff.loading = true;
        state.staff.error = null;
      })
      .addCase(fetchStaffUsers.fulfilled, (state, { payload }) => {
        state.staff.loading = false;
        state.staff.items = payload.items || [];
        state.staff.total = Number(payload.total || 0);
        state.staff.limit = Number(payload.limit || state.staff.limit);
        state.staff.skip = Number(payload.skip || state.staff.skip);
      })
      .addCase(fetchStaffUsers.rejected, (state, { payload }) => {
        state.staff.loading = false;
        state.staff.error = payload || "Failed to load staff";
      })

      /* --- fetchAssignableUsers --- */
      .addCase(fetchAssignableUsers.pending, (state) => {
        state.assignable.loading = true;
        state.assignable.error = null;
      })
      .addCase(fetchAssignableUsers.fulfilled, (state, { payload }) => {
        state.assignable.loading = false;
        state.assignable.items = payload.items || [];
      })
      .addCase(fetchAssignableUsers.rejected, (state, { payload }) => {
        state.assignable.loading = false;
        state.assignable.error = payload || "Failed to load assignable users";
      })

      /* --- fetchUserById --- */
      .addCase(fetchUserById.pending, (state) => {
        state.byId.loading = true;
        state.byId.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, { payload }) => {
        state.byId.loading = false;
        if (payload?._id) state.byId.entities[payload._id] = payload;
      })
      .addCase(fetchUserById.rejected, (state, { payload }) => {
        state.byId.loading = false;
        state.byId.error = payload || "Failed to fetch user";
      })

      /* --- create/update/delete just toggle loading via thunks if needed --- */
    //   .addCase(createUser.pending, (state) => { /* optional: spinner in forms */ })
      .addCase(createUser.rejected, (state, { payload }) => {
        state.list.error = payload || "Failed to create user";
      })
    //   .addCase(updateUser.pending, (state) => { /* optional */ })
      .addCase(updateUser.rejected, (state, { payload }) => {
        state.list.error = payload || "Failed to update user";
      })
    //   .addCase(deleteUser.pending, (state) => { /* optional */ })
      .addCase(deleteUser.rejected, (state, { payload }) => {
        state.list.error = payload || "Failed to delete user";
      });
  },
});

export const {
  setUserListFilters,
  setUserListPage,
  setStaffQuery,
  setStaffPage,
  cacheUser,
} = usersSlice.actions;

export default usersSlice.reducer;

/* =========================
   Selectors (handy)
   ========================= */
export const selectUsersList = (s) => s.users.list;
export const selectUsers = (s) => s.users.list.items;
export const selectUsersListLoading = (s) => s.users.list.loading;

export const selectStaffList = (s) => s.users.staff;
export const selectAssignable = (s) => s.users.assignable.items;

export const selectUserById = (id) => (s) => s.users.byId.entities[id];
