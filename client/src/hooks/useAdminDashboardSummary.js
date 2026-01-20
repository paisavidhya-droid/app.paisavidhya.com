import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchAdminDashboardSummary } from "../services/dashboardSummary.service";

export function useAdminDashboardSummary(filters) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const abortRef = useRef(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const depKey = useMemo(
    () =>
      JSON.stringify({
        from: filters?.from || "",
        to: filters?.to || "",
        team: filters?.team || "",
        q: filters?.q || "",
      }),
    [filters?.from, filters?.to, filters?.team, filters?.q]
  );

  const refetch = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let alive = true;

    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    (async () => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const data = await fetchAdminDashboardSummary(filters, { signal: ctrl.signal });
        if (!alive || ctrl.signal.aborted) return;
        setState({ data, loading: false, error: null });
      } catch (e) {
        if (!alive || ctrl.signal.aborted) return;
        setState({
          data: null,
          loading: false,
          error: e?.response?.data?.message || e.message || "Failed to load dashboard",
        });
      }
    })();

    return () => {
      alive = false;
      ctrl.abort();
    };
    // 👇 refreshKey forces re-run when you click Refresh
  }, [depKey, refreshKey]);

  return { ...state, refetch };
}
