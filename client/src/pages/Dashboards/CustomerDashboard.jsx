import { useEffect, useMemo, useState } from "react";
import { Card, Button, Badge, Alert, Progress, Skeleton, Tooltip } from "../../components";
import { useAuth } from "../../hooks/useAuth";

// Local tiny UI helpers (no shared imports)
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

export default function CustomerDashboard() {
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
        leadsToday: 5,
        upcomingAppointments: 2,
        checkupsInProgress: 3,
        profileCompletion: 64,

        pipelineProgress: 70,
        pipelineStatus: "Live",
        pipelineLabel: "Leads → Appointments → Checkups",

        customerTips: [
          { type: "info",    message: "Verify your mobile & email to secure your account." },
          { type: "success", message: "Emergency fund at 4 months — aim for 6 months." },
          { type: "warning", message: "KYC pending for MF linking." },
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
      (summary.totalCheckups ?? 0);
    const done =
      (summary.completedLeads ?? 0) +
      (summary.completedAppointments ?? 0) +
      (summary.completedCheckups ?? 0);
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
              {user?.name || "User"} <Badge>Customer</Badge>
            </h1>
          </div>
          <div className="pv-row" style={{ gap:8 }}>
            <Button as="a" href="/leads" className="pv-btn">Book Checkup</Button>
            <Button as="a" href="/profile" variant="ghost">Complete profile</Button>
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
            <Stat label="Leads today" value={summary?.leadsToday ?? 0} />
            <Stat label="Upcoming appointments" value={summary?.upcomingAppointments ?? 0} />
            <Stat label="Checkups in progress" value={summary?.checkupsInProgress ?? 0} />
            <Stat
              label="Profile completion"
              value={`${summary?.profileCompletion ?? 0}%`}
              hint={<Progress value={summary?.profileCompletion ?? 0} />}
            />
          </>
        )}
      </Row>

      <Row>
        <Col style={{ flex:"1 1 520px" }}>
          <Card title="Quick actions">
            <div className="pv-row" style={{ gap:8, flexWrap:"wrap" }}>
              <Button as="a" href="/pfc">Start PFC</Button>
              <Button variant="ghost" as="a" href="/profile">Complete profile</Button>
            </div>
          </Card>

          {Array.isArray(summary?.customerTips) && summary.customerTips.length>0 && (
            <Card title="Next steps">
              <div className="pv-col" style={{ gap:8 }}>
                {summary.customerTips.map((t,i)=>(
                  <Alert key={i} type={t.type || "info"}>{t.message}</Alert>
                ))}
              </div>
            </Card>
          )}
        </Col>

        <Col style={{ flex:"1 1 360px" }}>
          <Card title="Overview">
            <div className="pv-col" style={{ gap:10 }}>
              <div className="pv-row" style={{ justifyContent:"space-between" }}>
                <span>PFC pipeline</span>
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
              <Button as="a" href="/profile" variant="ghost">Edit profile</Button>
              <Button as="a" href="/leads" variant="ghost">View leads</Button>
            </div>
          </Card>
        </Col>
      </Row>

      <Card>
        <div className="pv-row" style={{ justifyContent:"space-between", alignItems:"center", gap:10, flexWrap:"wrap" }}>
          <div className="pv-col" style={{ gap:4 }}>
            <div style={{ fontWeight:800 }}>Your data is protected</div>
            <div style={{ color:"var(--pv-dim)" }}>End-to-end TLS. Consent-first access. Logged actions.</div>
          </div>
          <Tooltip content="View privacy & terms"><Badge>Privacy-first</Badge></Tooltip>
        </div>
      </Card>
    </div>
  );
}
