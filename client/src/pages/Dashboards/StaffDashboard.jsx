import { useEffect, useMemo, useState } from "react";
import { Card, Button, Badge, Alert, Progress, Skeleton, Tooltip } from "../../components";
import { useAuth } from "../../hooks/useAuth";

// Local tiny UI helpers
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

export default function StaffDashboard() {
  const { user } = useAuth();

  // --- Dummy data only ---
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const t = setTimeout(() => {
      const dummy = {
        myAssignedLeads: 12,
        todayAppointments: 4,
        pendingConfirmations: 2,
        slaBreaches: 1,

        pipelineProgress: 58,
        pipelineStatus: "Live",
        pipelineLabel: "New → Contacted → Qualified → Closed",

        teamUpdates: [
          { type:"info",    message:"4 new leads assigned to you." },
          { type:"warning", message:"2 appointments awaiting confirmation." },
          { type:"success", message:"Your WoW conversion +5%." },
        ],
      };
      setSummary(dummy);
      setLoading(false);
    }, 500);
    return () => clearTimeout(t);
  }, []);
  // --- end dummy ---

  const pipelineProgress = useMemo(() => {
    if (!summary) return 0;
    if (typeof summary.pipelineProgress === "number") {
      return Math.max(0, Math.min(100, Math.round(summary.pipelineProgress)));
    }
    const total =
      (summary.totalLeads ?? 0) +
      (summary.totalAppointments ?? 0) +
      (summary.totalDeals ?? 0);
    const done =
      (summary.completedLeads ?? 0) +
      (summary.completedAppointments ?? 0) +
      (summary.closedDeals ?? 0);
    if (total <= 0) return 0;
    return Math.min(100, Math.round((done / total) * 100));
  }, [summary]);

  return (
    <div className="pv-container" style={{ maxWidth: 1200, margin:"0 auto", padding:"24px 16px" }}>
      <Card>
        <div className="pv-row" style={{ justifyContent:"space-between", alignItems:"center", gap:12, flexWrap:"wrap" }}>
          <div className="pv-col" style={{ gap:4 }}>
            <div style={{ fontSize:14, color:"var(--pv-dim)" }}>Welcome</div>
            <h1 style={{ margin:0, fontSize:26 }}>
              {user?.name || "Staff"} <Badge>Staff</Badge>
            </h1>
          </div>
          <div className="pv-row" style={{ gap:8 }}>
            <Button as="a" href="/leads">Open Leads</Button>
            <Button as="a" href="/staff/tasks" variant="ghost">My Tasks</Button>
          </div>
        </div>
      </Card>

      {error && <Alert type="error" style={{ marginTop: 12 }}>{error}</Alert>}

      {/* Stats */}
      <Row>
        {loading ? (
          <>
            <Skeleton height={90} style={{ flex:"1 1 200px" }} />
            <Skeleton height={90} style={{ flex:"1 1 200px" }} />
            <Skeleton height={90} style={{ flex:"1 1 200px" }} />
            <Skeleton height={90} style={{ flex:"1 1 200px" }} />
          </>
        ) : (
          <>
            <Stat label="Assigned leads" value={summary?.myAssignedLeads ?? 0} />
            <Stat label="Today’s appointments" value={summary?.todayAppointments ?? 0} />
            <Stat label="Pending confirmations" value={summary?.pendingConfirmations ?? 0} />
            <Stat label="SLA breaches" value={summary?.slaBreaches ?? 0} />
          </>
        )}
      </Row>

      <Row>
        <Col style={{ flex:"1 1 520px" }}>
          <Card title="Team updates">
            <div className="pv-col" style={{ gap:8 }}>
              {(summary?.teamUpdates || []).map((t,i)=>(
                <Alert key={i} type={t.type || "info"}>{t.message}</Alert>
              ))}
            </div>
          </Card>

          <Card title="Quick actions">
            <div className="pv-row" style={{ gap:8, flexWrap:"wrap" }}>
              <Button as="a" href="/leads">Create lead</Button>
              <Button variant="ghost" as="a" href="/staff">Team board</Button>
            </div>
          </Card>
        </Col>

        <Col style={{ flex:"1 1 360px" }}>
          <Card title="Pipeline">
            <div className="pv-col" style={{ gap:10 }}>
              <div className="pv-row" style={{ justifyContent:"space-between" }}>
                <span>Sales pipeline</span>
                <Badge>{summary?.pipelineStatus ?? "—"}</Badge>
              </div>
              <Progress value={loading ? 0 : pipelineProgress} />
              <div className="pv-row" style={{ justifyContent:"space-between", color:"var(--pv-dim)", fontSize:12 }}>
                <span>Stage</span>
                <span>{summary?.pipelineLabel ?? "—"}</span>
              </div>
            </div>
          </Card>

          <Card title="Shortcuts">
            <div className="pv-col" style={{ gap:8 }}>
              <Button as="a" href="/leads" variant="ghost">View leads</Button>
              <Button as="a" href="/staff/calendar" variant="ghost">Calendar</Button>
            </div>
          </Card>
        </Col>
      </Row>

      <Card>
        <div className="pv-row" style={{ justifyContent:"space-between", alignItems:"center", gap:10, flexWrap:"wrap" }}>
          <div className="pv-col" style={{ gap:4 }}>
            <div style={{ fontWeight:800 }}>Operational integrity</div>
            <div style={{ color:"var(--pv-dim)" }}>Audit trails enabled. Role-scoped data.</div>
          </div>
          <Tooltip content="View privacy & terms"><Badge>Privacy-first</Badge></Tooltip>
        </div>
      </Card>
    </div>
  );
}
