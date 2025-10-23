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
import { useAuth } from "../hooks/useAuth";
import InsightsList from "../components/InsightsList";
import { useNavigate } from "react-router-dom";
import RatioCoach from "./RatioCoach";

/* ---------- small helper ---------- */
const COLORS = [
  "#0071E3",
  "#1FC27E",
  "#FFC300",
  "#FF8C00",
  "#FF4C4C",
  "#905EFF",
];
const fmt = (n) => (isNaN(n) ? 0 : Number(n));

/* ---------- reusable input row ---------- */
function Row({ label, value, onChange }) {
  return (
    <div className="pv-row" style={{ alignItems: "center", gap: 8 }}>
      <label style={{ width: "60%", color: "var(--pv-dim)" }}>{label}</label>
      <AmountInput value={value} onChange={onChange} />
    </div>
  );
}

/* ---------- category group ---------- */
function CategoryGroup({ title, fields, data, setData }) {
  const total = useMemo(
    () => Object.values(data).reduce((a, b) => a + fmt(b), 0),
    [data]
  );

  return (
    <Card title={`${title}  —  ₹${total.toLocaleString()}`}>
      <div className="pv-col" style={{ gap: 6 }}>
        {fields.map((f) => (
          <Row
            key={f.key}
            label={f.label}
            value={data[f.key] || 0}
            onChange={(v) => setData((p) => ({ ...p, [f.key]: v }))}
          />
        ))}
      </div>
    </Card>
  );
}

