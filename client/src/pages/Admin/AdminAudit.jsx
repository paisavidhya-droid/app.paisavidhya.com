// If expecting 1000+ rows per page, switch to react-window for smooth rendering.
import { useEffect, useState } from "react";
import {
  Card,
  Button,
  Badge,
  Alert,
  Skeleton,
  Tooltip,
  Input,
  Select,
  Modal,
  Tabs,
  Drawer,
  IconButton,
  Switch,
  Spinner,
  Pagination,
} from "../../components";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAuditLogsThunk,
  selectAudit,
  selectAuditParams,
  setFilter,
  setPage,
  setLimit,
  setSort,
  toggleAutoRefresh,
  resetAuditFilters,
} from "../../app/slices/auditSlice";
import toast from "react-hot-toast";
import { formatDisplayDate } from "../../utils/dateUtils";
import { downloadAuditCsv } from "../../services/auditService";

const ACTIONS = [
  "LOGIN_SUCCESS",
  "LOGIN_FAILED",
  "ROLE_UPDATE",
  "USER_CREATE",
  "USER_UPDATE",
  "USER_DELETE",
  "BILLING_RUN",
  "EXPORT",
  "INTEGRATION_CHANGE",
];
const ENTITIES = ["USER", "ROLE", "CALCULATOR", "EXOTEL", "BILLING", "SYSTEM"];

const actionColors = {
  LOGIN_SUCCESS: "success", // green
  LOGIN_FAILED: "danger", // red
  USER_DELETE: "danger", // red
  USER_CREATE: "success", // green
  USER_UPDATE: "info", // blue
  ROLE_UPDATE: "warning", // yellow/orange
  BILLING_RUN: "info", // blue
  EXPORT: "info", // blue
  INTEGRATION_CHANGE: "warning", // yellow/orange
};

function Row({ children, style }) {
  return (
    <div
      className="pv-row"
      style={{ gap: 12, flexWrap: "wrap", ...(style || {}) }}
    >
      {children}
    </div>
  );
}
function Col({ children, style }) {
  return (
    <div className="pv-col" style={{ gap: 12, ...(style || {}) }}>
      {children}
    </div>
  );
}

function CodeBlock({ json }) {
  return (
    <pre
      style={{
        background: "var(--pv-muted-bg)",
        padding: 12,
        borderRadius: 8,
        overflow: "auto",
        maxHeight: 280,
      }}
    >
      {typeof json === "string" ? json : JSON.stringify(json, null, 2)}
    </pre>
  );
}
function SafeCodeBlock({ json, max = 50000 }) {
  const str = typeof json === "string" ? json : JSON.stringify(json, null, 2);
  const clipped = str.length > max ? str.slice(0, max) + "\n…(truncated)" : str;
  return <CodeBlock json={clipped} />;
}
function DiffView({ before, after }) {
  return (
    <Row style={{ alignItems: "stretch" }}>
      <Col style={{ flex: "1 1 320px" }}>
        <div style={{ fontWeight: 600 }}>Before</div>
        <CodeBlock json={before ?? {}} />
      </Col>
      <Col style={{ flex: "1 1 320px" }}>
        <div style={{ fontWeight: 600 }}>After</div>
        <CodeBlock json={after ?? {}} />
      </Col>
    </Row>
  );
}

