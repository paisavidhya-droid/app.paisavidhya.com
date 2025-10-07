import { useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Badge,
} from "../components";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
} from "recharts";
import ModuleHeader from "../components/ui/ModuleHeader";
import InsightsList from "../components/InsightsList";
import "../styles/ui.css";

const COLORS = ["#0071E3", "#1FC27E", "#FFC300", "#FF8C00", "#FF4C4C", "#905EFF"]; 
const sumObj = (obj) => Object.values(obj || {}).reduce((a, b) => a + (Number(b) || 0), 0);

export default function FFCReport() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const printRef = useRef(null);

  if (!state) {
    return (
      <div className="pv-col pv-container" style={{ gap: 16, padding: 16 }}>
        <ModuleHeader title="Family Financial Checkup — Report" subtitle="Preview & Export" />
        <Card>
          <p style={{ color: "var(--pv-dim)" }}>
            No report data found. Please fill the FFC form first.
          </p>
          <div className="pv-row" style={{ justifyContent: "flex-end" }}>
            <Button onClick={() => navigate("/ffc")}>Go to FFC</Button>
          </div>
        </Card>
      </div>
    );
  }

  const { profile, income, expenses, metrics } = state;
  const { housing, familyNeeds, transport, protection, lifestyle, obligations, goals } = expenses || {};

  const totalIncome = metrics?.totalIncome ?? sumObj(income);
  const totalExpenses = metrics?.totalExpenses ?? (sumObj(housing)+sumObj(familyNeeds)+sumObj(transport)+sumObj(protection)+sumObj(lifestyle)+sumObj(obligations)+sumObj(goals));
  const surplus = metrics?.surplus ?? (totalIncome - totalExpenses);
  const savingsRate = metrics?.savingsRate ?? (totalIncome ? ((Number(obligations?.sip||0)+Number(obligations?.rd||0)+Number(goals?.kidsFund||0))/totalIncome)*100 : 0);
  const dti = metrics?.dti ?? (totalIncome ? (Number(obligations?.loanEmi||0)/totalIncome)*100 : 0);

  const coreMonthly = sumObj(housing) + sumObj(familyNeeds) + sumObj(transport) + sumObj(protection);
  const emergencyMonths = metrics?.emergencyMonths ?? (coreMonthly ? Number(state?.cushions?.emergencyFund || 0) / coreMonthly : 0);

  const pieData = useMemo(() => (
    [
      { name: "Housing", value: sumObj(housing) },
      { name: "Family Needs", value: sumObj(familyNeeds) },
      { name: "Transport", value: sumObj(transport) },
      { name: "Protection", value: sumObj(protection) },
      { name: "Lifestyle", value: sumObj(lifestyle) },
      { name: "Obligations", value: sumObj(obligations) },
      { name: "Goals", value: sumObj(goals) },
    ].filter((d) => d.value > 0)
  ), [housing, familyNeeds, transport, protection, lifestyle, obligations, goals]);

  const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  // Basic heuristic insights (mirror from FFC to keep the report self-contained)
  const insights = useMemo(() => {
    if (!totalIncome) return [];
    const list = [];
    if (savingsRate < 20) list.push({ type: "warning", title: "Savings Rate Low", detail: "Target 20–30% savings." });
    if (dti > 30) list.push({ type: "danger", title: "High Debt-to-Income", detail: "EMIs exceed 30% of income." });
    if (surplus < 0) list.push({ type: "danger", title: "Monthly Deficit", detail: "Expenses exceed income." });
    const members = Number(profile?.adults||0)+Number(profile?.children||0)+Number(profile?.seniors||0);
    const minHealthCover = members <= 3 ? 500000 : members <= 5 ? 1000000 : 1500000;
    const lifestyleShare = totalExpenses ? (sumObj(lifestyle)/totalExpenses) : 0;
    if (lifestyleShare > 0.3) list.push({ type: "info", title: "Lifestyle Spend High", detail: ">30% of expenses are lifestyle." });
    list.push({ type: "info", title: "Suggested Family Floater", detail: `≈ ₹${inr.format(minHealthCover)} (indicative).` });
    return list;
  }, [totalIncome, totalExpenses, savingsRate, dti, surplus, lifestyle, profile]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="pv-col pv-container" style={{ gap: 16, padding: 16 }}>
      <ModuleHeader
        title="Family Financial Checkup (FFC) — Report"
        subtitle="Print-friendly | PDF-ready"
        actions={
          <>
            <Button variant="ghost" onClick={() => navigate(-1)}>Back</Button>
            <Button onClick={handlePrint}>Download PDF</Button>
          </>
        }
      />

      {/* Print styles */}
      <style>{`
        @media print {
          @page { size: A4; margin: 14mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .print-block { break-inside: avoid; page-break-inside: avoid; }
        }
        .kv { display: grid; grid-template-columns: 200px 1fr; gap: 6px; }
        .grid-3 { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 12px; }
        .grid-2 { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 12px; }
        .muted { color: var(--pv-dim); }
        .h-rule { height: 1px; background: var(--pv-border); margin: 8px 0; }
        .table { width: 100%; border-collapse: collapse; }
        .table th, .table td { border-bottom: 1px solid var(--pv-border); padding: 6px 8px; text-align: right; }
        .table th:first-child, .table td:first-child { text-align: left; }
        .section-title { font-weight: 600; margin-bottom: 6px; }
      `}</style>

      <div ref={printRef} className="pv-col" style={{ gap: 16 }}>
        {/* Header Card */}
        <Card className="print-block">
          <div className="pv-row" style={{ justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ margin: 0 }}>Paisavidhya — Family Financial Checkup</h2>
              <div className="muted">Report Date: {today}</div>
            </div>
            <div className="pv-col" style={{ alignItems: "flex-end" }}>
              <Badge>Income ₹{inr.format(totalIncome)}</Badge>
              <Badge variant="ghost">Expenses ₹{inr.format(totalExpenses)}</Badge>
              <Badge color={surplus >= 0 ? "green" : "red"}>Surplus ₹{inr.format(surplus)}</Badge>
            </div>
          </div>
        </Card>

        {/* Family Profile */}
        <Card title="Family Profile" className="print-block">
          <div className="grid-3">
            <div className="kv"><div className="muted">Family</div><div>{profile?.familyName || "—"}</div></div>
            <div className="kv"><div className="muted">City</div><div>{profile?.city || "—"}</div></div>
            <div className="kv"><div className="muted">Members</div><div>{(profile?.adults||0)} Adults, {(profile?.children||0)} Children, {(profile?.seniors||0)} Seniors</div></div>
          </div>
        </Card>

        {/* Distribution + KPI */}
        <div className="grid-2 print-block">
          <Card title="Expense Distribution">
            <div style={{ width: "100%", height: 260 }}>
              {pieData.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100}>
                      {pieData.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                    </Pie>
                    <ChartTooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="muted">No expenses captured.</p>
              )}
            </div>
          </Card>

          <Card title="Key Metrics">
            <div className="grid-3">
              <div>
                <div className="muted">Savings Rate</div>
                <div style={{ fontWeight: 600 }}>{totalIncome ? `${savingsRate.toFixed(1)}%` : "—"}</div>
              </div>
              <div>
                <div className="muted">Debt-to-Income</div>
                <div style={{ fontWeight: 600 }}>{totalIncome ? `${dti.toFixed(1)}%` : "—"}</div>
              </div>
              <div>
                <div className="muted">Emergency Fund</div>
                <div style={{ fontWeight: 600 }}>{isFinite(emergencyMonths) ? `${emergencyMonths.toFixed(1)} months` : "—"}</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Detailed Tables */}
        <Card title="Income (Monthly)" className="print-block">
          <table className="table">
            <thead>
              <tr><th>Source</th><th>Amount (₹)</th></tr>
            </thead>
            <tbody>
              {Object.entries(income || {}).map(([k, v]) => (
                <tr key={k}><td>{k.replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase())}</td><td>{inr.format(Number(v)||0)}</td></tr>
              ))}
              <tr><td style={{ fontWeight: 600 }}>Total</td><td style={{ fontWeight: 600 }}>{inr.format(totalIncome)}</td></tr>
            </tbody>
          </table>
        </Card>

        <Card title="Expenses (Monthly)" className="print-block">
          <table className="table">
            <thead>
              <tr><th>Category</th><th>Amount (₹)</th></tr>
            </thead>
            <tbody>
              <tr><td>Housing</td><td>{inr.format(sumObj(housing))}</td></tr>
              <tr><td>Family Needs</td><td>{inr.format(sumObj(familyNeeds))}</td></tr>
              <tr><td>Transport</td><td>{inr.format(sumObj(transport))}</td></tr>
              <tr><td>Protection</td><td>{inr.format(sumObj(protection))}</td></tr>
              <tr><td>Lifestyle</td><td>{inr.format(sumObj(lifestyle))}</td></tr>
              <tr><td>Obligations</td><td>{inr.format(sumObj(obligations))}</td></tr>
              <tr><td>Goals</td><td>{inr.format(sumObj(goals))}</td></tr>
              <tr><td style={{ fontWeight: 600 }}>Total</td><td style={{ fontWeight: 600 }}>{inr.format(totalExpenses)}</td></tr>
            </tbody>
          </table>
        </Card>

        {/* Insights & Recommendations */}
        {insights?.length ? (
          <Card title="Insights & Recommendations" className="print-block">
            <InsightsList items={insights} />
            <div className="h-rule" />
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              <li>Target savings 20–30% via SIP/PPF/NPS; automate on salary day.</li>
              <li>Keep 3–6 months of core expenses in an emergency fund (liquid/overnight).</li>
              <li>Ensure adequate term life (≈10× annual income) and family floater health cover.</li>
              <li>Cap lifestyle spends at ≤30% of expenses; audit subscriptions quarterly.</li>
              <li>Prepay high-interest debt before new goals; keep DTI ≤30%.</li>
            </ul>
          </Card>
        ) : null}

        {/* Footer / Signature */}
        <Card className="print-block">
          <div className="pv-row" style={{ justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div className="section-title">Advisor Notes</div>
              <div className="muted">Add personalized observations here during session.</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="muted">Prepared by</div>
              <div style={{ fontWeight: 600 }}>Paisavidhya Advisor</div>
              <div className="muted" style={{ fontSize: 12 }}>www.paisavidhya.com</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
