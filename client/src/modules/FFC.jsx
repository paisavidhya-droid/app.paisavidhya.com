import { useState, useMemo } from "react";
import "./piechart.css";
import {
  Card,
  Input,
  Select,
  Button,
  Accordion,
  Alert,
  Badge,
  Modal,
  AmountInput,
} from "../components";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
} from "recharts";
import "../styles/ui.css";
import ModuleHeader from "../components/ui/ModuleHeader";
import InsightsList from "../components/InsightsList";
import { useNavigate } from "react-router-dom";

/* ---------- small helpers ---------- */
const COLORS = ["#0071E3", "#1FC27E", "#FFC300", "#FF8C00", "#FF4C4C", "#905EFF"]; 
const fmt = (n) => (isNaN(n) ? 0 : Number(n));
const sumObj = (obj) => Object.values(obj || {}).reduce((a, b) => a + (Number(b) || 0), 0);

function Row({ label, value, onChange, hint }) {
  return (
    <div className="pv-row" style={{ alignItems: "center", gap: 8 }}>
      <label style={{ width: "60%", color: "var(--pv-dim)" }}>
        {label}{hint ? <span style={{ marginLeft: 6, fontSize: 12, color: "var(--pv-muted)" }}>({hint})</span> : null}
      </label>
      <AmountInput value={value} onChange={onChange} />
    </div>
  );
}

function CategoryGroup({ title, fields, data, setData }) {
  const total = useMemo(() => sumObj(data), [data]);
  return (
    <Card title={`${title}  —  ₹${total.toLocaleString("en-IN")}`}>
      <div className="pv-col" style={{ gap: 6 }}>
        {fields.map((f) => (
          <Row
            key={f.key}
            label={f.label}
            hint={f.hint}
            value={data[f.key] || 0}
            onChange={(v) => setData((p) => ({ ...p, [f.key]: v }))}
          />
        ))}
      </div>
    </Card>
  );
}