export default function AdminAudit() {
  const dispatch = useDispatch();
  const {
    items,
    total,
    totalPages,
    page,
    limit,
    sort,
    order,
    loading,
    error,
    filters,
    autoRefresh,
  } = useSelector(selectAudit);

  const params = useSelector(selectAuditParams);

  // Debounced search input
  const [qInput, setQInput] = useState(filters.q || "");
  useEffect(() => {
    const t = setTimeout(
      () => dispatch(setFilter({ key: "q", value: qInput })),
      250
    );
    return () => clearTimeout(t);
  }, [qInput, dispatch]);

  // Fetch logs whenever params change
  useEffect(() => {
    dispatch(fetchAuditLogsThunk());
  }, [
    dispatch,
    params.page,
    params.limit,
    params.q,
    params.action,
    params.entity,
    params.userId,
    params.from,
    params.to,
    params.sort,
    params.order,
  ]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;
    const t = setInterval(() => dispatch(fetchAuditLogsThunk()), 30000);
    return () => clearInterval(t);
  }, [dispatch, autoRefresh]);

  // Local UI state
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const downloadCsv = async () => {
    toast.loading("Preparing CSV…", { id: "audit-export" });
    try {
      await downloadAuditCsv({
        limit: 10000,
        q: filters.q,
        action: filters.action,
        entity: filters.entity,
        userId: filters.userId,
        from: filters.from,
        to: filters.to,
        sort,
        order,
      });
      toast.success("Export ready", { id: "audit-export" });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to export", {
        id: "audit-export",
      });
    }
  };

  const columns = [
    { key: "createdAt", label: "Time" },
    { key: "userId", label: "User" },
    { key: "action", label: "Action" },
    { key: "entity", label: "Entity" },
    { key: "entityId", label: "Entity ID" },
    { key: "ip", label: "IP" },
    { key: "userAgent", label: "User Agent" },
    { key: "details", label: "Details" },
  ];

  return (
    <div
      className="pv-container"
      style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 16px" }}
    >
      {/* Header */}
      <Card>
        <Row style={{ justifyContent: "space-between", alignItems: "center" }}>
          <Col>
            <div style={{ fontSize: 14, color: "var(--pv-dim)" }}>
              Security & Compliance
            </div>
            <h1 style={{ margin: 0, fontSize: 26 }}>
              Audit Log <Badge>Admin</Badge>
            </h1>
          </Col>
          <Row>
            <Tooltip content="Export latest entries as CSV">
              <Button onClick={downloadCsv} variant="ghost">
                Export CSV
              </Button>
            </Tooltip>
            <Button
              variant="ghost"
              onClick={() => dispatch(fetchAuditLogsThunk())}
            >
              Refresh
            </Button>
          </Row>
        </Row>
      </Card>

      {/* Filters */}
      <Card>
        <Row style={{ alignItems: "center" }}>
          <Input
            placeholder="Search text (action, entity, id, ip, ua)"
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
          />
          <Select
            value={filters.action}
            onChange={(e) =>
              dispatch(setFilter({ key: "action", value: e.target.value }))
            }
          >
            <option value="">All actions</option>
            {ACTIONS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </Select>
          <Select
            value={filters.entity}
            onChange={(e) =>
              dispatch(setFilter({ key: "entity", value: e.target.value }))
            }
          >
            <option value="">All entities</option>
            {ENTITIES.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </Select>
          <Input
            placeholder="User ID (optional)"
            value={filters.userId}
            onChange={(e) =>
              dispatch(setFilter({ key: "userId", value: e.target.value }))
            }
          />
          <label style={{ fontSize: 12, color: "var(--pv-dim)" }}>From</label>
          <Input
            type="date"
            value={filters.from}
            onChange={(e) =>
              dispatch(setFilter({ key: "from", value: e.target.value }))
            }
          />
          <label style={{ fontSize: 12, color: "var(--pv-dim)" }}>To</label>
          <Input
            type="date"
            value={filters.to}
            onChange={(e) =>
              dispatch(setFilter({ key: "to", value: e.target.value }))
            }
          />
          <Select
            value={limit}
            onChange={(e) => dispatch(setLimit(Number(e.target.value)))}
          >
            {[25, 50, 100, 200].map((n) => (
              <option key={n} value={n}>
                {n}/page
              </option>
            ))}
          </Select>
          <Button variant="ghost" onClick={() => dispatch(resetAuditFilters())}>
            Reset
          </Button>
          <Button variant="ghost" onClick={() => setDrawerOpen(true)}>
            Advanced filters
          </Button>
        </Row>
        <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <div style={{ padding: 16 }}>
            <h3 style={{ marginTop: 0 }}>Advanced filters</h3>
            <div className="pv-col" style={{ gap: 10 }}>
              <Input
                label="User ID"
                value={filters.userId}
                onChange={(e) =>
                  dispatch(setFilter({ key: "userId", value: e.target.value }))
                }
              />
              <Select
                label="Action"
                value={filters.action}
                onChange={(e) =>
                  dispatch(setFilter({ key: "action", value: e.target.value }))
                }
              >
                <option value="">All actions</option>
                {ACTIONS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </Select>
              <Select
                label="Entity"
                value={filters.entity}
                onChange={(e) =>
                  dispatch(setFilter({ key: "entity", value: e.target.value }))
                }
              >
                <option value="">All entities</option>
                {ENTITIES.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </Select>
              <div className="pv-row" style={{ gap: 8 }}>
                <Input
                  type="date"
                  label="From"
                  value={filters.from}
                  onChange={(e) =>
                    dispatch(setFilter({ key: "from", value: e.target.value }))
                  }
                />
                <Input
                  type="date"
                  label="To"
                  value={filters.to}
                  onChange={(e) =>
                    dispatch(setFilter({ key: "to", value: e.target.value }))
                  }
                />
              </div>
              <div
                className="pv-row"
                style={{
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>Auto refresh (30s)</span>
                <Switch
                  checked={autoRefresh}
                  onChange={(val) => dispatch(toggleAutoRefresh(val))}
                />
              </div>
              <div
                className="pv-row"
                style={{ justifyContent: "flex-end", gap: 8 }}
              >
                <Button variant="ghost" onClick={() => setDrawerOpen(false)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    dispatch(setPage(1));
                    setDrawerOpen(false);
                  }}
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </Drawer>
      </Card>

      {error && <Alert type="danger">{error}</Alert>}

      {/* Table */}
      <Card>
        <div style={{ overflowX: "auto" }}>
          <table
            className="pv-table"
            style={{ width: "100%", borderCollapse: "collapse" }}
          >
            <thead
              style={{ position: "sticky", top: 0, background: "var(--pv-bg)" }}
            >
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    style={{
                      textAlign: "left",
                      padding: "10px 8px",
                      whiteSpace: "nowrap",
                      cursor: "pointer",
                    }}
                    onClick={() => dispatch(setSort({ key: col.key }))}
                  >
                    {col.label}{" "}
                    {sort === col.key ? (order === "asc" ? "▲" : "▼") : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading.fetch ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={columns.length}>
                      <Skeleton height={28} />
                    </td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    style={{ color: "var(--pv-dim)", padding: 12 }}
                  >
                    No audit entries for current filters.
                  </td>
                </tr>
              ) : (
                items.map((row) => (
                  <tr
                    key={row._id}
                    style={{ borderTop: "1px solid var(--pv-border)" }}
                  >
                    <td style={{ padding: "8px 8px", whiteSpace: "nowrap" }}>
                      {formatDisplayDate(row.createdAt)}
                    </td>
                    <td style={{ padding: "8px 8px" }}>
                      {row.userId || (
                        <span style={{ color: "var(--pv-dim)" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "8px 8px" }}>
                      <Badge variant={actionColors[row.action] || "secondary"}>
                        {row.action}
                      </Badge>
                    </td>
                    <td style={{ padding: "8px 8px" }}>{row.entity}</td>
                    <td style={{ padding: "8px 8px" }}>
                      {row.entityId ?? (
                        <span style={{ color: "var(--pv-dim)" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "8px 8px" }}>
                      {row.ip || (
                        <span style={{ color: "var(--pv-dim)" }}>—</span>
                      )}
                    </td>
                    <td
                      style={{
                        padding: "8px 8px",
                        maxWidth: 320,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={row.userAgent}
                    >
                      {row.userAgent}
                    </td>
                    <td style={{ padding: "8px 8px" }}>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setSelectedLog(row);
                          setDetailsOpen(true);
                        }}
                      >
                        View
                      </Button>
                      <Tooltip content="Copy entity id">
                        <IconButton
                          onClick={async () => {
                            await navigator.clipboard.writeText(
                              String(row.entityId ?? "")
                            );
                            toast.success("Entity ID copied");
                          }}
                          title="Copy entity id"
                        >
                          📋
                        </IconButton>
                      </Tooltip>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Row
          style={{
            justifyContent: "space-between",
            marginTop: 12,
            alignItems: "center",
          }}
        >
          <div style={{ color: "var(--pv-dim)" }}>
            {total.toLocaleString()} entries
          </div>
          <Pagination
            page={page}
            total={totalPages}
            onChange={(p) => dispatch(setPage(p))}
          />
        </Row>
      </Card>

      {/* Governance footnote */}
      <Card>
        <Row style={{ justifyContent: "space-between", alignItems: "center" }}>
          <Col>
            <div style={{ fontWeight: 800 }}>Governance</div>
            <div style={{ color: "var(--pv-dim)" }}>
              RBAC enforced · PII masked in logs · Export with care
            </div>
          </Col>
          <Badge>Privacy-first</Badge>
        </Row>
      </Card>

      {/* Details modal */}
      <Modal
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        title="Audit log details"
        size="lg"
        footer={
          <Button variant="ghost" onClick={() => setDetailsOpen(false)}>
            Close
          </Button>
        }
      >
        {!selectedLog ? (
          <div className="pv-row" style={{ alignItems: "center", gap: 8 }}>
            <Spinner /> <span>Loading…</span>
          </div>
        ) : (
          <Tabs
            tabs={[
              {
                label: "Overview",
                content: (
                  <div className="pv-col" style={{ gap: 8 }}>
                    <div
                      className="pv-row"
                      style={{ justifyContent: "space-between" }}
                    >
                      <strong>Time</strong>
                      <span>{formatDisplayDate(selectedLog.createdAt)}</span>
                    </div>
                    <div
                      className="pv-row"
                      style={{ justifyContent: "space-between" }}
                    >
                      <strong>Action</strong>
                      <Badge>{selectedLog.action}</Badge>
                    </div>
                    <div
                      className="pv-row"
                      style={{ justifyContent: "space-between" }}
                    >
                      <strong>Entity</strong>
                      <span>
                        {selectedLog.entity} ·{" "}
                        {String(selectedLog.entityId ?? "—")}
                      </span>
                    </div>
                    <div
                      className="pv-row"
                      style={{ justifyContent: "space-between" }}
                    >
                      <strong>User</strong>
                      <span>{selectedLog.userId ?? "—"}</span>
                    </div>
                    <div
                      className="pv-row"
                      style={{ justifyContent: "space-between" }}
                    >
                      <strong>IP</strong>
                      <span>{selectedLog.ip ?? "—"}</span>
                    </div>
                    <div
                      className="pv-row"
                      style={{ justifyContent: "space-between" }}
                    >
                      <strong>User Agent</strong>
                      <span
                        style={{
                          maxWidth: 420,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {selectedLog.userAgent}
                      </span>
                    </div>
                  </div>
                ),
              },
              {
                label: "JSON",
                content: (
                  <DiffView
                    before={selectedLog.before}
                    after={selectedLog.after}
                  />
                ),
              },
              {
                label: "Raw",
                content: <SafeCodeBlock json={selectedLog} />,
              },
            ]}
          />
        )}
      </Modal>
    </div>
  );
}
