import { useMemo, useState } from "react";
import "../styles/ui.css";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import {
  Card,
  Button,
  IconButton,
  Input,
  Select,
  Badge,
  Tooltip,
  Modal,
  Drawer,
  Tabs,
  Accordion,
  Alert,
  Placeholder,
} from "../components";

import toast from "react-hot-toast";
import ModuleHeader from "../components/ui/ModuleHeader";
import { FaTimes } from "react-icons/fa";
import { useDeviceSize } from "../context/DeviceSizeContext";
import { useEffect } from "react";

// ---- data you can extend anytime ----
const CATEGORIES = [
  { key: "checkups", label: "Financial Checkups" },
  { key: "calculators", label: "Calculators" },
  { key: "advisory", label: "Advisory Tools" },
];

const TOOLS = [
  // Checkups
  {
    id: "pfc",
    title: "PFC — Personal Financial Checkup",
    blurb:
      "Assess income, spends, risks & goals for an individual. Generates a money health summary.",
    category: "checkups",
    badge: "Core",
    route: "/pfc",
  },
  {
    id: "ffc",
    title: "FFC — Family Financial Checkup",
    blurb:
      "Holistic view of household cashflows, insurance gaps & goal planning.",
    category: "checkups",
    badge: "Popular",
    route: "/ffc",
  },
  {
    id: "bfc",
    title: "BFC — Business Financial Checkup",
    blurb:
      "Understand cash cycle, liabilities, receivables and working capital needs.",
    category: "checkups",
    badge: "Pro",
    route: "/bfc",
  },

  // Calculators
  {
    id: "sip",
    title: "SIP Calculator",
    blurb:
      "Project corpus via monthly SIPs with step-up and inflation adjustments.",
    category: "calculators",
    badge: "Calculator",
    route: "/tools/sip-calculator",
  },
  {
    id: "insurance",
    title: "Insurance Calculator",
    blurb:
      "Find optimal cover for Term, Health, Accident & CI based on income & dependents.",
    category: "calculators",
    badge: "Calculator",
    route: "/tools/insurance-calculator",
  },

  // Examples you can fill later (safe placeholders)
  {
    id: "emi",
    title: "EMI Calculator",
    blurb: "Plan loans with amortization & prepayment scenarios.",
    category: "calculators",
    badge: "Calculator",
    route: "/tools/emi-calculator",
  },
  {
    id: "goal",
    title: "Goal Planner",
    blurb: "Backsolve SIP/lump-sum for retirement, education & other goals.",
    category: "advisory",
    badge: "Planner",
    route: "/tools/goal-planner",
  },
];

function Chip({ active, children, onClick }) {
  return (
    <button
      className={`pv-btn ${active ? "" : "ghost"}`}
      onClick={onClick}
      style={{ padding: "6px 10px", borderRadius: 999 }}
    >
      {children}
    </button>
  );
}

function ToolCard({ tool }) {
  return (
    <Card title={tool.title}>
      <div style={{ display: "grid", gap: 10 }}>
        <div style={{ color: "var(--pv-dim)" }}>{tool.blurb}</div>
        <div className="pv-row" style={{ gap: 8, alignItems: "center" }}>
          <Badge>{tool.badge}</Badge>
          <Tooltip content="Open tool">
            <Button
              onClick={() => {
                // works with or without react-router; replace with navigate if you prefer
                window.location.href = tool.route;
              }}
            >
              Open
            </Button>
          </Tooltip>
          {/* <Button
            variant="ghost"
            onClick={() => toast.success(`Pinned ${tool.title}`)}
          >
            Pin
          </Button> */}
        </div>
      </div>
    </Card>
  );
}

/** Re-usable sidebar content so we can render it in a Drawer on mobile */
function SidebarContent({
  q,
  setQ,
  cat,
  setCat,
  setNewCheckupOpen,
  setDrawerOpen,
}) {
  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontWeight: 800, marginBottom: 8 }}>Tools</div>

      <Input
        placeholder="Search tools…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div
        className="pv-row"
        style={{ marginTop: 10, gap: 8, flexWrap: "wrap" }}
      >
        <Chip active={cat === "all"} onClick={() => setCat("all")}>
          All
        </Chip>
        {CATEGORIES.map((c) => (
          <Chip
            key={c.key}
            active={cat === c.key}
            onClick={() => setCat(c.key)}
          >
            {c.label}
          </Chip>
        ))}
      </div>

      <div className="pv-col" style={{ marginTop: 14, gap: 8 }}>
        <Button onClick={() => setNewCheckupOpen(true)}>New Checkup</Button>
        <Button variant="ghost" onClick={() => setDrawerOpen(true)}>
          Quick Actions
        </Button>
      </div>

      <div style={{ marginTop: 16 }}>
        <Alert type="info" title="Pro tip">
          Use search to jump to SIP/Insurance in seconds.
        </Alert>
      </div>
    </div>
  );
}

