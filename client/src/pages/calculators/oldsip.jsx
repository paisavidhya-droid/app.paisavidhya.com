import { useMemo, useState } from "react";
import {
  Card,
  Button,
  Input,
  Select,
  Switch,
  Badge,
  Tooltip,
  Tabs,
  Alert,
  Progress,
  AmountInput,
} from "../../components";
import toast from "react-hot-toast";
import ModuleHeader from "../../components/ui/ModuleHeader";
import AlertWithIcons from "../../components/ui/AlertWithIcons";

// Charts (recharts is available in this environment)
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// --- Utilities --------------------------------------------------------------
const toNumber = (v) => (isNaN(+v) ? 0 : +v);
const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

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
        if (s.includes(",") || s.includes("\n")) s = `"${s.replaceAll('"', '""')}"`;
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

// --- Core math: SIP with optional annual step-up, lumpsum, expense ratio ----
// Returns { summary, series, schedule }
function computePlan({
  sip,
  rateAnnual,
  months,
  stepUpAnnualPct,
  lumpsum,
  expenseRatioAnnual,
  startMonthIndex = 0, // 0-based month index in calendar year; cosmetic for labels only
}) {
  // Net annual return after expense (approx: subtract expense ratio)
  const netAnnual = Math.max(rateAnnual - expenseRatioAnnual, -99.0);
  const r = monthRateFromAnnual(netAnnual);

  let bal = lumpsum || 0;
  const schedule = [];
  let invested = lumpsum || 0;
  const startYear = new Date().getFullYear();

  for (let t = 1; t <= months; t++) {
    const yrIdx = Math.floor((t - 1) / 12); // 0 for first 12 months
    const sipThisMonth = sip * Math.pow(1 + stepUpAnnualPct / 100, yrIdx);

    // Grow then add SIP (standard end-of-period contribution)
    bal = bal * (1 + r) + sipThisMonth;
    invested += sipThisMonth;

    const absMonth = (startMonthIndex + t) % 12;
    const absYear = startYear + Math.floor((startMonthIndex + t - 1) / 12);

    schedule.push({
      t,
      year: absYear,
      month: absMonth, // 0-11
      investedToDate: invested,
      balance: bal,
      sip: sipThisMonth,
      interestThisMonth: bal - (schedule[t - 2]?.balance || 0) - sipThisMonth,
    });
  }

  const series = schedule.map((row) => ({
    name: `M${row.t}`,
    invested: Math.round(row.investedToDate),
    value: Math.round(row.balance),
  }));

  const summary = {
    netAnnual,
    netMonthly: r,
    invested: Math.round(invested),
    futureValue: Math.round(bal),
    wealthGain: Math.round(bal - invested),
  };

  return { summary, series, schedule };
}

// Solve for SIP (initial monthly) to hit a goal with step-up & given months
function solveSipForGoal({ goal, rateAnnual, months, stepUpAnnualPct, lumpsum, expenseRatioAnnual }) {
  // Bisection on SIP0 between [0, hi]
  const hiTarget = goal * 2; // generous upper bound for SIP cumulative
  let lo = 0, hi = Math.max(1000, hiTarget / months);
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const { summary } = computePlan({
      sip: mid,
      rateAnnual,
      months,
      stepUpAnnualPct,
      lumpsum,
      expenseRatioAnnual,
    });
    if (summary.futureValue >= goal) hi = mid; else lo = mid;
  }
  return Math.round(hi);
}

