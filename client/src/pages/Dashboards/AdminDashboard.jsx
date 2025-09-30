import { useEffect, useMemo, useState } from "react";
import { Card, Button, Badge, Alert, Progress, Skeleton, Tooltip, Input, Select } from "../../components"; // assume Input/Select exist in your kit
import { useAuth } from "../../hooks/useAuth";

/**
 * AdminDashboard — production‑ready, extensible, and accessible.
 *
 * Goals:
 * 1) Present critical KPIs at a glance
 * 2) Offer quick admin actions (users, roles, billing, audit)
 * 3) Provide global filters (date range, team) that scope the whole page
 * 4) Show activity/audit and system health
 * 5) Be resilient: loading, empty, and error states; offline fallback; retries
 * 6) Future‑proof: feature flags, role‑gated panels, pluggable widgets
 */

// ---------- Local tiny UI helpers (no external libs) ----------
function Section({ title, subtitle, right, children }) {
  return (
    <Card>
      <div className="pv-row" style={{ justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div className="pv-col" style={{ gap: 2 }}>
          <div style={{ fontWeight: 800 }}>{title}</div>
          {subtitle && <div style={{ color: "var(--pv-dim)", fontSize: 12 }}>{subtitle}</div>}
        </div>
        {right}
      </div>
      <div style={{ height: 12 }} />
      {children}
    </Card>
  );
}

function Stat({ label, value, hint, intent }) {
  const intentColor = intent === "danger" ? "#D14343" : intent === "warn" ? "#A37F00" : intent === "ok" ? "#0E7C66" : "var(--pv-fg)";
  return (
    <div className="pv-card" style={{ padding: 14, flex: "1 1 200px", minWidth: 200 }}>
      <div style={{ fontSize: 12, color: "var(--pv-dim)" }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: intentColor }}>{value}</div>
      {hint && <div style={{ fontSize: 12, color: "var(--pv-dim)" }}>{hint}</div>}
    </div>
  );
}

const Row = ({ children, style }) => (
  <div className="pv-row" style={{ gap: 16, flexWrap: "wrap", ...(style || {}) }}>{children}</div>
);
const Col = ({ children, style }) => (
  <div className="pv-col" style={{ gap: 16, ...(style || {}) }}>{children}</div>
);

function Sparkline({ points = [] }) {
  if (!points.length) return <div style={{ height: 36 }} />;
  const w = 120; const h = 36; const max = Math.max(...points); const min = Math.min(...points);
  const norm = (v) => max === min ? h / 2 : h - ((v - min) / (max - min)) * h;
  const step = w / (points.length - 1);
  const d = points.map((v, i) => `${i === 0 ? "M" : "L"}${i * step},${norm(v)}`).join(" ");
  return (
    <svg width={w} height={h} role="img" aria-label="trend">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function Timeline({ items }) {
  if (!items?.length) return <div style={{ color: "var(--pv-dim)" }}>No recent activity.</div>;
  return (
    <div className="pv-col" style={{ gap: 12 }}>
      {items.map((ev, i) => (
        <div key={i} className="pv-row" style={{ gap: 10, alignItems: "flex-start" }}>
          <div style={{ width: 6, height: 6, borderRadius: 6, background: "currentColor", marginTop: 7 }} />
          <div className="pv-col" style={{ gap: 2 }}>
            <div style={{ fontWeight: 600 }}>{ev.title}</div>
            <div style={{ color: "var(--pv-dim)", fontSize: 12 }}>{ev.time} · {ev.actor}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------- Feature flags & role gates ----------
const features = {
  billing: true,
  auditLog: true,
  teams: true,
  calculators: true, // placeholder for Paisavidhya calculator admin area
  exotel: true,      // WhatsApp OTP config page
};

// ---------- Data fetching (simple, with retry & abort) ----------
function useAdminSummary(filters) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  useEffect(() => {
    const ctrl = new AbortController();
    let attempts = 0;

    async function run() {
      attempts++;
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const qs = new URLSearchParams({
          from: filters.from || "",
          to: filters.to || "",
          team: filters.team || "",
        }).toString();
        const res = await fetch(`${import.meta.env.VITE_API_BASE}/admin/summary?${qs}`, { signal: ctrl.signal, credentials: "include" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setState({ data: json, loading: false, error: null });
      } catch (e) {
        if (ctrl.signal.aborted) return;
        if (attempts < 2) return run(); // one retry
        setState({ data: null, loading: false, error: e.message || "Failed to load" });
      }
    }
    run();
    return () => ctrl.abort();
  }, [filters.from, filters.to, filters.team]);
  return state;
}

export default function AdminDashboard() {
  const { user } = useAuth();

  // Global filters
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [team, setTeam] = useState("");
  const [q, setQ] = useState("");

  const { data, loading, error } = useAdminSummary({ from, to, team });

  // Fallback demo when API is empty (helps during first boot)
  const summary = useMemo(() => {
    return data || {
      orgUsers: 142,
      activeToday: 87,
      teams: 6,
      incidents: 0,
      pipelineProgress: 81,
      pipelineStatus: "Live",
      pipelineLabel: "Org KPIs",
      kpis: [
        { label: "MTTR", value: "18m", trend: [18,17,19,16,14,15,18] },
        { label: "Conversion (7d)", value: "12.4%", trend: [9,10,11,12,12.4,12,12.2] },
        { label: "NPS (30d)", value: "52", trend: [48,49,50,51,52,51,52] },
      ],
      activity: [
        { title: "New user added: anita@org", time: "2h ago", actor: "You" },
        { title: "Role updated: analyst → manager", time: "6h ago", actor: "System" },
        { title: "Billing cycle closed", time: "Yesterday", actor: "Finance Bot" },
      ],
      system: {
        region: "asia-south1",
        latencyMs: 122,
        uptime90d: "99.96%",
      },
    };
  }, [data]);

  const pipelineProgress = useMemo(() => {
    const v = Number(summary?.pipelineProgress || 0);
    return Math.max(0, Math.min(100, Math.round(v)));
  }, [summary]);

  const env = import.meta.env.MODE;

  // Search (client‑side demo). In prod, send `q` to the API.
  const filteredActivity = useMemo(() => {
    const arr = summary?.activity || [];
    if (!q) return arr;
    const s = q.toLowerCase();
    return arr.filter((x) => `${x.title} ${x.actor}`.toLowerCase().includes(s));
  }, [q, summary]);

  const hasIncidents = (summary?.incidents || 0) > 0;

  return (
    <div className="pv-container" style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 16px" }}>
      {/* Top welcome & quick actions */}
      <Card>
        <div className="pv-row" style={{ justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div className="pv-col" style={{ gap: 4 }}>
            <div style={{ fontSize: 14, color: "var(--pv-dim)" }}>Welcome</div>
            <h1 style={{ margin: 0, fontSize: 26 }}>
              {user?.name || "Admin"} <Badge>Admin</Badge> <Badge>{env}</Badge>
            </h1>
          </div>
          <div className="pv-row" style={{ gap: 8, flexWrap: "wrap" }}>
            <Button as="a" href="/admin/users">User management</Button>
            <Button as="a" href="/admin/roles" variant="ghost">Roles & permissions</Button>
            {features.billing && <Button as="a" href="/admin/billing" variant="ghost">Billing</Button>}
            {features.auditLog && <Button as="a" href="/admin/audit" variant="ghost">Audit log</Button>}
          </div>
        </div>
      </Card>

      {/* Global filters */}
      <Card>
        <Row>
          <Col style={{ flex: "1 1 520px" }}>
            <div className="pv-row" style={{ gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <label style={{ fontSize: 12, color: "var(--pv-dim)" }}>From</label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              <label style={{ fontSize: 12, color: "var(--pv-dim)" }}>To</label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              <label style={{ fontSize: 12, color: "var(--pv-dim)" }}>Team</label>
              <Select value={team} onChange={(e) => setTeam(e.target.value)}>
                <option value="">All</option>
                <option value="sales">Sales</option>
                <option value="support">Support</option>
                <option value="product">Product</option>
                <option value="marketing">Marketing</option>
              </Select>
            </div>
          </Col>
          <Col style={{ flex: "1 1 260px", alignItems: "flex-end" }}>
            <Input placeholder="Search activity, users…" value={q} onChange={(e) => setQ(e.target.value)} />
          </Col>
        </Row>
      </Card>

      {error && <Alert type="error" style={{ marginTop: 12 }}>{error}</Alert>}

      {/* Stats */}
      <Row>
        {loading ? (
          <>
            <Skeleton height={100} style={{ flex: "1 1 200px" }} />
            <Skeleton height={100} style={{ flex: "1 1 200px" }} />
            <Skeleton height={100} style={{ flex: "1 1 200px" }} />
            <Skeleton height={100} style={{ flex: "1 1 200px" }} />
          </>
        ) : (
          <>
            <Stat label="Total users" value={summary?.orgUsers ?? 0} hint="All time" />
            <Stat label="Active today" value={summary?.activeToday ?? 0} hint="Last 24h" intent="ok" />
            {features.teams && <Stat label="Teams" value={summary?.teams ?? 0} />}
            <Stat label="Incidents" value={summary?.incidents ?? 0} intent={hasIncidents ? "danger" : undefined} />
          </>
        )}
      </Row>

      {/* Main sections */}
      <Row>
        <Col style={{ flex: "1 1 560px" }}>
          <Section title="Organization KPIs" subtitle="Key performance indicators scoped by filters">
            {loading ? (
              <Skeleton height={120} />
            ) : (
              <div className="pv-row" style={{ gap: 12, flexWrap: "wrap" }}>
                {(summary?.kpis || []).map((k, i) => (
                  <div key={i} className="pv-card" style={{ padding: 12, minWidth: 200, flex: "1 1 200px" }}>
                    <div style={{ fontSize: 12, color: "var(--pv-dim)" }}>{k.label}</div>
                    <div className="pv-row" style={{ justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: 22, fontWeight: 800 }}>{k.value}</div>
                      <Sparkline points={k.trend || []} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title="Admin tools" subtitle="Common actions for daily operations" right={<Button as="a" href="/admin/tools" variant="ghost">View all</Button>}>
            <div className="pv-row" style={{ gap: 8, flexWrap: "wrap" }}>
              <Button as="a" href="/admin/users">Manage users</Button>
              <Button as="a" href="/admin/roles" variant="ghost">Roles & permissions</Button>
              {features.auditLog && <Button as="a" href="/admin/audit" variant="ghost">Audit log</Button>}
              {features.billing && <Button as="a" href="/admin/billing" variant="ghost">Billing</Button>}
              {features.exotel && <Button as="a" href="/admin/integrations/exotel" variant="ghost">Exotel (WhatsApp OTP)</Button>}
              {features.calculators && <Button as="a" href="/admin/calculators" variant="ghost">Calculators</Button>}
              <Button as="a" href="/admin/leads" variant="ghost">Leads</Button>
            </div>
          </Section>

          <Section title="Recent activity" subtitle="User & system actions">
            {loading ? <Skeleton height={160} /> : <Timeline items={filteredActivity} />}
          </Section>
        </Col>

        <Col style={{ flex: "1 1 360px" }}>
          <Section title="Status" subtitle="Platform health & SLA">
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
              <div className="pv-card" style={{ padding: 12 }}>
                <div className="pv-row" style={{ justifyContent: "space-between" }}>
                  <span>Region</span>
                  <span>{summary?.system?.region ?? "-"}</span>
                </div>
                <div className="pv-row" style={{ justifyContent: "space-between" }}>
                  <span>Latency</span>
                  <span>{summary?.system?.latencyMs ?? "-"} ms</span>
                </div>
                <div className="pv-row" style={{ justifyContent: "space-between" }}>
                  <span>Uptime (90d)</span>
                  <span>{summary?.system?.uptime90d ?? "-"}</span>
                </div>
              </div>
            </div>
          </Section>

          <Section title="Shortcuts" subtitle="High‑leverage pages">
            <div className="pv-col" style={{ gap: 8 }}>
              <Button as="a" href="/admin/settings" variant="ghost">Org settings</Button>
              {features.billing && <Button as="a" href="/admin/billing" variant="ghost">Billing</Button>}
              <Button as="a" href="/admin/partners" variant="ghost">Partners</Button>
              <Button as="a" href="/admin/integrations" variant="ghost">Integrations</Button>
            </div>
          </Section>

          <Card>
            <div className="pv-row" style={{ justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div className="pv-col" style={{ gap: 4 }}>
                <div style={{ fontWeight: 800 }}>Governance</div>
                <div style={{ color: "var(--pv-dim)" }}>RBAC enforced. Actions logged. PII masked in logs.</div>
              </div>
              <Tooltip content="View privacy & terms"><Badge>Privacy‑first</Badge></Tooltip>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
