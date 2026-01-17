import React, { useMemo, useState } from "react";

/**
 * Admin page: BSE Orders (read-only)
 * Calls your backend -> backend calls BSE /s2/order_list
 *
 * Assumes your PV admin JWT is stored in localStorage as `token`.
 * If your app stores it differently, replace getAuthHeader().
 */

function getAuthHeader() {
  const token = localStorage.getItem("token"); // <-- change if needed
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function isoToday() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export default function BseOrders() {
  const [openClose, setOpenClose] = useState("o"); // o=open, c=closed, a=all (if supported)
  const [fromDate, setFromDate] = useState("2026-01-01");
  const [toDate, setToDate] = useState(isoToday());
  const [start, setStart] = useState(0);
  const [length, setLength] = useState(10);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [raw, setRaw] = useState(null);

  const rows = useMemo(() => {
    const lists = raw?.data?.lists || raw?.lists || [];
    return Array.isArray(lists) ? lists : [];
  }, [raw]);

  async function fetchOrders(e) {
    e?.preventDefault?.();
    setLoading(true);
    setError("");
    setRaw(null);

    try {
      const payload = {
        data: {
          fields: ["ALL"],
          start: Number(start) || 0,
          length: Number(length) || 10,
          filter_param: {
            open_close: openClose,
            placed_at_after: fromDate,
            placed_at_before: toDate,
          },
        },
      };

      const res = await fetch("http://localhost:3000/api/bse/orders/list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(), // protect this route with PV admin auth
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || `Request failed (${res.status})`);
      }

      setRaw(data);
    } catch (err) {
      setError(err?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>BSE Orders (Admin)</h2>
      <p style={{ marginTop: 4, opacity: 0.8 }}>
        Read-only view from BSE <code>/s2/order_list</code> via your backend.
      </p>

      <form onSubmit={fetchOrders} style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
        <label>
          Status
          <select value={openClose} onChange={(e) => setOpenClose(e.target.value)} style={{ display: "block" }}>
            <option value="o">Open</option>
            <option value="c">Closed</option>
            <option value="a">All</option>
          </select>
        </label>

        <label>
          From
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={{ display: "block" }} />
        </label>

        <label>
          To
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={{ display: "block" }} />
        </label>

        <label>
          Start
          <input
            type="number"
            min="0"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            style={{ display: "block", width: 90 }}
          />
        </label>

        <label>
          Page size
          <input
            type="number"
            min="1"
            max="100"
            value={length}
            onChange={(e) => setLength(e.target.value)}
            style={{ display: "block", width: 90 }}
          />
        </label>

        <button type="submit" disabled={loading} style={{ height: 40, marginTop: 18 }}>
          {loading ? "Loading..." : "Fetch Orders"}
        </button>
      </form>

      {error ? (
        <div style={{ marginTop: 12, padding: 12, background: "#ffe8e8", border: "1px solid #ffb3b3" }}>
          <b>Error:</b> {error}
        </div>
      ) : null}

      <div style={{ marginTop: 16 }}>
        <h3 style={{ marginBottom: 8 }}>Results ({rows.length})</h3>

        <div style={{ overflowX: "auto", border: "1px solid #ddd" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>Order ID</th>
                <th style={th}>Status</th>
                <th style={th}>Placed At</th>
                <th style={th}>Scheme</th>
                <th style={th}>Amount</th>
                <th style={th}>UCC</th>
                <th style={th}>Folio</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={r?.order_id || idx}>
                  <td style={td}>{r?.order_id || "-"}</td>
                  <td style={td}>{r?.status || r?.order_status || "-"}</td>
                  <td style={td}>{r?.placed_at || r?.order_date || "-"}</td>
                  <td style={td}>{r?.scheme_name || r?.scheme || "-"}</td>
                  <td style={td}>{r?.amount ?? "-"}</td>
                  <td style={td}>{r?.investor_ucc || r?.ucc || "-"}</td>
                  <td style={td}>{r?.folio || "-"}</td>
                </tr>
              ))}
              {rows.length === 0 && !loading ? (
                <tr>
                  <td style={td} colSpan={7}>
                    No data returned (could be no orders in this environment/date range).
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <details style={{ marginTop: 12 }}>
          <summary>Raw response (debug)</summary>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {raw ? JSON.stringify(raw, null, 2) : "No response yet"}
          </pre>
        </details>
      </div>
    </div>
  );
}

const th = { textAlign: "left", padding: 10, borderBottom: "1px solid #ddd", background: "#fafafa", whiteSpace: "nowrap" };
const td = { padding: 10, borderBottom: "1px solid #eee", whiteSpace: "nowrap" };