// Month index => short label
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function SipCalculator() {
  // --- Inputs --------------------------------------------------------------
  const [sip, setSip] = useState(5000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(15);
  const [extraMonths, setExtraMonths] = useState(0);
  const [inflation, setInflation] = useState(5);
  const [stepUp, setStepUp] = useState(0); // % per year
  const [lumpsum, setLumpsum] = useState(0);
  const [expense, setExpense] = useState(0.5); // % p.a.
  const [goal, setGoal] = useState(0);
  const [startMonth, setStartMonth] = useState(new Date().getMonth());
  const [showInflAdj, setShowInflAdj] = useState(true);

  const totalMonths = useMemo(() => clamp(years * 12 + extraMonths, 1, 80 * 12), [years, extraMonths]);

  // Compute main plan
  const plan = useMemo(
    () =>
      computePlan({
        sip: toNumber(sip),
        rateAnnual: toNumber(rate),
        months: totalMonths,
        stepUpAnnualPct: toNumber(stepUp),
        lumpsum: toNumber(lumpsum),
        expenseRatioAnnual: toNumber(expense),
        startMonthIndex: toNumber(startMonth),
      }),
    [sip, rate, totalMonths, stepUp, lumpsum, expense, startMonth]
  );

  const inflFV = useMemo(
    () =>
      showInflAdj
        ? Math.round(
            fvInflationAdjusted(plan.summary.futureValue, toNumber(inflation), totalMonths)
          )
        : null,
    [plan.summary.futureValue, inflation, showInflAdj, totalMonths]
  );

  // Goal reverse calc
  const needSip = useMemo(() => {
    if (!goal || goal <= 0) return 0;
    return solveSipForGoal({
      goal: toNumber(goal),
      rateAnnual: toNumber(rate),
      months: totalMonths,
      stepUpAnnualPct: toNumber(stepUp),
      lumpsum: toNumber(lumpsum),
      expenseRatioAnnual: toNumber(expense),
    });
  }, [goal, rate, totalMonths, stepUp, lumpsum, expense]);

  // Progress towards goal (if any)
  const progressToGoal = useMemo(() => {
    if (!goal || goal <= 0) return null;
    return clamp(Math.round((plan.summary.futureValue / toNumber(goal)) * 100), 0, 100);
  }, [goal, plan.summary.futureValue]);

  const pieData = useMemo(
    () => [
      { name: "Total Invested", value: plan.summary.invested },
      { name: "Wealth Gain", value: Math.max(plan.summary.wealthGain, 0) },
    ],
    [plan.summary]
  );

  const COLORS = ["#2E90FA", "#12B76A", "#FDB022", "#F97066"]; // minimal palette

  // CSV export
  const onExportCSV = () => {
    const rows = [
      [
        "Month#",
        "Calendar Month",
        "Calendar Year",
        "SIP (₹)",
        "Invested Till Date (₹)",
        "Balance / Future Value (₹)",
        "Interest (This Month, ₹)",
      ],
      ...plan.schedule.map((r) => [
        r.t,
        MONTHS[r.month],
        r.year,
        Math.round(r.sip),
        Math.round(r.investedToDate),
        Math.round(r.balance),
        Math.round(r.interestThisMonth),
      ]),
    ];
    downloadCSV(
      `paisavidhya_sip_schedule_${years}y_${extraMonths}m.csv`,
      rows
    );
    toast.success("Exported CSV");
  };

  const onReset = () => {
    setSip(5000);
    setRate(12);
    setYears(15);
    setExtraMonths(0);
    setInflation(5);
    setStepUp(0);
    setLumpsum(0);
    setExpense(0.5);
    setGoal(0);
    setStartMonth(new Date().getMonth());
    toast("Reset to defaults");
  };

  const tabs = [
    {
      label: "Overview",
      content: (
        <div className="pv-col" style={{ gap: 12 }}>
          <Card title="Key Results">
            <div className="pv-row" style={{ gap: 18, flexWrap: "wrap" }}>
              <Stat label="Total Invested" value={formatINR(plan.summary.invested)} />
              <Stat label="Future Value" value={formatINR(plan.summary.futureValue)} highlight />
              <Stat label="Wealth Gain" value={formatINR(plan.summary.wealthGain)} />
              <Stat label="Net Annual Return" value={`${plan.summary.netAnnual.toFixed(2)}% p.a.`} />
              {showInflAdj && (
                <Stat label="Inflation-adjusted FV" value={formatINR(inflFV)} />
              )}
            </div>
            {progressToGoal != null && (
              <div className="pv-col" style={{ marginTop: 12 }}>
                <div className="pv-row" style={{ justifyContent: "space-between" }}>
                  <div style={{ fontWeight: 600 }}>Progress towards Goal</div>
                  <Badge>{progressToGoal}%</Badge>
                </div>
                <Progress value={progressToGoal} />
              </div>
            )}
          </Card>

          <div className="pv-row" style={{ gap: 12, flexWrap: "wrap" }}>
            <Card title="Growth Over Time" style={{ flex: 1, minWidth: 360 }}>
              <div style={{ width: "100%", height: 280 }}>
                <ResponsiveContainer>
                  <LineChart data={plan.series} margin={{ left: 8, right: 8, top: 12, bottom: 0 }}>
                    <XAxis dataKey="name" hide />
                    <YAxis tickFormatter={(v) => `${Math.round(v / 100000)}L`} />
                    <RTooltip formatter={(v) => formatINR(v)} />
                    <Line type="monotone" dataKey="invested" stroke="#94A3B8" dot={false} strokeWidth={2} />
                    <Line type="monotone" dataKey="value" stroke="#2E90FA" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="pv-row" style={{ gap: 8, marginTop: 6 }}>
                <Badge>Invested</Badge>
                <Badge>Future Value</Badge>
              </div>
            </Card>

            <Card title="Contribution vs Gain" style={{ width: 420, flex: 1, minWidth: 280 }}>
              <div style={{ width: "100%", height: 280 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={110} label>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <RTooltip formatter={(v) => formatINR(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <Card title="Notes">
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>Step-up SIP increases your monthly contribution once every 12 months by the chosen percentage.</li>
              <li>Net annual return is calculated as (expected return − expense ratio). Returns are compounded monthly.</li>
              <li>Inflation-adjusted value converts your corpus to today’s rupees using your inflation setting.</li>
            </ul>
          </Card>
        </div>
      ),
    },
    {
      label: "Amortization",
      content: (
        <div className="pv-col" style={{ gap: 12 }}>
          <div className="pv-row" style={{ justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontWeight: 600 }}>Monthly Schedule</div>
            <Button variant="ghost" onClick={onExportCSV}>Download CSV</Button>
          </div>
          <div style={{ maxHeight: 380, overflow: "auto" }}>
            <table className="pv-table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Month</th>
                  <th>Year</th>
                  <th>SIP (₹)</th>
                  <th>Invested (₹)</th>
                  <th>Balance (₹)</th>
                  <th>Interest (₹)</th>
                </tr>
              </thead>
              <tbody>
                {plan.schedule.map((r) => (
                  <tr key={r.t}>
                    <td>{r.t}</td>
                    <td>{MONTHS[r.month]}</td>
                    <td>{r.year}</td>
                    <td>{Math.round(r.sip).toLocaleString("en-IN")}</td>
                    <td>{Math.round(r.investedToDate).toLocaleString("en-IN")}</td>
                    <td>{Math.round(r.balance).toLocaleString("en-IN")}</td>
                    <td>{Math.round(r.interestThisMonth).toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="pv-col" style={{ gap: 16 }}>
      <ModuleHeader
        title="SIP Calculator"
        subtitle="Plan, project & compare your monthly investments"
        brdcrumbs={[{ label: "Home", to: "/" }, { label: "Calculators", to: "/calculators" }, { label: "SIP" }]}
        actions={
          <>
            <Button onClick={onExportCSV}>Export CSV</Button>
            <Button variant="ghost" onClick={onReset}>Reset</Button>
          </>
        }
        sticky
      />

      {/* INPUTS */}
      <Card title="Inputs">
        <div className="pv-col" style={{ gap: 12 }}>
          <div className="pv-row" style={{ gap: 12, alignItems: "stretch", flexWrap: "wrap" }}>
            <AmountInput label="Monthly SIP" value={sip} onChange={setSip} min={0} step={500} />
            <AmountInput label="Lumpsum (optional)" value={lumpsum} onChange={setLumpsum} min={0} step={5000} />
            <Input label="Expected Return (% p.a.)" type="number" value={rate} onChange={(e) => setRate(toNumber(e.target.value))} min={-50} max={50} step={0.1} />
            <Input label="Expense Ratio (% p.a.)" type="number" value={expense} onChange={(e) => setExpense(toNumber(e.target.value))} min={0} max={5} step={0.05} />
          </div>

          <div className="pv-row" style={{ gap: 12, alignItems: "stretch", flexWrap: "wrap" }}>
            <Input label="Years" type="number" value={years} onChange={(e) => setYears(clamp(toNumber(e.target.value), 0, 80))} min={0} max={80} />
            <Input label="Extra Months" type="number" value={extraMonths} onChange={(e) => setExtraMonths(clamp(toNumber(e.target.value), 0, 11))} min={0} max={11} />
            <Input label="Annual Step-up (% per year)" type="number" value={stepUp} onChange={(e) => setStepUp(clamp(toNumber(e.target.value), 0, 100))} min={0} max={100} step={1} />
            <Select label="SIP Starts In">
              {MONTHS.map((m, i) => (
                <option key={m} value={i} selected={i === startMonth}>{m}</option>
              ))}
            </Select>
          </div>

          <div className="pv-row" style={{ gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <Input label="Goal (optional)" type="number" placeholder="Target corpus (₹)" value={goal} onChange={(e) => setGoal(toNumber(e.target.value))} />
            <div className="pv-row" style={{ gap: 8, alignItems: "center" }}>
              <Switch checked={showInflAdj} onChange={setShowInflAdj} />
              <span>Show inflation-adjusted corpus</span>
            </div>
            {showInflAdj && (
              <Input label="Inflation (% p.a.)" type="number" value={inflation} onChange={(e) => setInflation(clamp(toNumber(e.target.value), 0, 15))} min={0} max={15} step={0.1} />
            )}
          </div>

          {!!goal && needSip > 0 && (
            <AlertWithIcons type="info" title="Required SIP">
              To reach a goal of <b>{formatINR(goal)}</b> in {Math.floor(totalMonths/12)}y {totalMonths%12}m at {rate}% p.a. (net of {expense}% expense) with a {stepUp}% annual step-up, you need a starting SIP of <b>{formatINR(needSip)}</b> (today’s rupees).
            </AlertWithIcons>
          )}
        </div>
      </Card>

      {/* RESULTS */}
      <Tabs tabs={tabs} />

      <Card title="Methodology & Assumptions">
        <div className="pv-col" style={{ gap: 6 }}>
          <div>• Monthly rate r = (1 + (expected − expense))<sup>1/12</sup> − 1. Contributions are added at month-end.</div>
          <div>• Step-up SIP applies once every 12 months (e.g., 10% → year 2 SIP = 1.10×, year 3 = 1.21×, etc.).</div>
          <div>• Inflation-adjusted corpus = FV ÷ (1 + inflation)<sup>months/12</sup>.</div>
          <div>• This tool provides educational estimates; actual market returns vary.</div>
        </div>
      </Card>

      <FooterHelp />
    </div>
  );
}

function Stat({ label, value, highlight }) {
  return (
    <div className="pv-card" style={{ padding: 12, minWidth: 180, flex: 1 }}>
      <div style={{ fontSize: 12, color: "var(--pv-dim)" }}>{label}</div>
      <div style={{ fontWeight: 800, fontSize: 20, color: highlight ? "var(--pv-primary)" : "inherit" }}>{value}</div>
    </div>
  );
}

function FooterHelp() {
  return (
    <Alert type="info" title="Pro tip">
      <div className="pv-row" style={{ gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <span>Use </span>
        <Badge>Goal</Badge>
        <span>
          to back-calculate the SIP you need. Toggle <Badge>Inflation</Badge> to see corpus in today’s rupees.
        </span>
      </div>
    </Alert>
  );
}