/* ---------- main component ---------- */
export default function PFC() {
  const navigate = useNavigate();
  const { user } = useAuth();
  /* -------- basic info -------- */
  const [info, setInfo] = useState({
    name: user?.name || "",
    dob: user?.dob || "",
    gender: user?.gender || "",
    city: user?.city || "",
    mobile: user?.phoneNumber || "",
  });

  /* -------- income -------- */
  const [income, setIncome] = useState({
    salary: 0,
    freelance: 0,
    interest: 0,
    dividends: 0,
    rent: 0,
  });

  /* -------- expenses -------- */
  const [housing, setHousing] = useState({
    rent: 0,
    maintenance: 0,
    electricity: 0,
    internet: 0,
    gas: 0,
  });
  const [food, setFood] = useState({
    groceries: 0,
    tiffin: 0,
    eatingOut: 0,
    snacks: 0,
  });
  const [transport, setTransport] = useState({
    fuel: 0,
    public: 0,
    cab: 0,
    emi: 0,
    maintenance: 0,
  });
  const [lifestyle, setLifestyle] = useState({
    clothing: 0,
    grooming: 0,
    fitness: 0,
    hobbies: 0,
    subscriptions: 0,
    entertainment: 0,
  });
  const [health, setHealth] = useState({
    insurance: 0,
    medical: 0,
  });
  const [obligations, setObligations] = useState({
    loanEmi: 0,
    ccBill: 0,
    sip: 0,
    rd: 0,
    nps: 0,
  });
  const [leisure, setLeisure] = useState({
    shortTrips: 0,
    vacation: 0,
    adventure: 0,
  });

  // Add Growth (Learning & Self-Growth) and Giving
  const [growth, setGrowth] = useState({
    courses: 0,
    certifications: 0,
    books: 0,
    workshops: 0,
  });
  const [giving, setGiving] = useState({
    charity: 0,
    familySupport: 0,
  });

  /* -------- results -------- */
  const totalIncome = useMemo(
    () => Object.values(income).reduce((a, b) => a + fmt(b), 0),
    [income]
  );
  const totalExpenses = useMemo(
    () =>
      [
        housing,
        food,
        transport,
        lifestyle,
        health,
        obligations,
        leisure,
        growth,
        giving,
      ].reduce(
        (acc, cat) => acc + Object.values(cat).reduce((a, b) => a + fmt(b), 0),
        0
      ),
    [
      housing,
      food,
      transport,
      lifestyle,
      health,
      obligations,
      leisure,
      growth,
      giving,
    ]
  );

  const surplus = totalIncome - totalExpenses;
  const savingsRate =
    ((fmt(obligations.sip) + fmt(obligations.rd) + fmt(obligations.nps)) /
      totalIncome) *
      100 || 0;
  const emiLoad = (fmt(obligations.loanEmi) / totalIncome) * 100 || 0;

  const savingsOnly =
    fmt(obligations.sip) + fmt(obligations.rd) + fmt(obligations.nps);

  const coachTotals = {
    Housing: Object.values(housing).reduce((a, b) => a + fmt(b), 0),
    Food: Object.values(food).reduce((a, b) => a + fmt(b), 0),
    Transport: Object.values(transport).reduce((a, b) => a + fmt(b), 0),
    Lifestyle: Object.values(lifestyle).reduce((a, b) => a + fmt(b), 0),
    Health: Object.values(health).reduce((a, b) => a + fmt(b), 0),
    Obligations: Object.values(obligations).reduce((a, b) => a + fmt(b), 0),
    Leisure: Object.values(leisure).reduce((a, b) => a + fmt(b), 0),
    Growth: Object.values(growth).reduce((a, b) => a + fmt(b), 0),
    Giving: Object.values(giving).reduce((a, b) => a + fmt(b), 0),
    _SavingsInvestments: savingsOnly, // coach uses ONLY true investments here
  };

  const pieData = useMemo(() => {
    if (!totalExpenses) return [];
    return [
      {
        name: "Housing",
        value: Object.values(housing).reduce((a, b) => a + fmt(b), 0)
      },
      { name: "Food", value: Object.values(food).reduce((a, b) => a + fmt(b), 0) },
      {
        name: "Transport",
        value: Object.values(transport).reduce((a, b) => a + fmt(b), 0),
      },
      {
        name: "Lifestyle",
        value: Object.values(lifestyle).reduce((a, b) => a + fmt(b), 0),
      },
      {
        name: "Health",
        value: Object.values(health).reduce((a, b) => a + fmt(b), 0),
      },
      {
        name: "Obligations",
        value: Object.values(obligations).reduce((a, b) => a + fmt(b), 0),
      },
      {
        name: "Leisure",
        value: Object.values(leisure).reduce((a, b) => a + fmt(b), 0),
      },
      {
        name: "Growth",
        value: Object.values(growth).reduce((a, b) => a + fmt(b), 0),
      },
      {
        name: "Giving",
        value: Object.values(giving).reduce((a, b) => a + fmt(b), 0),
      },
    ].filter((d) => d.value > 0);
  }, [
    housing,
    food,
    transport,
    lifestyle,
    health,
    obligations,
    leisure,
    growth,
    giving,
    totalExpenses,
  ]);
  /* -------- insights -------- */
  const insights = useMemo(() => {
    // if no income, don't show any insights
    if (totalIncome <= 0) return [];
    const list = [];

    if (savingsRate < 15) {
      list.push({
        type: "warning",
        title: "Low Savings Rate",
        detail: "Your savings rate is below 15%. Try to raise it gradually.",
      });
    }

    if (emiLoad > 30) {
      list.push({
        type: "danger",
        title: "High EMI Load",
        detail:
          "EMIs exceed 30% of income. Consider restructuring or prepaying debt.",
      });
    }

    if (surplus < 0) {
      list.push({
        type: "danger",
        title: "Monthly Deficit",
        detail: "You're spending more than you earn. Reduce variable expenses.",
      });
    }

    // Nice-to-have (example): Lifestyle > 30% of expenses
    // optional: only check lifestyle if expenses exist
    const totalExp = totalExpenses || 0;
    if (totalExp > 0) {
      const lifestyleTotal = Object.values(lifestyle).reduce(
        (a, b) => a + (b || 0),
        0
      );
      if (lifestyleTotal / totalExp > 0.3) {
        list.push({
          type: "info",
          title: "Lifestyle Spending",
          detail:
            "Lifestyle is over 30% of expenses. Review subscriptions & outings.",
        });
      }
    }

    return list;
  }, [totalIncome, savingsRate, emiLoad, surplus, lifestyle, totalExpenses]);

  const renderPieLabel = ({ name, value }) =>
    `${name} — ₹${Number(value).toLocaleString()}`;

  const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
  const getTotal = (obj) =>
    Object.values(obj).reduce((a, b) => a + (Number(b) || 0), 0);

  const renderAccTitle = (label, amount) => (expanded) =>
    (
      <div className="acc-title">
        <span>{label}</span>
        {!expanded && amount > 0 && (
          <span className="acc-amt">₹{inr.format(amount)}</span>
        )}
      </div>
    );

  const goToReport = () => {
    navigate("/pfc/report", {
      state: {
        info,
        income,
        expenses: {
          housing,
          food,
          transport,
          lifestyle,
          health,
          obligations,
          leisure,
          growth,
          giving,
        },
      },
    });
  };

  return (
    <>
      <ModuleHeader
        title="Personal Financial Checkup (PFC)"
        subtitle="Your money health report"
        actions={
          <>
            <Button variant="ghost">Share</Button>
            <Button>Download PDF</Button>
            <Button onClick={goToReport}>Preview Report</Button>
          </>
        }
      />
      <div
        className="pv-col pv-container"
        style={{ gap: 24, padding: "16px 8px" }}
      >
        {/* ---------- Basic Info ---------- */}
        <Card title="Personal Details">
          <div className="pv-row" style={{ flexWrap: "wrap", gap: 12 }}>
            <Input
              label="Full Name"
              placeholder="Your name"
              value={info.name}
              onChange={(e) => setInfo({ ...info, name: e.target.value })}
            />
            <Input
              type="date"
              label="Date of Birth"
              value={info.dob}
              onChange={(e) => setInfo({ ...info, dob: e.target.value })}
            />
            <Select
              label="Gender"
              value={info.gender}
              onChange={(e) => setInfo({ ...info, gender: e.target.value })}
            >
              <option value="">Select</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </Select>
            {/* <Select
              label="Tenure/Cycle"
              value={info.tenure}
              onChange={(e) => setInfo({ ...info, gender: e.target.value })}
              disabled
              style={{ opacity: 0.6, cursor: "not-allowed" }}
            >
              <option value="">select</option>
              <option>Monthly</option>
              <option>Quarterly</option>
              <option>Half yearly</option>
              <option>Yearly</option>
            </Select> */}
            <Input
              label="City & State"
              value={info.city}
              onChange={(e) => setInfo({ ...info, city: e.target.value })}
            />
            <Input
              label="WhatsApp Number"
              placeholder="10-digit number"
              value={info.mobile}
              onChange={(e) => setInfo({ ...info, mobile: e.target.value })}
            />
          </div>
        </Card>

        <Alert type="info" title="Tip">
          Enter all amounts as <strong>monthly</strong> values for best
          accuracy.
        </Alert>

        {/* ---------- Income ---------- */}
        <Card title="Income Sources (Monthly)">
          <div className="pv-col" style={{ gap: 8 }}>
            {Object.keys(income).map((k) => (
              <Row
                key={k}
                label={k.replace(/^\w/, (c) => c.toUpperCase())}
                value={income[k]}
                onChange={(v) => setIncome((p) => ({ ...p, [k]: v }))}
              />
            ))}
            {totalIncome > 0 && (
              <div className="pv-row" style={{ justifyContent: "flex-end" }}>
                <Alert title={`Income — ₹${totalIncome.toLocaleString()}`} />
              </div>
            )}
          </div>
        </Card>

        {/* ---------- Expenses ---------- */}
        <Accordion
          items={[
            {
              title: renderAccTitle("Housing", getTotal(housing)),
              content: (
                <CategoryGroup
                  title="Housing"
                  fields={[
                    { key: "rent", label: "House Rent / Hostel / PG" },
                    { key: "maintenance", label: "Maintenance / Society" },
                    { key: "electricity", label: "Electricity Bill" },
                    { key: "internet", label: "Internet / Wi-Fi" },
                    { key: "gas", label: "Gas / Cylinder" },
                  ]}
                  data={housing}
                  setData={setHousing}
                />
              ),
            },
            {
              title: renderAccTitle("Food & Groceries", getTotal(food)),
              content: (
                <CategoryGroup
                  title="Food"
                  fields={[
                    { key: "groceries", label: "Groceries / Kitchen" },
                    { key: "tiffin", label: "Tiffin / Mess" },
                    { key: "eatingOut", label: "Eating Out" },
                    { key: "snacks", label: "Snacks / Coffee" },
                  ]}
                  data={food}
                  setData={setFood}
                />
              ),
            },
            {
              title: renderAccTitle("Transport", getTotal(transport)),
              content: (
                <CategoryGroup
                  title="Transport"
                  fields={[
                    { key: "fuel", label: "Fuel" },
                    { key: "public", label: "Public Transport" },
                    { key: "cab", label: "Ola / Uber / Rapido" },
                    { key: "emi", label: "Vehicle EMI" },
                    {
                      key: "maintenance",
                      label: "Vehicle Maintenance / Insurance",
                    },
                  ]}
                  data={transport}
                  setData={setTransport}
                />
              ),
            },
            {
              title: renderAccTitle("Lifestyle", getTotal(lifestyle)),
              content: (
                <CategoryGroup
                  title="Lifestyle"
                  fields={[
                    { key: "clothing", label: "Clothing / Shopping" },
                    { key: "grooming", label: "Grooming / Personal Care" },
                    { key: "fitness", label: "Fitness / Sports" },
                    { key: "hobbies", label: "Hobbies / Music / Books" },
                    { key: "subscriptions", label: "OTT / Subscriptions" },
                    { key: "entertainment", label: "Weekend Entertainment" },
                  ]}
                  data={lifestyle}
                  setData={setLifestyle}
                />
              ),
            },
            {
              title: renderAccTitle("Health & Insurance", getTotal(health)),
              content: (
                <CategoryGroup
                  title="Health"
                  fields={[
                    { key: "insurance", label: "Health Insurance Premium" },
                    { key: "medical", label: "Medicines / Checkups" },
                  ]}
                  data={health}
                  setData={setHealth}
                />
              ),
            },
            {
              title: renderAccTitle(
                "Financial Obligations",
                getTotal(obligations)
              ),
              content: (
                <CategoryGroup
                  title="Financial Obligations"
                  fields={[
                    { key: "loanEmi", label: "Loan EMI" },
                    { key: "ccBill", label: "Credit Card Bill" },
                    { key: "sip", label: "Mutual Fund SIP" },
                    { key: "rd", label: "RD / FD" },
                    { key: "nps", label: "NPS / PPF" },
                  ]}
                  data={obligations}
                  setData={setObligations}
                />
              ),
            },
            {
              title: renderAccTitle("Travel & Leisure", getTotal(leisure)),
              content: (
                <CategoryGroup
                  title="Leisure"
                  fields={[
                    { key: "shortTrips", label: "Weekend Trips" },
                    { key: "vacation", label: "Annual Vacation (avg/month)" },
                    { key: "adventure", label: "Adventure / Sports Trips" },
                  ]}
                  data={leisure}
                  setData={setLeisure}
                />
              ),
            },
            {
              title: renderAccTitle("Learning & Self-Growth", getTotal(growth)),
              content: (
                <CategoryGroup
                  title="Learning & Self-Growth"
                  fields={[
                    { key: "courses", label: "Online Courses" },
                    { key: "certifications", label: "Certifications / Exams" },
                    { key: "books", label: "Books / eBooks" },
                    { key: "workshops", label: "Workshops / Seminars" },
                  ]}
                  data={growth}
                  setData={setGrowth}
                />
              ),
            },
            {
              title: renderAccTitle("Charity / Giving", getTotal(giving)),
              content: (
                <CategoryGroup
                  title="Charity / Giving"
                  fields={[
                    { key: "charity", label: "Charity / Donations" },
                    { key: "familySupport", label: "Family Support" },
                  ]}
                  data={giving}
                  setData={setGiving}
                />
              ),
            },
          ]}
        />

        {/* ---------- Results ---------- */}
        <Card title="Financial Health Summary">
          <div
            className="pv-row"
            style={{
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 20,
              justifyContent: "space-between",
            }}
          >
            <div style={{ flex: "1 1 320px", height: 260 }}>
              {pieData.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={100}
                      label={renderPieLabel}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p style={{ color: "var(--pv-dim)" }}>
                  Enter data to see expense distribution.
                </p>
              )}
            </div>

            <div className="pv-col" style={{ gap: 6, minWidth: 220 }}>
              <Badge>Income ₹{totalIncome.toLocaleString()}</Badge>
              <Badge variant="ghost">
                Expenses ₹{totalExpenses.toLocaleString()}
              </Badge>
              <Badge color={surplus >= 0 ? "green" : "red"}>
                Surplus ₹{surplus.toLocaleString()}
              </Badge>
              <Badge>
                Savings Rate{" "}
                {totalIncome > 0 ? `${savingsRate.toFixed(1)}%` : "-"}
              </Badge>
              <Badge>
                EMI Load {totalIncome > 0 ? `${emiLoad.toFixed(1)}%` : "-"}
              </Badge>
            </div>
          </div>

          {insights.length > 0 && (
            <div className="pv-col" style={{ marginTop: 14 }}>
              <InsightsList items={insights} />
            </div>
          )}

          <div
            className="pv-row"
            style={{ marginTop: 14, justifyContent: "flex-end" }}
          >
            <Button onClick={goToReport}>Preview Report</Button>
          </div>
          <div className="pv-col" style={{ marginTop: 16 }}>
            <RatioCoach
              info={info}
              totals={coachTotals}
              totalIncome={totalIncome}
            />
          </div>
        </Card>
      </div>
    </>
  );
}