export default function FFC() {
  const navigate = useNavigate();

  /* -------- family profile -------- */
  const [profile, setProfile] = useState({
    familyName: "",
    city: "",
    adults: 2,
    children: 1,
    seniors: 0,
  });

  /* -------- household income (monthly) -------- */
  const [income, setIncome] = useState({
    primarySalary: 0,
    spouseSalary: 0,
    business: 0,
    rent: 0,
    interest: 0,
    dividends: 0,
    pension: 0,
    other: 0,
  });

  /* -------- expenses (monthly) -------- */
  const [housing, setHousing] = useState({ rentOrEmi: 0, maintenance: 0, utilities: 0, internet: 0, gas: 0 });
  const [familyNeeds, setFamilyNeeds] = useState({ groceries: 0, schoolFees: 0, tuition: 0, childcare: 0 });
  const [transport, setTransport] = useState({ fuel: 0, public: 0, cab: 0, vehicleEmi: 0, maintenance: 0 });
  const [protection, setProtection] = useState({ lifeInsurance: 0, healthInsurance: 0, parentsHealth: 0 });
  const [lifestyle, setLifestyle] = useState({ subscriptions: 0, entertainment: 0, clothing: 0, fitness: 0, diningOut: 0 });
  const [obligations, setObligations] = useState({ loanEmi: 0, ccBill: 0, sip: 0, rd: 0, npsPpf: 0 });
  const [goals, setGoals] = useState({ vacation: 0, kidsFund: 0, homeDownPayment: 0, carDownPayment: 0 });

  /* -------- cushions -------- */
  const [cushions, setCushions] = useState({ emergencyFund: 0, bankBalance: 0 });

  /* -------- totals & ratios -------- */
  const totalIncome = useMemo(() => sumObj(income), [income]);
  const totalExpenses = useMemo(
    () => sumObj(housing) + sumObj(familyNeeds) + sumObj(transport) + sumObj(protection) + sumObj(lifestyle) + sumObj(obligations) + sumObj(goals),
    [housing, familyNeeds, transport, protection, lifestyle, obligations, goals]
  );
  const surplus = totalIncome - totalExpenses;

  // Ratios
  const savingsMonthly = fmt(obligations.sip) + fmt(obligations.rd) + fmt(goals.kidsFund);
  const savingsRate = totalIncome ? (savingsMonthly / totalIncome) * 100 : 0; // target 20%+
  const dti = totalIncome ? (fmt(obligations.loanEmi) / totalIncome) * 100 : 0; // target < 30%

  // Adequacy checks (simple heuristics)
  const members = fmt(profile.adults) + fmt(profile.children) + fmt(profile.seniors);
  const minHealthCover = members <= 3 ? 500000 : members <= 5 ? 1000000 : 1500000; // suggested floater
  const hasAdequateHealth = (fmt(protection.healthInsurance) + fmt(protection.parentsHealth)) >= minHealthCover / 12; // monthly equivalent approximation
  const lifeCoverNeeded = totalIncome * 12 * 10; // 10x annual income
  const lifeCoverMonthlyProxy = lifeCoverNeeded / (12 * 1000); // assume ~₹1000 per lakh per year proxy => crude

  // Emergency fund months
  const coreMonthly = sumObj(housing) + sumObj(familyNeeds) + sumObj(transport) + sumObj(protection);
  const emergencyMonths = coreMonthly ? fmt(cushions.emergencyFund) / coreMonthly : 0;

  /* -------- pie data -------- */
  const pieData = useMemo(() => {
    const arr = [
      { name: "Housing", value: sumObj(housing) },
      { name: "Family Needs", value: sumObj(familyNeeds) },
      { name: "Transport", value: sumObj(transport) },
      { name: "Protection", value: sumObj(protection) },
      { name: "Lifestyle", value: sumObj(lifestyle) },
      { name: "Obligations", value: sumObj(obligations) },
      { name: "Goals", value: sumObj(goals) },
    ].filter((d) => d.value > 0);
    return arr;
  }, [housing, familyNeeds, transport, protection, lifestyle, obligations, goals]);

  const renderPieLabel = ({ name, value }) => `${name} — ₹${Number(value).toLocaleString("en-IN")}`;
  const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

  /* -------- insights -------- */
  const insights = useMemo(() => {
    if (totalIncome <= 0) return [];
    const list = [];

    if (savingsRate < 20) list.push({ type: "warning", title: "Savings Rate Low", detail: "Aim for 20–30% savings. Tighten lifestyle or increase income." });
    if (dti > 30) list.push({ type: "danger", title: "High Debt-to-Income", detail: "EMIs exceed 30% of income. Consider prepaying or refinancing." });
    if (surplus < 0) list.push({ type: "danger", title: "Monthly Deficit", detail: "Expenses exceed income. Trim variable spends and reassess goals." });

    if (!hasAdequateHealth) list.push({ type: "info", title: "Health Cover May Be Low", detail: `For a family of ${members}, target floater ≈ ₹${minHealthCover.toLocaleString("en-IN")}.` });

    if (emergencyMonths < 3) list.push({ type: "warning", title: "Emergency Fund Thin", detail: `Maintain 3–6 months of core expenses; you have ~${emergencyMonths.toFixed(1)} months.` });

    if (fmt(protection.lifeInsurance) * 12 * 1000 < lifeCoverNeeded) list.push({ type: "info", title: "Life Cover Check", detail: `Indicative need ~10× annual income. Proxy needed ≈ ₹${(lifeCoverNeeded/100000).toFixed(0)}L SA.` });

    const lifestyleShare = totalExpenses ? sumObj(lifestyle) / totalExpenses : 0;
    if (lifestyleShare > 0.3) list.push({ type: "info", title: "Lifestyle Spend High", detail: "Lifestyle >30% of expenses. Audit subscriptions and outings." });

    return list;
  }, [totalIncome, totalExpenses, savingsRate, dti, surplus, hasAdequateHealth, emergencyMonths, protection.lifeInsurance, lifeCoverNeeded, lifestyle]);

  const renderAccTitle = (label, amount) => (expanded) => (
    <div className="acc-title">
      <span>{label}</span>
      {!expanded && amount > 0 && <span className="acc-amt">₹{inr.format(amount)}</span>}
    </div>
  );

  const goToReport = () => {
    navigate("/ffc/report", {
      state: {
        profile,
        income,
        expenses: { housing, familyNeeds, transport, protection, lifestyle, obligations, goals },
        metrics: { totalIncome, totalExpenses, surplus, savingsRate, dti, emergencyMonths },
      },
    });
  };

  return (
    <>
      <ModuleHeader
        title="Family Financial Checkup (FFC)"
        subtitle="Holistic money health for your household"
        actions={
          <>
            <Button variant="ghost">Share</Button>
            <Button>Download PDF</Button>
            <Button onClick={goToReport}>Preview Report</Button>
          </>
        }
      />

      <div className="pv-col pv-container" style={{ gap: 24, padding: "16px 8px" }}>
        {/* ---------- Family Profile ---------- */}
        <Card title="Family Profile">
          <div className="pv-row" style={{ flexWrap: "wrap", gap: 12 }}>
            <Input label="Family Name" value={profile.familyName} onChange={(e) => setProfile({ ...profile, familyName: e.target.value })} />
            <Input label="City & State" value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} />
            <Input type="number" label="Adults" value={profile.adults} onChange={(e) => setProfile({ ...profile, adults: Number(e.target.value || 0) })} />
            <Input type="number" label="Children" value={profile.children} onChange={(e) => setProfile({ ...profile, children: Number(e.target.value || 0) })} />
            <Input type="number" label="Seniors" value={profile.seniors} onChange={(e) => setProfile({ ...profile, seniors: Number(e.target.value || 0) })} />
          </div>
        </Card>

        {/* ---------- Income ---------- */}
        <Card title="Household Income (Monthly)">
          <div className="pv-col" style={{ gap: 8 }}>
            {Object.keys(income).map((k) => (
              <Row key={k} label={k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())} value={income[k]} onChange={(v) => setIncome((p) => ({ ...p, [k]: v }))} />
            ))}
            {totalIncome > 0 && (
              <div className="pv-row" style={{ justifyContent: "flex-end" }}>
                <Alert title={`Income — ₹${totalIncome.toLocaleString("en-IN")}`} />
              </div>
            )}
          </div>
        </Card>

        {/* ---------- Expenses ---------- */}
        <Accordion
          items={[
            { title: renderAccTitle("Housing", sumObj(housing)), content: (
              <CategoryGroup title="Housing" fields={[
                { key: "rentOrEmi", label: "House Rent / Home EMI" },
                { key: "maintenance", label: "Maintenance / Society" },
                { key: "utilities", label: "Electricity / Water" },
                { key: "internet", label: "Internet / Wi‑Fi" },
                { key: "gas", label: "Gas / Cylinder" },
              ]} data={housing} setData={setHousing} />) },

            { title: renderAccTitle("Family Needs", sumObj(familyNeeds)), content: (
              <CategoryGroup title="Family Needs" fields={[
                { key: "groceries", label: "Groceries / Kitchen" },
                { key: "schoolFees", label: "School / College Fees" },
                { key: "tuition", label: "Coaching / Tuition" },
                { key: "childcare", label: "Creche / Babysitting" },
              ]} data={familyNeeds} setData={setFamilyNeeds} />) },

            { title: renderAccTitle("Transport", sumObj(transport)), content: (
              <CategoryGroup title="Transport" fields={[
                { key: "fuel", label: "Fuel" },
                { key: "public", label: "Public Transport" },
                { key: "cab", label: "Ola / Uber / Rapido" },
                { key: "vehicleEmi", label: "Vehicle EMI" },
                { key: "maintenance", label: "Vehicle Maintenance / Insurance" },
              ]} data={transport} setData={setTransport} />) },

            { title: renderAccTitle("Protection (Insurance)", sumObj(protection)), content: (
              <CategoryGroup title="Protection (Insurance)" fields={[
                { key: "lifeInsurance", label: "Term Life Premium (monthly)" },
                { key: "healthInsurance", label: "Family Health Premium (monthly)" },
                { key: "parentsHealth", label: "Parents Health Premium (monthly)" },
              ]} data={protection} setData={setProtection} />) },

            { title: renderAccTitle("Lifestyle", sumObj(lifestyle)), content: (
              <CategoryGroup title="Lifestyle" fields={[
                { key: "subscriptions", label: "OTT / Subscriptions" },
                { key: "entertainment", label: "Entertainment / Outings" },
                { key: "clothing", label: "Clothing / Shopping" },
                { key: "fitness", label: "Fitness / Sports" },
                { key: "diningOut", label: "Dining Out" },
              ]} data={lifestyle} setData={setLifestyle} />) },

            { title: renderAccTitle("Financial Obligations", sumObj(obligations)), content: (
              <CategoryGroup title="Financial Obligations" fields={[
                { key: "loanEmi", label: "Loan EMI (all loans)" },
                { key: "ccBill", label: "Credit Card Bill (avg)" },
                { key: "sip", label: "Mutual Fund SIP" },
                { key: "rd", label: "RD / FD" },
                { key: "npsPpf", label: "NPS / PPF" },
              ]} data={obligations} setData={setObligations} />) },

            { title: renderAccTitle("Goals (Monthly provisioning)", sumObj(goals)), content: (
              <CategoryGroup title="Goals" fields={[
                { key: "vacation", label: "Annual Vacation (avg/month)" },
                { key: "kidsFund", label: "Kid's Education Fund" },
                { key: "homeDownPayment", label: "Home Down Payment" },
                { key: "carDownPayment", label: "Car Down Payment" },
              ]} data={goals} setData={setGoals} />) },

            { title: renderAccTitle("Cushions", sumObj(cushions)), content: (
              <CategoryGroup title="Cushions" fields={[
                { key: "emergencyFund", label: "Emergency Fund (current)" },
                { key: "bankBalance", label: "Bank Balance (avg)" },
              ]} data={cushions} setData={setCushions} />) },
          ]}
        />

        {/* ---------- Summary ---------- */}
        <Card title="Family Financial Summary">
          <div className="pv-row" style={{ alignItems: "flex-start", flexWrap: "wrap", gap: 20, justifyContent: "space-between" }}>
            <div style={{ flex: "1 1 320px", height: 260 }}>
              {pieData.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} label={renderPieLabel}>
                      {pieData.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                    </Pie>
                    <ChartTooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p style={{ color: "var(--pv-dim)" }}>Enter data to see expense distribution.</p>
              )}
            </div>

            <div className="pv-col" style={{ gap: 6, minWidth: 240 }}>
              <Badge>Income ₹{totalIncome.toLocaleString("en-IN")}</Badge>
              <Badge variant="ghost">Expenses ₹{totalExpenses.toLocaleString("en-IN")}</Badge>
              <Badge color={surplus >= 0 ? "green" : "red"}>Surplus ₹{surplus.toLocaleString("en-IN")}</Badge>
              <Badge>Savings Rate {totalIncome > 0 ? `${savingsRate.toFixed(1)}%` : "-"}</Badge>
              <Badge>Debt-to-Income {totalIncome > 0 ? `${dti.toFixed(1)}%` : "-"}</Badge>
              <Badge>Emergency Fund ~{emergencyMonths.toFixed(1)} months</Badge>
            </div>
          </div>

          {insights.length > 0 && (
            <div className="pv-col" style={{ marginTop: 14 }}>
              <InsightsList items={insights} />
            </div>
          )}

          <div className="pv-row" style={{ marginTop: 14, justifyContent: "flex-end" }}>
            <Button onClick={goToReport}>Preview Report</Button>
          </div>
        </Card>
      </div>
    </>
  );
}
