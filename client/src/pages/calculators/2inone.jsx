import { useMemo, useState } from "react";
import {
  Card,
  Button,
  Input,
  Select,
  Switch,
  Badge,
  Alert,
  Progress,
  AmountInput,
} from "../../components";
import ModuleHeader from "../../components/ui/ModuleHeader";
import AlertWithIcons from "../../components/ui/AlertWithIcons";
import toast from "react-hot-toast";

// recharts
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip as RTooltip,
} from "recharts";

/**
 * ✨ SIP Calculator — Paisavidhya (Clean UX)
 *
 * Goals of this redesign:
 * - Simple by default (3 inputs), Advanced options tucked away
 * - One clean results area with big KPIs and a single trend chart
 * - Preset chips for speed (amount, years, return)
 * - Goal back-solve (Required SIP) surfaced inline
 * - Mobile-first, keyboard-friendly, fewer distractions
 */

// -------------------- utils --------------------
const toNumber = (v) => (isNaN(+v) ? 0 : +v);
const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function monthRateFromAnnual(annualPct) {
  const r = annualPct / 100;
  return Math.pow(1 + r, 1 / 12) - 1;
}

function fvInflationAdjusted(nominalFV, inflationPct, months) {
  const infMonthly = monthRateFromAnnual(inflationPct);
  return nominalFV / Math.pow(1 + infMonthly, months);
}

function formatINR(n) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n || 0);
  } catch {
    return `₹${(n || 0).toLocaleString("en-IN")}`;
  }
}

function downloadCSV(filename, rows) {
  const processRow = (row) =>
    row
      .map((val) => {
        if (val == null) return "";
        let s = String(val);
        if (s.includes(",") || s.includes("\n"))
          s = `"${s.replaceAll('"', '""')}"`;
        return s;
      })
      .join(",");
  const csv = rows.map(processRow).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}


// ---------------- core math -------------------
function computePlan({ sip, rateAnnual, months, stepUpAnnualPct, lumpsum, expenseRatioAnnual, startMonthIndex = 0 }) {
  const netAnnual = Math.max(rateAnnual - expenseRatioAnnual, -99);
  const r = monthRateFromAnnual(netAnnual);

  let bal = lumpsum || 0;
  let invested = lumpsum || 0;
  const schedule = [];
  const startYear = new Date().getFullYear();

  for (let t = 1; t <= months; t++) {
    const yrIdx = Math.floor((t - 1) / 12);
    const sipThis = sip * Math.pow(1 + stepUpAnnualPct / 100, yrIdx);
    bal = bal * (1 + r) + sipThis; // end-of-month contribution
    invested += sipThis;

    const absMonth = (startMonthIndex + t) % 12;
    const absYear = startYear + Math.floor((startMonthIndex + t - 1) / 12);

    schedule.push({
      t,
      year: absYear,
      month: absMonth,
      sip: sipThis,
      investedToDate: invested,
      balance: bal,
      interestThisMonth: bal - (schedule[t - 2]?.balance || 0) - sipThis,
    });
  }

  const series = schedule.map((r) => ({ name: `M${r.t}`, invested: Math.round(r.investedToDate), value: Math.round(r.balance) }));

  return {
    summary: {
      netAnnual,
      netMonthly: r,
      invested: Math.round(invested),
      futureValue: Math.round(bal),
      wealthGain: Math.round(bal - invested),
    },
    series,
    schedule,
  };
}

function solveSipForGoal({ goal, rateAnnual, months, stepUpAnnualPct, lumpsum, expenseRatioAnnual }) {
  let lo = 0, hi = Math.max(1000, goal / months * 3);
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const { summary } = computePlan({ sip: mid, rateAnnual, months, stepUpAnnualPct, lumpsum, expenseRatioAnnual });
    if (summary.futureValue >= goal) hi = mid; else lo = mid;
  }
  return Math.round(hi);
}

