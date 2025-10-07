// src/modules/PFCReport.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Badge, Button, Alert, Modal } from "../components";
import ModuleHeader from "../components/ui/ModuleHeader";
import InsightsList from "../components/InsightsList";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
} from "recharts";
import "../styles/ui.css";
import toast from "react-hot-toast";
import { useState } from "react";

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

  /* -------- modal -------- */
  const [showModal, setShowModal] = useState(false);

  if (!state) {
    return (
      <div className="pv-container" style={{ padding: 16 }}>
        <Card title="No report data">
          <Alert type="warning">Please complete your PFC first.</Alert>
          <div className="pv-row" style={{ marginTop: 10 }}>
            <Button onClick={() => navigate("/pfc")}>Go to PFC</Button>
          </div>
        </Card>
      </div>
    );
  }

  const { info, income, expenses } = state;
  const { housing, food, transport, lifestyle, health, obligations, leisure } =
    expenses;

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
  };
  const totalExpenses = Object.values(totals).reduce((a, b) => a + b, 0);
  const surplus = totalIncome - totalExpenses;
  const savingsRate = totalIncome
    ? ((fmt(obligations?.sip) + fmt(obligations?.rd)) / totalIncome) * 100
    : 0;
  const emiLoad = totalIncome
    ? (fmt(obligations?.loanEmi) / totalIncome) * 100
    : 0;

  const pieData = Object.entries(totals)
    .map(([name, value]) => ({ name, value }))
    .filter((d) => d.value > 0);

  const insights = (() => {
    if (totalIncome <= 0) return [];
    const list = [];
    if (savingsRate < 15)
      list.push({
        type: "warning",
        title: "Low Savings Rate",
        detail: "Your savings rate is below 15%. Try to raise it gradually.",
      });
    if (emiLoad > 30)
      list.push({
        type: "danger",
        title: "High EMI Load",
        detail:
          "EMIs exceed 30% of income. Consider restructuring or prepaying debt.",
      });
    if (surplus < 0)
      list.push({
        type: "danger",
        title: "Monthly Deficit",
        detail: "You're spending more than you earn. Reduce variable expenses.",
      });
    if (totalExpenses > 0 && (totals.Lifestyle || 0) / totalExpenses > 0.3) {
      list.push({
        type: "info",
        title: "Lifestyle Spending",
        detail:
          "Lifestyle is over 30% of expenses. Review subscriptions & outings.",
      });
    }
    return list;
  })();

  const handlePrint = () => window.print();
  const renderPieLabel = ({ name, value }) => `${name} — ₹${inr.format(value)}`;

  /* -------- share -------- */
  const shareViaWhatsApp = () => {
    const msg = encodeURIComponent(
      `*${info.name}'s Personal Financial Checkup*\n` +
        `Total Income: ₹${totalIncome.toLocaleString()}\n` +
        `Total Expenses: ₹${totalExpenses.toLocaleString()}\n` +
        `Surplus: ₹${surplus.toLocaleString()}\n` +
        `Savings Rate: ${savingsRate.toFixed(1)}%\n` +
        `EMI Load: ${emiLoad.toFixed(1)}%\n` +
        `Check your financial health at paisavidhya.com`
    );
    if (!info.mobile) {
      toast.error("Enter mobile number to share on WhatsApp");
      return;
    }
    window.open(`https://wa.me/91${info.mobile}?text=${msg}`, "_blank");
  };

  return (
    <>
      <ModuleHeader
        title="PFC Report"
        subtitle={
          info?.name
            ? `Financial summary for ${info.name}`
            : "Financial summary"
        }
        breadcrumbs={[
          { label: "Home", to: "/" },
          { label: "PFC", to: "/pfc" },
          { label: "Report" }, // current page
        ]}
        actions={
          <>
            <Button variant="ghost" onClick={() => navigate("/pfc")}>
              Edit
            </Button>
            <Button onClick={() => setShowModal(true)}>
              Share via WhatsApp
            </Button>
            <Button onClick={handlePrint}>Print</Button>
            {/* <Button onClick={exportPDF}>Download PDF</Button>  <-- plug later */}
          </>
        }
      />

      <div
        className="pv-container"
        style={{ padding: "16px 8px", display: "grid", gap: 16 }}
      >
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
                {info?.city || "City"} {info?.gender ? `• ${info.gender}` : ""}
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
            <div className="pv-card" style={{ padding: 12, flex: "1 1 180px" }}>
              <div style={{ color: "var(--pv-dim)", fontSize: 12 }}>
                Savings Rate
              </div>
              <div style={{ fontWeight: 800, fontSize: 20 }}>
                {totalIncome ? `${savingsRate.toFixed(1)}%` : "-"}
              </div>
            </div>
            <div className="pv-card" style={{ padding: 12, flex: "1 1 180px" }}>
              <div style={{ color: "var(--pv-dim)", fontSize: 12 }}>
                EMI Load
              </div>
              <div style={{ fontWeight: 800, fontSize: 20 }}>
                {totalIncome ? `${emiLoad.toFixed(1)}%` : "-"}
              </div>
            </div>
            <div className="pv-card" style={{ padding: 12, flex: "1 1 180px" }}>
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
                      <span style={{ color: "var(--pv-dim)", fontWeight: 500 }}>
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
            Your summary will be sent to WhatsApp number +91 {info.mobile}.
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
