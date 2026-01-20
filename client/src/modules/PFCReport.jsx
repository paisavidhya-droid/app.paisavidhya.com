// src/modules/PFCReport.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Badge, Button, Alert, Modal } from "../components";
import InsightsList from "../components/InsightsList";
import ModuleHeader from "../components/ui/moduleHeader/ModuleHeader.jsx";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
} from "recharts";
import "./piechart.css";
import toast from "react-hot-toast";
import { useMemo, useState, useRef } from "react";
import RatioCoach from "./RatioCoach";
import { useDeviceSize } from "../context/DeviceSizeContext.jsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const COLORS = [
  "#0071E3",
  "#1FC27E",
  "#FFC300",
  "#FF8C00",
  "#FF4C4C",
  "#905EFF",
];
const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const fmt = (n) => (isNaN(n) ? 0 : Number(n));

export default function PFCReport() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { isMobile } = useDeviceSize();
  const reportRef = useRef(null);

  /* -------- modal -------- */
  const [showModal, setShowModal] = useState(false);

  // Resolve safeState WITHOUT early return
  let safeState = state;
  if (!safeState) {
    try {
      const cached = JSON.parse(
        localStorage.getItem("pv_pfc_payload") || "null",
      );
      if (cached && cached.info && cached.income && cached.expenses) {
        safeState = cached;
      }
    } catch {}
  }
  const noData = !safeState;

  // Always provide shapes so hooks run every render
  const empty = {};
  const emptyExp = {
    housing: empty,
    food: empty,
    transport: empty,
    lifestyle: empty,
    health: empty,
    obligations: empty,
    leisure: empty,
    growth: empty,
    giving: empty,
  };
  const { info, income, expenses } = safeState ?? {
    info: {},
    income: {},
    expenses: emptyExp,
  };

  const {
    housing,
    food,
    transport,
    lifestyle,
    health,
    obligations,
    leisure,
    growth,
    giving,
  } = expenses;

  const sum = (obj) => Object.values(obj || {}).reduce((a, b) => a + fmt(b), 0);
  const totalIncome = sum(income);
  const totals = {
    Housing: sum(housing),
    Food: sum(food),
    Transport: sum(transport),
    Lifestyle: sum(lifestyle),
    Health: sum(health),
    Obligations: sum(obligations),
    Leisure: sum(leisure),
    Growth: sum(growth),
    Giving: sum(giving),
  };
  const totalExpenses = Object.values(totals).reduce((a, b) => a + b, 0);
  const surplus = totalIncome - totalExpenses;
  const savingsRate = totalIncome
    ? ((fmt(obligations?.sip) + fmt(obligations?.rd) + fmt(obligations?.nps)) /
        totalIncome) *
      100
    : 0;
  const emiLoad = totalIncome
    ? (fmt(obligations?.loanEmi) / totalIncome) * 100
    : 0;

  // const pieData = Object.entries(totals)
  //   .map(([name, value]) => ({ name, value }))
  //   .filter((d) => d.value > 0);

  const pieData = useMemo(
    () =>
      Object.entries(totals)
        .map(([name, value]) => ({ name, value }))
        .filter((d) => d.value > 0)
        .sort((a, b) => b.value - a.value),
    [totals],
  );

  // Fixed/variable & 50/30/20 helpers
  const fixedFrom = ({ housing, health, obligations, lifestyle }) => {
    const sum = (o) => Object.values(o || {}).reduce((a, b) => a + fmt(b), 0);
    const emi = fmt(obligations?.loanEmi);
    const insurance = fmt(health?.insurance);
    const subs = fmt(lifestyle?.subscriptions);
    return sum(housing) + emi + insurance + subs;
  };

  const wantsFrom = ({ lifestyle, leisure, giving, food, transport }) => {
    const sum = (o) => Object.values(o || {}).reduce((a, b) => a + fmt(b), 0);
    return (
      sum(lifestyle) +
      sum(leisure) +
      sum(giving) +
      0.5 * sum(food) +
      0.5 * sum(transport)
    );
  };

  const needsFrom = ({ housing, food, transport, health, obligations }) => {
    const sum = (o) => Object.values(o || {}).reduce((a, b) => a + fmt(b), 0);
    const totalFood = sum(food);
    const totalTransport = sum(transport);
    const ccBill = fmt(obligations?.ccBill);
    const emi = fmt(obligations?.loanEmi);
    const trueSavings =
      fmt(obligations?.sip) + fmt(obligations?.rd) + fmt(obligations?.nps);
    return (
      sum(housing) +
      0.5 * totalFood +
      0.5 * totalTransport +
      sum(health) +
      emi +
      ccBill +
      (sum(obligations) - trueSavings - emi - ccBill)
    );
  };

  const trueSavingsFrom = (obligations) =>
    fmt(obligations?.sip) + fmt(obligations?.rd) + fmt(obligations?.nps);

  const fixedTotal = useMemo(
    () => fixedFrom({ housing, health, obligations, lifestyle }),
    [housing, health, obligations, lifestyle],
  );
  const variableTotal = Math.max(0, totalExpenses - fixedTotal);

  const needAmt = useMemo(
    () =>
      Math.max(0, needsFrom({ housing, food, transport, health, obligations })),
    [housing, food, transport, health, obligations],
  );
  const wantAmt = useMemo(
    () =>
      Math.max(0, wantsFrom({ lifestyle, leisure, giving, food, transport })),
    [lifestyle, leisure, giving, food, transport],
  );
  const savingAmt = trueSavingsFrom(obligations);

  const needsPct = totalIncome ? (needAmt / totalIncome) * 100 : 0;
  const wantsPct = totalIncome ? (wantAmt / totalIncome) * 100 : 0;
  const savingPct = totalIncome ? (savingAmt / totalIncome) * 100 : 0;

  const surplusPct = totalIncome ? (surplus / totalIncome) * 100 : 0;
  const investShareOfExpenses = totalExpenses
    ? (savingAmt / totalExpenses) * 100
    : 0;
  const dti = totalIncome ? (fmt(obligations?.loanEmi) / totalIncome) * 100 : 0;
  const ccPct = totalIncome
    ? (fmt(obligations?.ccBill) / totalIncome) * 100
    : 0;

  const insights = (() => {
    const list = [];
    if (totalIncome <= 0) return list;

    if (savingPct < 15) {
      list.push({
        type: "warning",
        title: "Low Savings Rate",
        detail:
          "Savings (SIP+RD+NPS) are below 15% of income. Aim for 20–30% over time.",
      });
    } else if (savingPct >= 20) {
      list.push({
        type: "success",
        title: "Healthy Savings Habit",
        detail:
          "You're saving 20%+ of income. Keep increasing step-up SIPs annually.",
      });
    }

    if (dti > 30) {
      list.push({
        type: "danger",
        title: "High EMI Load (DTI > 30%)",
        detail:
          "Consider restructuring or prepaying loans. Target DTI below 25%, ideally <20%.",
      });
    } else if (dti > 20) {
      list.push({
        type: "warning",
        title: "EMI Load is Elevated",
        detail: "Try to keep EMIs under 20% of income to retain flexibility.",
      });
    }

    if (ccPct > 10) {
      list.push({
        type: "info",
        title: "High Credit Card Spend",
        detail:
          "Card bill exceeds 10% of income. Review discretionary swipes and pay in full.",
      });
    }

    if (surplus < 0) {
      list.push({
        type: "danger",
        title: "Monthly Deficit",
        detail:
          "Spending exceeds income. Cut variable outlays and pause non-essential buys.",
      });
    } else if (surplus > 0 && savingPct < 20) {
      list.push({
        type: "info",
        title: "Deploy Your Surplus",
        detail: `You have a monthly surplus of ₹${inr.format(
          surplus,
        )}. Channel more into SIP/NPS to reach 20–30% savings.`,
      });
    }

    if (totalExpenses > 0 && (totals.Lifestyle || 0) / totalExpenses > 0.3) {
      list.push({
        type: "info",
        title: "Lifestyle Spending > 30%",
        detail:
          "Trim subscriptions, shopping, and weekend outings to free cash for goals.",
      });
    }

    if (fmt(lifestyle?.subscriptions) / (totalExpenses || 1) > 0.05) {
      list.push({
        type: "info",
        title: "Subscriptions Are Piling Up",
        detail:
          "Subscriptions exceed 5% of expenses. Audit and cancel underused ones.",
      });
    }

    if (needsPct > 55 || wantsPct > 35 || savingPct < 10) {
      list.push({
        type: "warning",
        title: "50/30/20 Balance Off",
        detail: `Needs ${needsPct.toFixed(1)}%, Wants ${wantsPct.toFixed(
          1,
        )}%, Savings ${savingPct.toFixed(
          1,
        )}%. Move gradually toward ~50/30/20.`,
      });
    } else {
      list.push({
        type: "success",
        title: "Balanced Budget Mix",
        detail: `Your mix is close to 50/30/20: Needs ${needsPct.toFixed(
          1,
        )}%, Wants ${wantsPct.toFixed(1)}%, Savings ${savingPct.toFixed(1)}%.`,
      });
    }

    if (
      savingAmt > 0 &&
      fmt(growth?.courses) + fmt(growth?.books) + fmt(growth?.workshops) <
        0.03 * totalIncome
    ) {
      list.push({
        type: "info",
        title: "Invest in Self-Growth",
        detail:
          "Allocate 2–5% of income to courses/books/workshops for higher future earning power.",
      });
    }

    list.push({
      type: "info",
      title: "Emergency Fund",
      detail:
        "Maintain 3–6 months of essential expenses in liquid funds/bank. Build it before aggressive investing.",
    });

    if (fmt(giving?.charity) + fmt(giving?.familySupport) > 0) {
      list.push({
        type: "info",
        title: "Giving is Accounted",
        detail:
          "Great to see planned giving. Keep it within your surplus to avoid shortfalls.",
      });
    }

    return list;
  })();

  const actions = (() => {
    const a = [];
    if (surplus < 0)
      a.push(
        "Freeze discretionary spends for 30 days; target immediate 10–15% cut in Lifestyle/Leisure.",
      );
    if (savingPct < 20 && surplus > 0)
      a.push(
        `Increase SIP by ₹${inr.format(
          Math.max(500, Math.floor(surplus * 0.5)),
        )} this month; enable auto-debit.`,
      );
    if (dti > 30)
      a.push(
        "Explore loan refinance/part-prepayment to bring EMI load under 25% of income.",
      );
    if (ccPct > 10)
      a.push(
        "Pay card in full; move recurring payments to debit/UPI; keep utilization < 30%.",
      );
    if ((totals.Lifestyle || 0) / (totalExpenses || 1) > 0.3)
      a.push(
        "Cancel/trim subscriptions, reduce shopping/weekend outings by 20%.",
      );
    a.push(
      "Build/maintain 3–6 months emergency fund in liquid instruments before upping risk.",
    );
    return a.slice(0, 5);
  })();

  // Build coachTotals
  const coachTotals = {
    Housing: totals.Housing,
    Food: totals.Food,
    Transport: totals.Transport,
    Lifestyle: totals.Lifestyle,
    Health: totals.Health,
    Obligations: totals.Obligations,
    Leisure: totals.Leisure,
    Growth: totals.Growth,
    Giving: totals.Giving,
    _SavingsInvestments: trueSavingsFrom(obligations),
  };

  const handlePrint = () => window.print();
  const renderPieLabel = ({ name, value }) => `${name} — ₹${inr.format(value)}`;

  function neutralizeOklabColors(rootEl = document.documentElement) {
    const styles = getComputedStyle(rootEl);
    for (let i = 0; i < styles.length; i++) {
      const prop = styles[i];
      const val = styles.getPropertyValue(prop);
      if (val.includes("oklab")) {
        rootEl.style.setProperty(prop, "rgb(100,100,100)");
      }
    }
  }

  const exportPDF = async () => {
    const input = reportRef.current;
    if (!input) return;
    try {
      neutralizeOklabColors(); // <-- call before capture

      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeight);
      pdf.save(`${info?.name || "PFC_Report"}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
      toast.error("Could not generate PDF");
    }
  };

  const msisdnDisplay = String(info?.mobile || "")
    .replace(/\D/g, "")
    .replace(/^0+/, "");
  const shareViaWhatsApp = () => {
    const msg = encodeURIComponent(
      `*${info?.name || "Your"} Personal Financial Checkup*\n` +
        `Total Income: ₹${totalIncome.toLocaleString()}\n` +
        `Total Expenses: ₹${totalExpenses.toLocaleString()}\n` +
        `Surplus: ₹${surplus.toLocaleString()}\n` +
        `Savings Rate: ${savingsRate.toFixed(1)}%\n` +
        `EMI Load: ${emiLoad.toFixed(1)}%\n` +
        `Check your financial health at paisavidhya.com`,
    );
    if (msisdnDisplay.length < 10) {
      toast.error("Enter a valid 10-digit WhatsApp number");
      return;
    }
    window.open(`https://wa.me/91${msisdnDisplay}?text=${msg}`, "_blank");
  };

  return (
    <>
      <ModuleHeader
        title="PFC Report"
        subtitle={info?.name ? `Summary for ${info.name}` : "Summary"}
        actions={
          <>
            <Button variant="ghost" onClick={() => navigate("/pfc")}>
              Edit
            </Button>
            <Button onClick={exportPDF}>Download</Button>
          </>
        }
      />

      <div
        ref={reportRef}
        className="pv-container"
        style={{ padding: "16px 8px", display: "grid", gap: 16 }}
      >
        {noData ? (
          <Card title="No report data">
            <Alert type="warning">Please complete your PFC first.</Alert>
            <div className="pv-row" style={{ marginTop: 10 }}>
              <Button onClick={() => navigate("/pfc")}>Go to PFC</Button>
            </div>
          </Card>
        ) : (
          <>
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
                  <div style={{ fontWeight: 800, fontSize: 18 }}>
                    {info?.name || "—"}
                  </div>
                  <div style={{ color: "var(--pv-dim)" }}>
                    {info?.city || "City"}{" "}
                    {info?.gender ? `• ${info.gender}` : ""}
                  </div>
                </div>
                <div className="pv-row" style={{ gap: 8 }}>
                  <Badge>Income ₹{inr.format(totalIncome)}</Badge>
                  <Badge variant="ghost">
                    Expenses ₹{inr.format(totalExpenses)}
                  </Badge>
                  <Badge color={surplus >= 0 ? "green" : "red"}>
                    Surplus ₹{inr.format(surplus)}
                  </Badge>
                </div>
              </div>
            </Card>

            <Card>
              <div className="pv-row" style={{ gap: 12, flexWrap: "wrap" }}>
                <div
                  className="pv-card"
                  style={{ padding: 12, flex: "1 1 180px" }}
                >
                  <div style={{ color: "var(--pv-dim)", fontSize: 12 }}>
                    Savings Rate
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 20 }}>
                    {totalIncome ? `${savingsRate.toFixed(1)}%` : "-"}
                  </div>
                </div>
                <div
                  className="pv-card"
                  style={{ padding: 12, flex: "1 1 180px" }}
                >
                  <div style={{ color: "var(--pv-dim)", fontSize: 12 }}>
                    EMI Load
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 20 }}>
                    {totalIncome ? `${emiLoad.toFixed(1)}%` : "-"}
                  </div>
                </div>
                <div
                  className="pv-card"
                  style={{ padding: 12, flex: "1 1 180px" }}
                >
                  <div style={{ color: "var(--pv-dim)", fontSize: 12 }}>
                    % Needs (Housing+Food+Transport)
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 20 }}>
                    {totalExpenses
                      ? `${(
                          ((totals.Housing + totals.Food + totals.Transport) /
                            totalExpenses) *
                          100
                        ).toFixed(1)}%`
                      : "-"}
                  </div>
                </div>
                <div
                  className="pv-card"
                  style={{ padding: 12, flex: "1 1 180px" }}
                >
                  <div style={{ color: "var(--pv-dim)", fontSize: 12 }}>
                    Surplus % of Income
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 20 }}>
                    {totalIncome ? `${surplusPct.toFixed(1)}%` : "-"}
                  </div>
                </div>
                <div
                  className="pv-card"
                  style={{ padding: 12, flex: "1 1 180px" }}
                >
                  <div style={{ color: "var(--pv-dim)", fontSize: 12 }}>
                    Fixed vs Variable
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 20 }}>
                    ₹{inr.format(fixedTotal)} / ₹{inr.format(variableTotal)}
                  </div>
                </div>
                <div
                  className="pv-card"
                  style={{ padding: 12, flex: "1 1 180px" }}
                >
                  <div style={{ color: "var(--pv-dim)", fontSize: 12 }}>
                    50/30/20 (N/W/S)
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 20 }}>
                    {totalIncome
                      ? `${needsPct.toFixed(0)}/${wantsPct.toFixed(
                          0,
                        )}/${savingPct.toFixed(0)}`
                      : "-"}
                  </div>
                </div>
                <div
                  className="pv-card"
                  style={{ padding: 12, flex: "1 1 180px" }}
                >
                  <div style={{ color: "var(--pv-dim)", fontSize: 12 }}>
                    Investments as % of Expenses
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 20 }}>
                    {totalExpenses
                      ? `${investShareOfExpenses.toFixed(1)}%`
                      : "-"}
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Expense Breakdown">
              <div
                className="pv-row"
                style={{ alignItems: "stretch", gap: 20, flexWrap: "wrap" }}
              >
                <div style={{ flex: "1 1 360px", height: 300 }}>
                  {pieData.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={70}
                          outerRadius={110}
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
                    <div style={{ color: "var(--pv-dim)" }}>
                      No expenses entered.
                    </div>
                  )}
                </div>
                <div className="pv-col" style={{ flex: "1 1 320px", gap: 6 }}>
                  {Object.entries(totals).map(([k, v]) => {
                    if (!v) return null;
                    const pct = totalExpenses ? (v / totalExpenses) * 100 : 0;
                    return (
                      <div
                        key={k}
                        className="pv-row"
                        style={{ justifyContent: "space-between", gap: 8 }}
                      >
                        <div style={{ color: "var(--pv-dim)" }}>{k}</div>
                        <div style={{ fontWeight: 700 }}>
                          ₹{inr.format(v)}{" "}
                          <span
                            style={{ color: "var(--pv-dim)", fontWeight: 500 }}
                          >
                            ({pct.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>

            {insights.length > 0 && (
              <Card title="Insights">
                <InsightsList items={insights} />
              </Card>
            )}

            {actions.length > 0 && (
              <Card title="Your 30-Day Action Plan">
                <ol style={{ paddingLeft: 18, lineHeight: 1.6 }}>
                  {actions.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ol>
              </Card>
            )}

            <Card title="Ratio Coach">
              <div className="pv-col" style={{ marginTop: 8 }}>
                <RatioCoach
                  info={info}
                  totals={coachTotals}
                  totalIncome={totalIncome}
                />
              </div>
            </Card>
          </>
        )}

        {/* ---------- Share Modal ---------- */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Share Your Financial Summary"
          footer={
            <>
              <Button variant="ghost" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button onClick={shareViaWhatsApp}>Send on WhatsApp</Button>
            </>
          }
        >
          <p style={{ color: "var(--pv-dim)" }}>
            Your summary will be sent to WhatsApp number +91{" "}
            {msisdnDisplay || "__________"}.
          </p>
        </Modal>
      </div>

      <style>{`
        @media print {
          header, nav, footer, .pv-btn, .pv-btn.ghost { display: none !important; }
          .pv-container { padding: 0 !important; }
          .pv-card { box-shadow: none !important; border: 1px solid #e5e7eb; }
        }
      `}</style>
    </>
  );
}
