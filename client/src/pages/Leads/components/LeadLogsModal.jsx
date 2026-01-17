import { useEffect, useState } from "react";
import { Modal, Badge, Spinner, Card, Button } from "../../../components";
import { getLeadActivities } from "../../../services/leads.service";

function fmt(ts) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(ts));
  } catch {
    return String(ts);
  }
}

function safePreview(v) {
  if (v === null || v === undefined || v === "") return "";

  // primitives
  if (
    typeof v === "string" ||
    typeof v === "number" ||
    typeof v === "boolean"
  ) {
    return String(v);
  }

  // Dates (just in case)
  if (v instanceof Date) return fmt(v);

  // objects
  if (typeof v === "object") {
    // ✅ Prefer human-friendly fields
    if (v.label) return String(v.label);
    if (v.preview) return String(v.preview);

    // common shapes
    if (v.iso && v.label) return String(v.label);

    // If it's a single key object like { name: "x" }
    const entries = Object.entries(v);
    if (entries.length === 1) {
      const [k, val] = entries[0];
      return `${k}: ${safePreview(val) || "—"}`;
    }

    // fallback: readable key:value
    return entries
      .slice(0, 6)
      .map(
        ([k, val]) =>
          `${k}: ${typeof val === "string" ? val : JSON.stringify(val)}`
      )
      .join(", ");
  }

  // fallback
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

const ACTION_LABELS = {
  lead_created: "Lead created",
  status_update: "Status updated",
  assignedTo_update: "Assignee changed",
  followUpAt_update: "Follow-up updated",
  note_add: "Note added",
  lead_archived: "Lead archived",
  lead_restored: "Lead restored",
  lead_hard_deleted: "Lead deleted",
  lead_details_updated: "Details updated",
};

function prettyValue(v, key) {
  if (v === null || v === undefined) return "—";

  // show your audit placeholders nicely
  if (v === "[updated]") return "Updated";

  // if backend sends { label / iso / preview }
  if (typeof v === "object") {
    if (v.label) return v.label;
    if (v.preview) return `"${v.preview}"`;
    if (v.iso) return fmt(v.iso);
    if (v.id && v.label) return v.label;
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  }

  // preferredTimeAt formatting
  if (key === "preferredTimeAt") {
    try {
      return fmt(v);
    } catch {
      return String(v);
    }
  }

  if (key === "outreach.assignedTo" || key === "assignedTo" || key === "outreach.assignedTo") {
  if (v?.label) return v.label;
  if (v?.id === null) return "Unassigned";
}


  return String(v);
}

function toPairs(fromObj, toObj) {
  const keys = new Set([
    ...Object.keys(fromObj || {}),
    ...Object.keys(toObj || {}),
  ]);
  return Array.from(keys).map((k) => ({
    key: k,
    from: fromObj?.[k],
    to: toObj?.[k],
  }));
}

const FIELD_LABELS = {
  name: "Name",
  email: "Email",
  phone: "Phone",
  preferredTimeType: "Preferred Time",
  preferredTimeAt: "Scheduled At",
  message: "Message",
};

export default function LeadLogsModal({ isOpen, onClose, lead }) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const HIDE_FROM_TO = new Set([
  "lead_created",
  // add more if you want:
  // "lead_archived",
  // "lead_restored",
  // "lead_hard_deleted",
]);

  useEffect(() => {
    if (!isOpen || !lead?._id) return;

    (async () => {
      try {
        setLoading(true);
        const res = await getLeadActivities(lead._id, { limit: 200, skip: 0 });
        setItems(res?.items || []);
      } catch (e) {
        console.error(e);
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [isOpen, lead?._id]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Activity Logs"
      size="lg"
      footer={
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      }
    >
      {loading ? (
        <div style={{ padding: 24, display: "flex", justifyContent: "center" }}>
          <Spinner />
        </div>
      ) : items.length === 0 ? (
        <div style={{ padding: 16, color: "var(--pv-dim)" }}>
          No activity logs found.
        </div>
      ) : (
        <div className="pv-col" style={{ gap: 10 }}>
          {items.map((it) => (
            <Card key={it._id}>
              {/* Header row */}
              <div
                className="pv-row"
                style={{
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div
                  className="pv-row"
                  style={{
                    gap: 8,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <Badge>
                    {ACTION_LABELS[it.action] || it.action || "activity"}
                  </Badge>

                  <span style={{ fontSize: 12, color: "var(--pv-dim)" }}>
                    by {it.userId?.name || it.userId?.email || "System"}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: "var(--pv-dim)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {fmt(it.createdAt)}
                </div>
              </div>

              {/* From/To row */}
              {!HIDE_FROM_TO.has(it.action) && (it.from !== undefined || it.to !== undefined) ? (
                <div style={{ marginTop: 10 }}>
                  {/* Table view for detail updates (object diff) */}
                  {it.action === "lead_details_updated" &&
                  it.from &&
                  typeof it.from === "object" &&
                  it.to &&
                  typeof it.to === "object" ? (
                    <div
                      style={{
                        border: "1px solid var(--pv-border)",
                        borderRadius: 10,
                        overflow: "hidden",
                      }}
                    >
                      <table
                        style={{ width: "100%", borderCollapse: "collapse" }}
                      >
                        <thead>
                          <tr style={{ background: "rgba(0,0,0,0.03)" }}>
                            <th
                              style={{
                                textAlign: "left",
                                padding: "10px 12px",
                                fontSize: 12,
                                fontWeight: 700,
                                width: 160,
                                // borderRight: "1px solid var(--pv-border)",
                              }}
                            >
                              Field
                            </th>
                            <th
                              style={{
                                textAlign: "left",
                                padding: "10px 12px",
                                fontSize: 12,
                                fontWeight: 700,
                              }}
                            >
                              From
                            </th>
                            <th
                              style={{
                                textAlign: "left",
                                padding: "10px 12px",
                                fontSize: 12,
                                fontWeight: 700,
                              }}
                            >
                              To
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {toPairs(it.from, it.to).map((row) => (
                            <tr key={row.key}>
                              <td
                                style={{
                                  padding: "10px 12px",
                                  fontSize: 13,
                                  fontWeight: 700,
                                  color: "var(--pv-dim)",
                                  borderTop: "1px solid var(--pv-border)",
                                  verticalAlign: "top",
                                  width: 160,
                                }}
                              >
                                {FIELD_LABELS[row.key] || row.key}
                              </td>

                              <td
                                style={{
                                  padding: "10px 12px",
                                  fontSize: 13,
                                  borderTop: "1px solid var(--pv-border)",
                                  verticalAlign: "top",
                                  wordBreak: "break-word",
                                }}
                              >
                                {prettyValue(row.from, row.key)}
                              </td>

                              <td
                                style={{
                                  padding: "10px 12px",
                                  fontSize: 13,
                                  borderTop: "1px solid var(--pv-border)",
                                  verticalAlign: "top",
                                  wordBreak: "break-word",
                                }}
                              >
                                {prettyValue(row.to, row.key)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    // Fallback simple view for other actions
                    <div style={{ fontSize: 13, wordBreak: "break-word" }}>
                      <span style={{ color: "var(--pv-dim)", fontWeight: 700 }}>
                        From:
                      </span>{" "}
                      <span>{safePreview(it.from) || "—"}</span>{" "}
                      <span
                        style={{
                          color: "var(--pv-dim)",
                          fontWeight: 700,
                          marginLeft: 10,
                        }}
                      >
                        To:
                      </span>{" "}
                      <span>{safePreview(it.to) || "—"}</span>
                    </div>
                  )}
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </Modal>
  );
}
