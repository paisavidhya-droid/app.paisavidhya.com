import { useEffect, useState } from "react";
import { getServerHealth } from "../services/adminSummary.service";

export function useHealth({ refreshKey = 0 } = {}) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  useEffect(() => {
    let alive = true;

    (async () => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const data = await getServerHealth();
        if (!alive) return;
        setState({ data, loading: false, error: null });
      } catch (e) {
        if (!alive) return;
        setState({
          data: null,
          loading: false,
          error: e?.response?.data?.message || e.message || "Health check failed",
        });
      }
    })();

    return () => {
      alive = false;
    };
  }, [refreshKey]);

  return state;
}
