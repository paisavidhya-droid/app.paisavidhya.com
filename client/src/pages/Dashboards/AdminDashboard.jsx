// client/src/pages/Dashboards/AdminDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { Card, Button, Badge, Alert, Progress, Skeleton, Tooltip } from "../../components";
import { useAuth } from "../../hooks/useAuth";

// Local tiny UI helpers (no external imports)
function Stat({ label, value, hint }) {
  return (
    <div className="pv-card" style={{ padding: 14, flex: "1 1 200px" }}>
      <div style={{ fontSize: 12, color: "var(--pv-dim)" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800 }}>{value}</div>
      {hint && <div style={{ fontSize: 12, color: "var(--pv-dim)" }}>{hint}</div>}
    </div>
  );
}
const Row = ({ children }) => (
  <div className="pv-row" style={{ gap: 16, flexWrap: "wrap" }}>{children}</div>
);
const Col = ({ children, style }) => (
  <div className="pv-col" style={{ gap: 16, ...(style || {}) }}>{children}</div>
);

export default function AdminDashboard() {
  const { user } = useAuth();

  // ---- Dummy data only (no API) ----
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const t = setTimeout(() => {
      const dummy = {
        orgUsers: 142,
        activeToday: 87,
        teams: 6,
        incidents: 0,

        pipelineProgress: 81,            // percent
        pipelineStatus: "Live",
        pipelineLabel: "Org KPIs",

        kpis: [
          { label: "MTTR", value: "18m" },
          { label: "Conversion (7d)", value: "12.4%" },
          { label: "NPS (30d)", value: "52" },
        ],
      };
      setSummary(dummy);
      setLoading(false);
    }, 500); // simulate latency
    return () => clearTimeout(t);
  }, []);
  // ---- end dummy block ----

  const pipelineProgress = useMemo(() => {
    if (!summary) return 0;
    if (typeof summary.pipelineProgress === "number") {
      return Math.max(0, Math.min(100, Math.round(summary.pipelineProgress)));
    }
    return 0;
  }, [summary]);

  return (
    <div className="pv-container" style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
      <Card>
        <div className="pv-row" style={{ justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div className="pv-col" style={{ gap: 4 }}>
            <div style={{ fontSize: 14, color: "var(--pv-dim)" }}>Welcome</div>
            <h1 style={{ margin: 0, fontSize: 26 }}>
              {user?.name || "Admin"} <Badge>Admin</Badge>
            </h1>
          </div>
          <div className="pv-row" style={{ gap: 8 }}>
            <Button as="a" href="/admin/users">User management</Button>
            <Button as="a" href="/admin/settings" variant="ghost">Settings</Button>
          </div>
        </div>
      </Card>

      {error && <Alert type="error" style={{ marginTop: 12 }}>{error}</Alert>}

      {/* Stats */}
      <Row>
        {loading ? (
          <>
            <Skeleton height={90} style={{ flex: "1 1 200px" }} />
            <Skeleton height={90} style={{ flex: "1 1 200px" }} />
            <Skeleton height={90} style={{ flex: "1 1 200px" }} />
            <Skeleton height={90} style={{ flex: "1 1 200px" }} />
          </>
        ) : (
          <>
            <Stat label="Total users" value={summary?.orgUsers ?? 0} />
            <Stat label="Active today" value={summary?.activeToday ?? 0} />
            <Stat label="Teams" value={summary?.teams ?? 0} />
            <Stat label="Incidents" value={summary?.incidents ?? 0} />
          </>
        )}
      </Row>

      {/* Main sections */}
      <Row>
        <Col style={{ flex: "1 1 520px" }}>
          <Card title="Organization KPIs">
            <div className="pv-row" style={{ gap: 12, flexWrap: "wrap" }}>
              {(summary?.kpis || []).map((k, i) => (
                <div key={i} className="pv-card" style={{ padding: 12, minWidth: 160 }}>
                  <div style={{ fontSize: 12, color: "var(--pv-dim)" }}>{k.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 800 }}>{k.value}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Admin tools">
            <div className="pv-row" style={{ gap: 8, flexWrap: "wrap" }}>
              <Button as="a" href="/admin/users">Manage users</Button>
              <Button as="a" href="/admin/roles" variant="ghost">Roles & permissions</Button>
              <Button as="a" href="/admin/audit" variant="ghost">Audit log</Button>
            </div>
          </Card>
        </Col>

        <Col style={{ flex: "1 1 360px" }}>
          <Card title="Status">
            <div className="pv-col" style={{ gap: 10 }}>
              <div className="pv-row" style={{ justifyContent: "space-between" }}>
                <span>Platform health</span>
                <Badge>{summary?.pipelineStatus ?? "—"}</Badge>
              </div>
              <Progress value={loading ? 0 : pipelineProgress} />
              <div className="pv-row" style={{ justifyContent: "space-between", color: "var(--pv-dim)", fontSize: 12 }}>
                <span>Scope</span>
                <span>{summary?.pipelineLabel ?? "—"}</span>
              </div>
            </div>
          </Card>

          <Card title="Shortcuts">
            <div className="pv-col" style={{ gap: 8 }}>
              <Button as="a" href="/admin/settings" variant="ghost">Org settings</Button>
              <Button as="a" href="/admin/billing" variant="ghost">Billing</Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Footer card */}
      <Card>
        <div className="pv-row" style={{ justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div className="pv-col" style={{ gap: 4 }}>
            <div style={{ fontWeight: 800 }}>Governance</div>
            <div style={{ color: "var(--pv-dim)" }}>RBAC enforced. Actions logged.</div>
          </div>
          <Tooltip content="View privacy & terms"><Badge>Privacy-first</Badge></Tooltip>
        </div>
      </Card>
    </div>
  );
}