// --------------- small UI helpers ----------------
function Chip({ children, onClick, active }) {
  return (
    <button
      className="pv-btn ghost"
      style={{ padding: "6px 10px", borderRadius: 999, fontSize: 12, ...(active ? { fontWeight: 700 } : {}) }}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function RangeField({ label, value, onChange, min, max, step = 1, suffix }) {
  return (
    <div className="pv-col" style={{ gap: 6, minWidth: 220, flex: 1 }}>
      <div className="pv-row" style={{ justifyContent: "space-between" }}>
        <div style={{ fontSize: 12, color: "var(--pv-dim)" }}>{label}</div>
        <div style={{ fontWeight: 700 }}>{suffix ? `${value}${suffix}` : value}</div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        style={{ width: "100%" }}
      />
    </div>
  );
}

function Stat({ label, value, highlight }) {
  return (
    <div className="pv-card" style={{ padding: 12, minWidth: 160, flex: 1 }}>
      <div style={{ fontSize: 12, color: "var(--pv-dim)" }}>{label}</div>
      <div style={{ fontWeight: 800, fontSize: 20, color: highlight ? "var(--pv-primary)" : "inherit" }}>{value}</div>
    </div>
  );
}

export default function SipCalculator() {
  // basic
  const [sip, setSip] = useState(10000);
  const [years, setYears] = useState(10);
  const [rate, setRate] = useState(12);

  // advanced
  const [stepUp, setStepUp] = useState(0);
  const [lumpsum, setLumpsum] = useState(0);
  const [expense, setExpense] = useState(0.5);
  const [inflation, setInflation] = useState(5);
  const [showInflAdj, setShowInflAdj] = useState(true);
  const [goal, setGoal] = useState(0);
  const [startMonth, setStartMonth] = useState(new Date().getMonth());

  const totalMonths = useMemo(() => clamp(years * 12, 1, 80 * 12), [years]);

  const plan = useMemo(() => computePlan({
    sip: toNumber(sip),
    rateAnnual: toNumber(rate),
    months: totalMonths,
    stepUpAnnualPct: toNumber(stepUp),
    lumpsum: toNumber(lumpsum),
    expenseRatioAnnual: toNumber(expense),
    startMonthIndex: toNumber(startMonth),
  }), [sip, rate, totalMonths, stepUp, lumpsum, expense, startMonth]);

  const inflFV = useMemo(() => showInflAdj ? Math.round(fvInflationAdjusted(plan.summary.futureValue, toNumber(inflation), totalMonths)) : null, [plan.summary.futureValue, inflation, showInflAdj, totalMonths]);

  const needSip = useMemo(() => {
    if (!goal || goal <= 0) return 0;
    return solveSipForGoal({ goal: toNumber(goal), rateAnnual: toNumber(rate), months: totalMonths, stepUpAnnualPct: toNumber(stepUp), lumpsum: toNumber(lumpsum), expenseRatioAnnual: toNumber(expense) });
  }, [goal, rate, totalMonths, stepUp, lumpsum, expense]);

  const progressToGoal = useMemo(() => {
    if (!goal || goal <= 0) return null;
    return clamp(Math.round((plan.summary.futureValue / toNumber(goal)) * 100), 0, 100);
  }, [goal, plan.summary.futureValue]);

  // presets
  const sipPresets = [2000, 5000, 10000, 25000];
  const yearPresets = [1, 2, 3, 4, 5, 10, 15, 20];
  const returnPresets = [10, 12, 14];

  const onExportCSV = () => {
    const rows = [["Month#","Month","Year","SIP (₹)","Invested (₹)","Balance (₹)","Interest (₹)"], ...plan.schedule.map((r) => [r.t, MONTHS[r.month], r.year, Math.round(r.sip), Math.round(r.investedToDate), Math.round(r.balance), Math.round(r.interestThisMonth)])];
    downloadCSV(`paisavidhya_sip_${years}y.csv`, rows);
    toast.success("Exported CSV");
  };

  const onReset = () => {
    setSip(10000); setYears(10); setRate(12); setStepUp(0); setLumpsum(0); setExpense(0.5); setInflation(5); setShowInflAdj(true); setGoal(0); setStartMonth(new Date().getMonth());
  };

  return (
    <div className="pv-col" style={{ gap: 16 }}>
      <ModuleHeader
        title="SIP Calculator"
        subtitle="Simple by default. Powerful when you need it."
        brdcrumbs={[{ label: "Home", to: "/" }, { label: "Calculators", to: "/calculators" }, { label: "SIP" }]}
        actions={<><Button onClick={onExportCSV}>Export CSV</Button><Button variant="ghost" onClick={onReset}>Reset</Button></>}
        sticky
      />

      {/* layout */}
      <div className="pv-grid" style={{ display: "grid", gridTemplateColumns: "minmax(260px, 380px) 1fr", gap: 16 }}>
        {/* LEFT: compact inputs */}
        <Card title="Plan Inputs">
          <div className="pv-col" style={{ gap: 12 }}>
            {/* quick chips */}
            <div className="pv-row" style={{ gap: 6, flexWrap: "wrap" }}>
              {sipPresets.map((v) => (
                <Chip key={v} active={sip === v} onClick={() => setSip(v)}>₹{v.toLocaleString("en-IN")}</Chip>
              ))}
            </div>
            <AmountInput label="Monthly SIP" value={sip} onChange={setSip} min={0} step={500} />

            {/* precise + quick adjust */}
            <RangeField
              label="Monthly SIP"
              value={sip}
              onChange={(v) => setSip(clamp(v, 0, 200000))}
              min={0}
              max={200000}
              step={500}
              suffix="₹"
            />

            <RangeField label="Years" value={years} onChange={(v) => setYears(clamp(v, 1, 80))} min={1} max={40} />
            <div className="pv-row" style={{ gap: 6, flexWrap: "wrap" }}>
              {yearPresets.map((v) => (
                <Chip key={v} active={years === v} onClick={() => setYears(v)}>{v}y</Chip>
              ))}
            </div>

            <RangeField label="Expected Return" value={rate} onChange={setRate} min={-10} max={25} step={0.1} suffix="%" />
            <div className="pv-row" style={{ gap: 6, flexWrap: "wrap" }}>
              {returnPresets.map((v) => (
                <Chip key={v} active={rate === v} onClick={() => setRate(v)}>{v}% p.a.</Chip>
              ))}
            </div>

            {/* goal */}
            <Input label="Goal (optional)" type="number" placeholder="Target corpus (₹)" value={goal} onChange={(e) => setGoal(toNumber(e.target.value))} />
            {goal > 0 && (
              <AlertWithIcons type="info" title="Required SIP">
                To reach <b>{formatINR(goal)}</b> in <b>{years} years</b> at <b>{rate}%</b> (net of expense), you need ~ <b>{formatINR(needSip)}</b>/month.
              </AlertWithIcons>
            )}

            {/* advanced toggle */}
            <details className="pv-card" style={{ padding: 12, borderRadius: 12 }}>
              <summary style={{ cursor: "pointer", fontWeight: 700 }}>Advanced options</summary>
              <div className="pv-col" style={{ gap: 10, marginTop: 10 }}>
                <AmountInput label="Lumpsum (optional)" value={lumpsum} onChange={setLumpsum} min={0} step={5000} />
                <Input label="Annual Step-up (% per year)" type="number" value={stepUp} onChange={(e) => setStepUp(clamp(toNumber(e.target.value), 0, 100))} min={0} max={100} />
                <Input label="Expense Ratio (% p.a.)" type="number" value={expense} onChange={(e) => setExpense(clamp(toNumber(e.target.value), 0, 5))} min={0} max={5} step={0.05} />
                <div className="pv-row" style={{ gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <Switch checked={showInflAdj} onChange={setShowInflAdj} />
                  <span>Show inflation-adjusted corpus</span>
                </div>
                {showInflAdj && (
                  <Input label="Inflation (% p.a.)" type="number" value={inflation} onChange={(e) => setInflation(clamp(toNumber(e.target.value), 0, 15))} min={0} max={15} step={0.1} />
                )}
                <div className="pv-col">
                  <label className="pv-label">SIP Start Month</label>
                  <Select value={startMonth} onChange={(e) => setStartMonth(+e.target.value)}>
                    {MONTHS.map((m, i) => (
                      <option key={m} value={i}>{m}</option>
                    ))}
                  </Select>
                </div>
              </div>
            </details>

            <Alert type="warning" title="Note">
              This tool is for education. Markets are volatile; actual results may differ.
            </Alert>
          </div>
        </Card>

        {/* RIGHT: results */}
        <div className="pv-col" style={{ gap: 16 }}>
          <Card title="Results at a glance">
            <div className="pv-row" style={{ gap: 12, flexWrap: "wrap" }}>
              <Stat label="Total Invested" value={formatINR(plan.summary.invested)} />
              <Stat label="Future Value" value={formatINR(plan.summary.futureValue)} highlight />
              <Stat label="Wealth Gain" value={formatINR(plan.summary.wealthGain)} />
              <Stat label="Net Annual Return" value={`${plan.summary.netAnnual.toFixed(2)}%`} />
              {showInflAdj && <Stat label="Inflation-adjusted FV" value={formatINR(inflFV)} />}
            </div>

            {progressToGoal != null && (
              <div className="pv-col" style={{ marginTop: 10 }}>
                <div className="pv-row" style={{ justifyContent: "space-between" }}>
                  <div style={{ fontWeight: 600 }}>Progress to Goal</div>
                  <Badge>{progressToGoal}%</Badge>
                </div>
                <Progress value={progressToGoal} />
              </div>
            )}
          </Card>

          <Card title="Growth Over Time">
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer>
                <LineChart data={plan.series} margin={{ left: 6, right: 6, top: 10, bottom: 0 }}>
                  <XAxis dataKey="name" hide />
                  <YAxis tickFormatter={(v) => `${Math.round(v / 100000)}L`} />
                  <RTooltip formatter={(v) => formatINR(v)} />
                  <Line type="monotone" dataKey="invested" stroke="#94A3B8" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="value" stroke="#2E90FA" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Download Schedule">
            <div className="pv-row" style={{ justifyContent: "space-between", alignItems: "center" }}>
              <div>Get the full month-wise amortization as CSV.</div>
              <Button onClick={onExportCSV}>Download CSV</Button>
            </div>
          </Card>

          <Card title="Methodology">
            <div className="pv-col" style={{ gap: 6 }}>
              <div>• Monthly rate r = (1 + (expected − expense))<sup>1/12</sup> − 1. Contributions are added at month-end.</div>
              <div>• Step-up SIP applies annually (e.g., 10% → year 2 = 1.10×, year 3 = 1.21×).</div>
              <div>• Inflation-adjusted corpus = FV ÷ (1 + inflation)<sup>months/12</sup>.</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