export default function ToolsHub() {
  const { isMobile } = useDeviceSize();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false); // left drawer (Filters on mobile)
  const [newCheckupOpen, setNewCheckupOpen] = useState(false);

  const MySwal = withReactContent(Swal);

  useEffect(() => {
    const SEEN_KEY = "pv_tools_welcome_seen";
    if (sessionStorage.getItem(SEEN_KEY)) return; // show once per session
    sessionStorage.setItem(SEEN_KEY, "1");

    MySwal.fire({
      title: "Welcome to Paisavidhya 👋",
      text: "Explore all financial checkups, calculators, and advisory tools — everything you need in one place.",
      confirmButtonText: "Continue",
      background:
        getComputedStyle(document.documentElement).getPropertyValue(
          "--pv-surface"
        ) || "#111827",
      color:
        getComputedStyle(document.documentElement).getPropertyValue(
          "--pv-text"
        ) || "#e5e7eb",
      confirmButtonColor:
        getComputedStyle(document.documentElement).getPropertyValue(
          "--pv-primary"
        ) || "#00c2a8",
      customClass: {
        popup: "pv-card", // use your card style (border-radius, shadow)
        confirmButton: "pv-btn primary",
      },
      timer: 4500, // auto close in 4.5s
      timerProgressBar: true,
    });
  }, []);

  const filtered = useMemo(() => {
    const byCat = (t) => (cat === "all" ? true : t.category === cat);
    const byQuery = (t) =>
      t.title.toLowerCase().includes(q.toLowerCase()) ||
      t.blurb.toLowerCase().includes(q.toLowerCase());
    return TOOLS.filter((t) => byCat(t) && byQuery(t));
  }, [q, cat]);

  const TAB_ITEMS = [
    { label: "All Tools", value: "all" },
    ...CATEGORIES.map((c) => ({ label: c.label, value: c.key })),
  ];
  const selectedTabIndex = TAB_ITEMS.findIndex((t) => t.value === cat);

  const accItems = [
    {
      title: "What’s the difference between PFC, FFC & BFC?",
      content:
        "PFC focuses on an individual. FFC covers the entire household. BFC evaluates a business’s finances & cash cycle.",
    },
    {
      title: "Where do SIP & Insurance calculators fit?",
      content:
        "They’re quick calculators to support advice inside PFC/FFC/BFC or standalone.",
    },
  ];

  return (
    <div
      className="pv-container tools-grid"
      style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 18 }}
    >
      {/* Sidebar */}
      <aside
        className="pv-card desktop-only"
        style={{
          position: "sticky",
          top: 76,
          alignSelf: "start",
          height: "calc(100vh - 92px)",
          overflow: "auto",
        }}
      >
        <SidebarContent
          q={q}
          setQ={setQ}
          cat={cat}
          setCat={setCat}
          setNewCheckupOpen={setNewCheckupOpen}
          setDrawerOpen={setDrawerOpen}
        />
      </aside>

      {/* Main */}
      <main className="pv-col" style={{ gap: 18 }}>
        <ModuleHeader
          title="All Tools"
          subtitle="Everything you need — checkups, calculators & planners"
          brdcrumbs={[
            { label: "Home", to: "/" },
            { label: "Advisory", to: "/advisory" },
            { label: "Tools" },
          ]}
          actions={
            <>
              <Button onClick={() => setNewCheckupOpen(true)}>
                Start Checkup
              </Button>
              <Button
                variant="ghost"
                onClick={() => (window.location.href = "/reports")}
              >
                Reports
              </Button>
            </>
          }
          sticky
          compact
        />

        {/* Featured row
        <section className="pv-row" style={{ gap: 18, flexWrap: "wrap" }}>
          {["pfc", "ffc", "sip"].map((id) => {
            const tool = TOOLS.find((t) => t.id === id);
            return <div key={id} style={{ minWidth: 320, flex: "1 1 320px" }}>
              <ToolCard tool={tool} />
            </div>;
          })}
        </section> */}

        {/* Compact mobile bar under header (search quick access) */}
        <section className="mobile-only">
          <Card>
            <div className="pv-row" style={{ gap: 8, alignItems: "center" }}>
              <Input
                placeholder="Search tools…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <Button onClick={() => setFiltersOpen(true)} variant="ghost">
                Filters
              </Button>
              <Button onClick={() => setDrawerOpen(true)} variant="ghost">
                Quick
              </Button>
            </div>
          </Card>
        </section>

        {/* Results */}
        <section className="pv-col" style={{ gap: 12 }}>
          {isMobile && (
            <>
              {/* For mobile only*/}
              <div
                className="pv-row"
                style={{
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ fontWeight: 700 }}>
                  {" "}
                  {CATEGORIES.find((c) => c.key === cat)?.label || "All Tools"}
                </div>
                <div className="pv-row" style={{ gap: 8 }}>
                  <Select
                    label=""
                    value={cat}
                    onChange={(e) => setCat(e.target.value)}
                    style={{ minWidth: 160 }}
                  >
                    <option value="all">All Categories</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="pv-row" style={{ gap: 18, flexWrap: "wrap" }}>
                {filtered.length ? (
                  filtered.map((t) => (
                    <div key={t.id}>
                      <ToolCard tool={t} />
                    </div>
                  ))
                ) : (
                  <Card title="No results">
                    <div className="pv-col" style={{ gap: 8 }}>
                      <div style={{ color: "var(--pv-dim)" }}>
                        Try another keyword or switch category.
                      </div>
                      <Placeholder label="Nothing found" />
                    </div>
                  </Card>
                )}
              </div>
            </>
          )}

          {/* For Desktop only*/}
          {!isMobile && (
            <div className="pv-col" style={{ gap: 8 }}>
              <Tabs
                tabs={TAB_ITEMS.map((t) => ({
                  label: t.label,
                  content: (
                    <div
                      className="pv-row"
                      style={{ gap: 18, flexWrap: "wrap" }}
                    >
                      {filtered.length ? (
                        filtered.map((t) => (
                          <div
                            key={t.id}
                            style={{
                              minWidth: 320,
                              flex: "1 1 320px",
                              gap: 18,
                            }}
                          >
                            <ToolCard tool={t} />
                          </div>
                        ))
                      ) : (
                        <Card title="No results">
                          <div className="pv-col" style={{ gap: 8 }}>
                            <div style={{ color: "var(--pv-dim)" }}>
                              Try another keyword or switch category.
                            </div>
                            <Placeholder label="Nothing found" />
                          </div>
                        </Card>
                      )}
                    </div>
                  ),
                }))}
                selectedIndex={selectedTabIndex}
                onChange={(i) => setCat(TAB_ITEMS[i].value)}
              />
            </div>
          )}
        </section>

        {/* Help / FAQ */}
        <section>
          <Card title="FAQ">
            <Accordion items={accItems} />
          </Card>
        </section>
      </main>

      {/* Quick Actions Drawer */}
      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <div style={{ padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>Quick Actions</h3>
          <div className="pv-col">
            <Button onClick={() => (window.location.href = "/pfc")}>
              Start PFC
            </Button>
            <Button onClick={() => (window.location.href = "/ffc")}>
              Start FFC
            </Button>
            <Button onClick={() => (window.location.href = "/bfc")}>
              Start BFC
            </Button>
            <Button variant="ghost" onClick={() => setDrawerOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Drawer>

      {/* Filters/Sidebar Drawer (left) */}
      <Drawer isOpen={filtersOpen} onClose={() => setFiltersOpen(false)}>
        <SidebarContent
          q={q}
          setQ={setQ}
          cat={cat}
          setCat={setCat}
          setNewCheckupOpen={setNewCheckupOpen}
          setDrawerOpen={setDrawerOpen}
        />
        <Button
          variant="ghost"
          onClick={() => setFiltersOpen(false)}
          style={{ margin: 8 }}
        >
          Close
          <FaTimes />
        </Button>
      </Drawer>

      {/* New Checkup Modal */}
      <Modal
        isOpen={newCheckupOpen}
        onClose={() => setNewCheckupOpen(false)}
        title="Start a new Checkup"
        footer={
          <>
            <Button variant="ghost" onClick={() => setNewCheckupOpen(false)}>
              Cancel
            </Button>
          </>
        }
      >
        <div className="pv-col">
          <Alert type="info" title="Choose a module">
            Pick the most relevant checkup for your client.
          </Alert>
          <div className="pv-row" style={{ gap: 12, flexWrap: "wrap" }}>
            {["pfc", "ffc", "bfc"].map((id) => {
              const t = TOOLS.find((x) => x.id === id);
              return (
                <Card key={id} title={t.title}>
                  <div
                    className="pv-row"
                    style={{ gap: 8, alignItems: "center" }}
                  >
                    <Badge>{t.badge}</Badge>
                    <Button onClick={() => (window.location.href = t.route)}>
                      Start
                    </Button>
                  </div>
                  <div style={{ marginTop: 8, color: "var(--pv-dim)" }}>
                    {t.blurb}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </Modal>
    </div>
  );
}
