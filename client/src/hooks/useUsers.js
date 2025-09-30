// src/hooks/useUsers.js
import { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  // thunks
  fetchUsers,
  fetchStaffUsers,
  fetchAssignableUsers,
  fetchUserById,
  createUser,
  updateUser,
  deleteUser,
  // selectors
  selectUsersList,
  selectUsers,
  selectUsersListLoading,
  selectStaffList,
  selectAssignable,
  selectUserById as makeSelectUserById,
  // actions
  setUserListFilters,
  setUserListPage,
  setStaffQuery,
  setStaffPage,
} from "../app/slices/userSlice";

/**
 * ---------- Assignable ----------
 * Good for modals like TransferLeadModal: load-on-open + cached.
 */
export function useAssignableUsers(shouldLoad = true, { limit } = {}) {
  const dispatch = useDispatch();
  const assignable = useSelector(selectAssignable) || [];
  const loading = useSelector((s) => s.users.assignable.loading);
  const error = useSelector((s) => s.users.assignable.error);

  const load = useCallback(
    (params = {}) => dispatch(fetchAssignableUsers(params)),
    [dispatch]
  );

  useEffect(() => {
    if (!shouldLoad) return;
    if (!loading && assignable.length === 0) {
      load({ ...(limit ? { limit } : {}) });
    }
  }, [shouldLoad, loading, assignable.length, limit, load]);

  return { assignable, loading, error, reload: load };
}

/**
 * ---------- Users (paginated all-users list) ----------
 * Exposes filters/paging state and helpers. Auto-loads on mount by default.
 */
export function useUsersList({
  autoLoad = true,
  // optional initial filters/paging to push into store once (e.g., on a screen)
  initial = null,
} = {}) {
  const dispatch = useDispatch();
  const list = useSelector(selectUsersList); // { items,total,limit,skip,filters,loading,error }
  const items = useSelector(selectUsers);
  const loading = useSelector(selectUsersListLoading);

  // one-shot initializer for filters/paging
  useEffect(() => {
    if (!initial) return;
    if (initial.filters) dispatch(setUserListFilters(initial.filters));
    if (typeof initial.limit === "number" || typeof initial.skip === "number") {
      dispatch(setUserListPage({ limit: initial.limit, skip: initial.skip }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  const load = useCallback(
    (params) => dispatch(fetchUsers(params ?? {
      q: list.filters.q,
      role: list.filters.role,
      status: list.filters.status,
      limit: list.limit,
      skip: list.skip,
    })),
    [dispatch, list.filters.q, list.filters.role, list.filters.status, list.limit, list.skip]
  );

  useEffect(() => {
    if (!autoLoad) return;
    // naive "auto-load": whenever these change, refresh list
    load();
  }, [
    autoLoad,
    list.filters.q,
    list.filters.role,
    list.filters.status,
    list.limit,
    list.skip,
    load,
  ]);

  const setFilters = useCallback(
    (next) => dispatch(setUserListFilters(next)),
    [dispatch]
  );
  const setPage = useCallback(
    (next) => dispatch(setUserListPage(next)),
    [dispatch]
  );

  return {
    list,
    items,
    loading,
    error: list.error,
    // helpers
    setFilters,
    setPage,
    reload: load,
  };
}

/**
 * ---------- Staff (paginated staff/admin directory) ----------
 */
export function useStaffUsers({
  autoLoad = true,
} = {}) {
  const dispatch = useDispatch();
  const staff = useSelector(selectStaffList); // { items,total,limit,skip,q,loading,error }

  const load = useCallback(
    (params) => dispatch(fetchStaffUsers(params ?? {
      q: staff.q,
      limit: staff.limit,
      skip: staff.skip,
    })),
    [dispatch, staff.q, staff.limit, staff.skip]
  );

  useEffect(() => {
    if (!autoLoad) return;
    load();
  }, [autoLoad, staff.q, staff.limit, staff.skip, load]);

  const setQuery = useCallback(
    (q) => dispatch(setStaffQuery(q)),
    [dispatch]
  );
  const setPage = useCallback(
    (next) => dispatch(setStaffPage(next)),
    [dispatch]
  );

  return {
    staff,
    items: staff.items || [],
    loading: staff.loading,
    error: staff.error,
    setQuery,
    setPage,
    reload: load,
  };
}

/**
 * ---------- User by ID (entity cache) ----------
 * Will fetch if not present. Provide `id` and optional `shouldLoad`.
 */
export function useUserById(id, { shouldLoad = true } = {}) {
  const dispatch = useDispatch();
  const selectUserById = useMemo(() => makeSelectUserById(id), [id]);
  const user = useSelector(selectUserById);
  const loading = useSelector((s) => s.users.byId.loading);
  const error = useSelector((s) => s.users.byId.error);

  const load = useCallback(
    () => dispatch(fetchUserById(id)),
    [dispatch, id]
  );

  useEffect(() => {
    if (!id || !shouldLoad) return;
    if (!user && !loading) load();
  }, [id, shouldLoad, user, loading, load]);

  return { user, loading, error, reload: load };
}

/**
 * ---------- Mutations ----------
 * These wrap your thunks and just give you `mutate` helpers.
 */
export function useCreateUser() {
  const dispatch = useDispatch();
  const mutate = useCallback(
    (payload) => dispatch(createUser(payload)).unwrap(),
    [dispatch]
  );
  return { createUser: mutate };
}

export function useUpdateUser() {
  const dispatch = useDispatch();
  const mutate = useCallback(
    ({ id, patch }) => dispatch(updateUser({ id, patch })).unwrap(),
    [dispatch]
  );
  return { updateUser: mutate };
}

export function useDeleteUser() {
  const dispatch = useDispatch();
  const mutate = useCallback(
    (id) => dispatch(deleteUser(id)).unwrap(),
    [dispatch]
  );
  return { deleteUser: mutate };
}
