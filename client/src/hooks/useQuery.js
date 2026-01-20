import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Small query hook (no libs):
 * - abortable
 * - 1 retry by default
 * - stable refetch()
 */
export function useQuery(makePromise, deps, { retry = 1, initialData = null } = {}) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const attemptRef = useRef(0);
  const abortRef = useRef(null);

  const run = useCallback(async () => {
    attemptRef.current = 0;

    // Abort previous request if any
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    setError(null);

    while (true) {
      try {
        attemptRef.current += 1;
        const result = await makePromise({ signal: ctrl.signal });
        if (ctrl.signal.aborted) return;
        setData(result);
        setLoading(false);
        setError(null);
        return;
      } catch (e) {
        if (ctrl.signal.aborted) return;

        const msg =
          e?.response?.data?.message ||
          e?.message ||
          "Failed to load";

        if (attemptRef.current <= retry) continue;
        setData(initialData);
        setLoading(false);
        setError(msg);
        return;
      }
    }
  }, [makePromise, retry, initialData]);

  useEffect(() => {
    run();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, refetch: run };
}
