import { useMemo, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Link } from "react-router-dom";
import { useAdminDashboardSummary } from "../../hooks/useAdminDashboardSummary";
import {
  Card,
  Button,
  Badge,
  Alert,
  Progress,
  Skeleton,
  Tooltip,
  Input,
  Row,
  Col,
} from "../../components";
import DashboardSection from "./components/DashboardSection";
import Timeline from "./components/Timeline";
import StatCard from "./components/StatCard";
import Sparkline from "./components/Sparkline";
import { FaArrowRotateRight } from "react-icons/fa6";
import "./dashboard.css";
import { useHealth } from "../../hooks/useHealth";

const features = {
  // billing: true,
  auditLog: true,
  teams: true,
  calculators: true,
  // exotel: true,
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const health = useHealth();

  // Global filters (wired to real query now)
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [q, setQ] = useState("");

  const { data, loading, error, refetch } = useAdminDashboardSummary({
    from,
    to,
    q,
  });
  const summary = data;

  const env = import.meta.env.MODE;

  const pipelineProgress = useMemo(() => {
    if (!summary?.system?.serverLatencyMs) return 0;
    const latency = summary.system.serverLatencyMs;
    const score = 100 - Math.min(90, Math.round(latency / 10));
    return Math.max(0, Math.min(100, score));
  }, [summary]);

  return (
    <div className="pv-container" style={{ gap: 10 }}>
      {/* Top welcome & quick actions */}
      <Card>
        <div
          className="pv-row"
          style={{
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div className="pv-col" style={{ gap: 4 }}>
            <div style={{ fontSize: 14, color: "var(--pv-dim)" }}>Welcome</div>
            <h1 style={{ margin: 0, fontSize: 26 }}>
              {user?.name || "Admin"} <Badge>Admin</Badge> <Badge>{env}</Badge>
            </h1>
          </div>

          <div className="pv-row" style={{ gap: 8, flexWrap: "wrap" }}>
            <Button as={Link} to="./users">
              User management
            </Button>
            <Button as={Link} to="./users" variant="ghost">
              Roles & permissions
            </Button>
            <Button as={Link} to="./leads" variant="ghost">
              Leads
            </Button>
            {features.auditLog && (
              <Button as={Link} to="./audit" variant="ghost">
                Audit log
              </Button>
            )}
            <Tooltip
              content={loading ? "Refreshing…" : "Refresh dashboard data"}
            >
              <Button
                variant="ghost"
                onClick={refetch}
                disabled={loading}
                style={{ padding: "12px" }}
              >
                <FaArrowRotateRight className={loading ? "animate-spin" : ""} />
              </Button>
            </Tooltip>
          </div>
        </div>
      </Card>

      {/* Global filters */}
      <Card>
        <Row>
          <Col style={{ flex: "1 1 520px" }}>
            <div
              className="pv-row"
              style={{ gap: 8, flexWrap: "wrap", alignItems: "center" }}
            >
              <label style={{ fontSize: 12, color: "var(--pv-dim)" }}>
                From
              </label>
              <Input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
              <label style={{ fontSize: 12, color: "var(--pv-dim)" }}>To</label>
              <Input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
          </Col>

          <Col style={{ flex: "1 1 260px", alignItems: "flex-end" }}>
            <Input
              placeholder="Search audit activity…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </Col>
        </Row>
      </Card>

      {error && (
        <Alert type="error" style={{ marginTop: 12 }}>
          {error}
        </Alert>
      )}

      {/* Stats */}
      <Row>
        {loading ? (
          <>
            <div
              className="pv-row"
              style={{ flex: "1 1 200px", minWidth: 200 }}
            >
              <Skeleton height={100} />
              <Skeleton height={100} />
              <Skeleton height={100} />
              <Skeleton height={100} />
            </div>
          </>
        ) : (
          <>
            <StatCard
              label="Total users"
              value={summary?.orgUsers ?? 0}
              hint="All time"
              to="./users"
            />
            <StatCard
              label="Total leads"
              value={summary?.leads?.total ?? 0}
              hint="All time"
              to="./leads"
            />

            <StatCard
              label="New leads (24h)"
              value={summary?.leads?.new24h ?? 0}
              hint="Created in last 24h"
              intent="ok"
            />

            <StatCard
              label="Follow-ups pending"
              value={summary?.leads?.followUp ?? 0}
              hint="Needs outreach"
              intent={(summary?.leads?.followUp ?? 0) > 25 ? "warn" : undefined}
            />

            {/* <StatCard
              label="Incidents"
              value={summary?.incidents ?? 0}
              intent={hasIncidents ? "danger" : undefined}
            /> */}
          </>
        )}
      </Row>

      {/* Main sections */}
      <Row>
        <Col style={{ flex: "1 1 560px" }}>
          <DashboardSection
            title="Admin tools"
            subtitle="Common actions for daily operations"
            right={
              <Tooltip content="View all Admin tools">
                <Link to="./tools" style={{ marginTop: "-15px" }}>
                  <Badge>View all</Badge>
                </Link>
              </Tooltip>
            }
          >
            <div className="pv-row" style={{ gap: 8, flexWrap: "wrap" }}>
              <Button as={Link} to="./users">
                Manage users
              </Button>
              <Button as={Link} to="./users" variant="ghost">
                Roles & permissions
              </Button>
              {features.auditLog && (
                <Button as={Link} to="./audit" variant="ghost">
                  Audit log
                </Button>
              )}
              {features.billing && (
                <Button as={Link} to="./billing" variant="ghost">
                  Billing
                </Button>
              )}
              {features.exotel && (
                <Button as={Link} to="./integrations/exotel" variant="ghost">
                  Exotel (WhatsApp OTP)
                </Button>
              )}
              {features.calculators && (
                <Button as={Link} to="../tools" variant="ghost">
                  Calculators & Tools
                </Button>
              )}
              <Button as={Link} to="./leads" variant="ghost">
                Leads
              </Button>
              <Button as={Link} to="./partners" variant="ghost">
                Partners
              </Button>
            </div>
          </DashboardSection>
          <DashboardSection
            title="Organization KPIs"
            subtitle="Real numbers from Leads/Users APIs"
          >
            {loading ? (
              <div className="pv-card pv-col " style={{ padding: 12, gap: 16 }}>
                <Skeleton height={12} />
                <Skeleton height={12} />
                <Skeleton height={12} />
                <Skeleton height={12} />
                <Skeleton height={12} />
                <Skeleton height={12} />
              </div>
            ) : (
              <div className="pv-row" style={{ gap: 12, flexWrap: "wrap" }}>
                {(summary?.kpis || []).map((k, i) => (
                  <div
                    key={i}
                    className="pv-card"
                    style={{ padding: 12, minWidth: 200, flex: "1 1 200px" }}
                  >
                    <div style={{ fontSize: 12, color: "var(--pv-dim)" }}>
                      {k.label}
                    </div>
                    <div
                      className="pv-row"
                      style={{
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ fontSize: 22, fontWeight: 800 }}>
                        {k.value}
                      </div>
                      <Sparkline points={k.trend || []} />
                    </div>
                  </div>
                ))}

                <div
                  className="pv-card"
                  style={{ padding: 12, minWidth: 260, flex: "1 1 260px" }}
                >
                  <div style={{ fontSize: 12, color: "var(--pv-dim)" }}>
                    Leads by status
                  </div>
                  <div style={{ height: 10 }} />

                  <div className="pv-col" style={{ gap: 6 }}>
                    {Object.entries(summary?.leads?.byStatus || {})
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 6)
                      .map(([st, n]) => (
                        <div
                          key={st}
                          className="pv-row"
                          style={{ justifyContent: "space-between" }}
                        >
                          <span>{st}</span>
                          <strong>{n}</strong>
                        </div>
                      ))}
                  </div>
                  {/* Divider */}
                  {Object.keys(summary?.leads?.byInterest || {}).length > 0 && (
                    <div
                      style={{
                        height: 1,
                        background: "var(--pv-border)",
                        margin: "10px 0",
                      }}
                    />
                  )}

                  {/* By Interest */}
                  {Object.keys(summary?.leads?.byInterest || {}).length > 0 && (
                    <>
                      <div style={{ fontSize: 12, color: "var(--pv-dim)" }}>
                        By interest
                      </div>
                      <div className="pv-col" style={{ gap: 6 }}>
                        {Object.entries(summary?.leads?.byInterest || {})
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 6)
                          .map(([k, n]) => (
                            <div
                              key={k}
                              className="pv-row"
                              style={{ justifyContent: "space-between" }}
                            >
                              <span>{k}</span>
                              <strong>{n}</strong>
                            </div>
                          ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </DashboardSection>

          <DashboardSection
            title="Recent activity"
            subtitle="From real audit logs"
          >
            {loading ? (
              <div className="pv-col" style={{ gap: 12 }}>
                <Skeleton height={50} />
                <Skeleton height={50} />
                <Skeleton height={50} />
                <Skeleton height={50} />
                <Skeleton height={50} />
              </div>
            ) : (
              <Timeline items={summary?.activity || []} />
            )}
          </DashboardSection>
        </Col>

        <Col style={{ flex: "1 1 360px" }}>
          <Card>
            <StatCard
              className="pv-row"
              label="Active today"
              value={summary?.activeToday ?? 0}
              hint="From audit logs (24h)"
              intent="ok"
            />
          </Card>
          {/* <Card>
            <StatCard
              className="pv-row"
              label="Total Pledges"
              value={0}
              hint="All Time"
              intent="ok"
            />
          </Card> */}
          <DashboardSection
            title="Status"
            subtitle="Backend health + server stats"
          >
            <div className="pv-col" style={{ gap: 10 }}>
              <div
                className="pv-row"
                style={{ justifyContent: "space-between" }}
              >
                <span>Platform health</span>
                <Badge>
                  {health.loading
                    ? "Checking..."
                    : health.data?.status === "ok"
                      ? "Live"
                      : "Down"}
                </Badge>
              </div>

              {/* Keep your progress bar if you want */}
              <Progress value={loading ? 0 : pipelineProgress} />

              <div
                className="pv-row"
                style={{
                  justifyContent: "space-between",
                  color: "var(--pv-dim)",
                  fontSize: 12,
                }}
              >
                <span>Scope</span>
                <span>Health + API timing</span>
              </div>

              <div className="pv-card" style={{ padding: 12 }}>
                <div
                  className="pv-row"
                  style={{ justifyContent: "space-between" }}
                >
                  <span>Region</span>
                  <span>{health.data?.region ?? "-"}</span>
                </div>

                <div
                  className="pv-row"
                  style={{ justifyContent: "space-between" }}
                >
                  <span>Latency</span>
                  <span>{summary?.system?.serverLatencyMs ?? "-"} ms</span>
                </div>

                <div
                  className="pv-row"
                  style={{ justifyContent: "space-between" }}
                >
                  <span>Uptime</span>
                  <span>
                    {health.data?.uptimeSec != null
                      ? `${Math.floor(health.data.uptimeSec / 60)}m`
                      : "-"}
                  </span>
                </div>
              </div>
            </div>
          </DashboardSection>

          <DashboardSection title="Shortcuts" subtitle="High-leverage pages">
            <div className="pv-col" style={{ gap: 8 }}>
              <Button as={Link} to="./settings" variant="ghost">
                Org settings
              </Button>
              {features.billing && (
                <Button as={Link} to="./billing" variant="ghost">
                  Billing
                </Button>
              )}
              <Button as={Link} to="./partners" variant="ghost">
                Partners
              </Button>
              <Button as={Link} to="./integrations" variant="ghost">
                Integrations
              </Button>
            </div>
          </DashboardSection>

          <Card>
            <div
              className="pv-row"
              style={{
                flexWrap: "wrap",
              }}
            >
              <div className="pv-col" style={{ gap: 4 }}>
                <div style={{ fontWeight: 800 }}>Governance</div>
                <div style={{ color: "var(--pv-dim)" }}>
                  RBAC enforced. Actions logged. PII masked in logs.
                </div>
              </div>
              <Tooltip content="View privacy & terms">
                <Badge>Privacy-first</Badge>
              </Tooltip>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
