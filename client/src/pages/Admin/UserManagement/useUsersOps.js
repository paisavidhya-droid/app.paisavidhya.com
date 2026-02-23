// src/pages/admin/users/useUsersOps.js
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import {
  fetchUsers,
  updateUser,
  setUserListFilters,
  setUserListPage,
  selectUsersList,
  createUser,
  deleteUser,
} from "../../../app/slices/userSlice";

export function useUsersOps({ limit = 10 } = {}) {
  const dispatch = useDispatch();
  const list = useSelector(selectUsersList);
  const navigate = useNavigate();

  // UI state
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  // Keep filters in local state for debounce typing like you do now
  const [filters, setFilters] = useState({
    q: list.filters.q || "",
    role: (list.filters.role || "").toUpperCase(),   // ADMIN/STAFF/CUSTOMER
    status: (list.filters.status || "").toUpperCase(), // ACTIVE/SUSPENDED
  });

  // derived paging from skip/limit (1-based UI page)
  const page = useMemo(
    () => Math.floor((list.skip || 0) / (list.limit || limit)) + 1,
    [list.skip, list.limit, limit],
  );
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((list.total || 0) / (list.limit || limit))),
    [list.total, list.limit, limit],
  );

  const loading = list.loading;
  const error = list.error;
  const items = list.items || [];
  const total = list.total || 0;

  const goToUser = (id) => navigate(`/admin/users/${id}`);

  const refresh = () =>
    dispatch(
      fetchUsers({
        q: list.filters.q,
        role: list.filters.role,
        status: list.filters.status,
        limit: list.limit || limit,
        skip: list.skip || 0,
      }),
    );

  // Debounced auto-apply filters
  useEffect(() => {
    const t = setTimeout(() => {
      // write to slice
      dispatch(setUserListFilters(filters));
      dispatch(setUserListPage({ limit: list.limit || limit, skip: 0 }));

      // fetch with new filters
      dispatch(
        fetchUsers({
          ...filters,
          limit: list.limit || limit,
          skip: 0,
        }),
      );
    }, 350);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.q, filters.role, filters.status]);

  const setFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => setFilters({ q: "", role: "", status: "" });

  // ---- Selection ----
  const selectedCount = selectedIds.length;
  const pageIds = useMemo(() => items.map((u) => u._id), [items]);

  const isAllSelectedOnPage =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));

  const toggleOne = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleAllOnPage = () => {
    setSelectedIds((prev) => {
      if (isAllSelectedOnPage) return prev.filter((id) => !pageIds.includes(id));
      const s = new Set(prev);
      pageIds.forEach((id) => s.add(id));
      return Array.from(s);
    });
  };

  const clearSelection = () => setSelectedIds([]);

  // clear selection when page data changes (your existing behavior)
  useEffect(() => {
    clearSelection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  // Bulk ids computed from current-page selected users
  const selectedUsers = useMemo(() => {
    const map = new Map(items.map((u) => [u._id, u]));
    return selectedIds.map((id) => map.get(id)).filter(Boolean);
  }, [selectedIds, items]);

  const bulkSuspendIds = useMemo(
    () => selectedUsers.filter((u) => u.status !== "SUSPENDED").map((u) => u._id),
    [selectedUsers],
  );
  const bulkActivateIds = useMemo(
    () => selectedUsers.filter((u) => u.status === "SUSPENDED").map((u) => u._id),
    [selectedUsers],
  );

  const bulkDeleteIds = useMemo(() => selectedUsers.map((u) => u._id), [selectedUsers]);

  // ---- Page change ----
  const setPage = (nextPage) => {
    const lim = list.limit || limit;
    const skip = (nextPage - 1) * lim;
    dispatch(setUserListPage({ limit: lim, skip }));
    dispatch(
      fetchUsers({
        q: list.filters.q,
        role: list.filters.role,
        status: list.filters.status,
        limit: lim,
        skip,
      }),
    );
  };

  // ---- Actions ----
  const toggleStatus = async (u) => {
    const to = u.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    const result = await Swal.fire({
      title: `${to === "SUSPENDED" ? "Suspend" : "Activate"} user?`,
      text: `${u.name || u.email}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: to === "SUSPENDED" ? "#d33" : "#065f46",
      confirmButtonText: to === "SUSPENDED" ? "Yes, suspend" : "Yes, activate",
    });
    if (!result.isConfirmed) return;

    try {
      await dispatch(updateUser({ id: u._id, patch: { status: to } })).unwrap();
      toast.success(`User ${to === "ACTIVE" ? "activated" : "suspended"}`);
      refresh();
    } catch (e) {
      toast.error(String(e));
    }
  };

  const deleteOne = async (u) => {
    const nameOrEmail = u.name || u.email || "this user";
    const result = await Swal.fire({
      title: "Delete user?",
      text: `${nameOrEmail} — This cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete",
    });
    if (!result.isConfirmed) return;

    try {
      await dispatch(deleteUser(u._id)).unwrap();
      toast.success("User deleted");
      refresh();
    } catch (e) {
      toast.error(String(e));
    }
  };

  const bulkDelete = async (ids) => {
  if (!ids?.length) return;

  const result = await Swal.fire({
    title: `Delete ${ids.length} user(s)?`,
    text: "This cannot be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    confirmButtonText: "Yes, delete",
  });

  if (!result.isConfirmed) return;

  try {
    await Promise.all(ids.map((id) => dispatch(deleteUser(id)).unwrap()));
    toast.success(`Deleted ${ids.length} user(s)`);
    clearSelection();
    refresh();
  } catch (e) {
    toast.error(String(e));
  }
};

  const bulkSuspend = async (ids) => {
    if (!ids?.length) return;

    const result = await Swal.fire({
      title: `Suspend ${ids.length} user(s)?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, suspend",
    });
    if (!result.isConfirmed) return;

    try {
      await Promise.all(
        ids.map((id) => dispatch(updateUser({ id, patch: { status: "SUSPENDED" } })).unwrap()),
      );
      toast.success(`Suspended ${ids.length} user(s)`);
      clearSelection();
      refresh();
    } catch (e) {
      toast.error(String(e));
    }
  };

  const bulkActivate = async (ids) => {
    if (!ids?.length) return;

    const result = await Swal.fire({
      title: `Activate ${ids.length} user(s)?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#065f46",
      confirmButtonText: "Yes, activate",
    });
    if (!result.isConfirmed) return;

    try {
      await Promise.all(
        ids.map((id) => dispatch(updateUser({ id, patch: { status: "ACTIVE" } })).unwrap()),
      );
      toast.success(`Activated ${ids.length} user(s)`);
      clearSelection();
      refresh();
    } catch (e) {
      toast.error(String(e));
    }
  };

  const onCreated = async (payload) => {
    await dispatch(createUser(payload)).unwrap();
    // your thunk might already refresh, but refresh() is safe if not:
    refresh();
  };

  const onEdited = async ({ _id, role, status }) => {
    await dispatch(
      updateUser({
        id: _id,
        patch: {
          role: role ? role.toUpperCase() : undefined,
          status: status ? status.toUpperCase() : undefined,
        },
      }),
    ).unwrap();
    toast.success("User updated");
    refresh();
  };

  return {
    // data
    items,
    total,
    loading,
    error,

    // paging
    page,
    totalPages,
    setPage,

    // filters
    filters,
    setFilter,
    clearFilters,

    // selection
    selectedIds,
    selectedCount,
    isAllSelectedOnPage,
    toggleAllOnPage,
    toggleOne,
    clearSelection,

    // bulk computed
    bulkSuspendIds,
    bulkActivateIds,
    bulkDeleteIds,

    // actions
    refresh,
    goToUser,
    toggleStatus,
    deleteOne,
    bulkSuspend,
    bulkActivate,
    bulkDelete,

    // modals
    createUserOpen,
    setCreateUserOpen,
    editUser,
    setEditUser,
    onCreated,
    onEdited,
  };
}