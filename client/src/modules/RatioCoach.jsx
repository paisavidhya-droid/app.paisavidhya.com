// src/components/RatioCoach.jsx
import { useEffect, useMemo, useRef } from "react";
import { Card, Badge, Alert } from "../components";
import {
  classifyAgeGroup,
  getTargetsForAgeGroup,
  isValidDOB,
} from "../utils/ratioRules";
import toast from "react-hot-toast";
import "./toast.css";

const pct = (num, denom) => (denom > 0 ? (num / denom) * 100 : 0);
const clamp = (x) => Math.max(0, Math.min(100, x));

function Bar({ label, actual, target }) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
        }}
      >
        <span style={{ color: "var(--pv-dim)" }}>{label}</span>
        <span>
          <strong>{actual.toFixed(1)}%</strong>
          <span style={{ color: "var(--pv-dim)" }}>
            {" "}
            • target {Number(target).toFixed(1)}%
          </span>
        </span>
      </div>
      <div style={{ height: 10, background: "#eef2f7", borderRadius: 999 }}>
        <div
          style={{
            width: `${clamp(actual)}%`,
            height: "100%",
            borderRadius: 999,
            background:
              actual <= target + 2 && actual >= target - 2
                ? "#1FC27E"
                : "#FF8C00",
            transition: "width .3s ease",
          }}
        />
      </div>
    </div>
  );
}

/**
 * Props:
 * - info: { dob }
 * - totals: { Housing, Food, Transport, Lifestyle, Health, Obligations, Leisure, Growth, Giving, _SavingsInvestments }
 * - totalIncome: number
 */
export default function RatioCoach({ info, totals, totalIncome }) {
  const hasDOB = useMemo(() => isValidDOB(info?.dob), [info?.dob]);
  const ageGroup = useMemo(() => classifyAgeGroup(info?.dob), [info?.dob]);
  const targets = useMemo(() => getTargetsForAgeGroup(ageGroup), [ageGroup]);

  // one-time toast when DOB missing (avoid spam)
  const warnedRef = useRef(false);
  useEffect(() => {
    if (!hasDOB && !warnedRef.current) {
      toast.custom(
        (t) => (
          <div
            role="status"
            aria-live="polite"
            className={`pv-toast ${
              t.visible ? "pv-toast-enter" : "pv-toast-leave"
            }`}
            onClick={() => toast.dismiss(t.id)}
          >
            <div className="pv-toast-icon">ℹ️</div>
            <div className="pv-toast-content">
              <div className="pv-toast-title">Add your Date of Birth</div>
              <div className="pv-toast-sub">
                You’ll get age-personalized targets. Using default for now.
              </div>
              <div className="pv-toast-progress" />
            </div>
            <button
              className="pv-toast-close"
              aria-label="Dismiss"
              onClick={(e) => {
                e.stopPropagation();
                toast.dismiss(t.id);
              }}
            >
              ✕
            </button>
          </div>
        ),
        {
          id: "dob-missing",
          duration: 6000,
          position: "top-right",
        }
      );
      warnedRef.current = true;
    }
  }, [hasDOB]);

  const essentialsAmt =
    (totals.Housing || 0) + (totals.Food || 0) + (totals.Transport || 0);
  const savingsInvestments = totals._SavingsInvestments || 0; // SIP + RD + NPS/PPF
  const emergencyHealthAmt = totals.Health || 0; // insurance + medical
  const entertainmentLuxAmt = (totals.Lifestyle || 0) + (totals.Leisure || 0);
  const learningAmt = totals.Growth || 0;
  const charityAmt = totals.Giving || 0;

  const buckets = [
    ["Essentials", pct(essentialsAmt, totalIncome), targets.essentials],
    [
      "Savings / Investments",
      pct(savingsInvestments, totalIncome),
      targets.savingsInvestments,
    ],
    [
      "Emergency / Health",
      pct(emergencyHealthAmt, totalIncome),
      targets.emergencyHealth,
    ],
    [
      "Entertainment & Luxuries",
      pct(entertainmentLuxAmt, totalIncome),
      targets.entertainmentLux,
    ],
    ["Learning & Self-Growth", pct(learningAmt, totalIncome), targets.learning],
    ["Charity / Giving", pct(charityAmt, totalIncome), targets.charity],
  ];

  const overSpend = buckets.find(
    ([label, actual, target]) =>
      label.includes("Entertainment") && actual > target + 2
  );
  const underSave = buckets.find(
    ([label, actual, target]) =>
      label.startsWith("Savings") && actual < target - 2
  );

  return (
    <Card
      title={`Age-Aware Coach — ${hasDOB ? ageGroup : "Default targets"} • ${
        targets.ruleLabel
      }`}
    >
      {!hasDOB && (
        <Alert type="info" title="Add DOB for better accuracy">
          Enter your <strong>Date of Birth</strong> to personalize targets for
          your life stage. We’re showing <em>default</em> 25–35 targets for now.
        </Alert>
      )}
      {/* If normalization happened, gently inform */}
      {targets._originalTotal &&
        Math.abs(targets._originalTotal - 100) > 0.01 && (
          <div
            style={{ color: "var(--pv-dim)", fontSize: 12, marginBottom: 6 }}
          >
            Targets normalized from {targets._originalTotal}% to 100% for a
            clean comparison.
          </div>
        )}

      <div className="pv-col" style={{ gap: 12 }}>
        <div style={{ color: "var(--pv-dim)", fontSize: 13 }}>
          {targets.keyFocus}
        </div>

        <div className="pv-col" style={{ gap: 12 }}>
          {buckets.map(([label, actual, target]) => (
            <Bar key={label} label={label} actual={actual} target={target} />
          ))}
        </div>

        <div
          className="pv-row"
          style={{ gap: 8, flexWrap: "wrap", marginTop: 6 }}
        >
          <Badge variant="ghost">
            Income Base ₹{(totalIncome || 0).toLocaleString()}
          </Badge>
          <Badge>{hasDOB ? ageGroup : "Default (25–35)"}</Badge>
        </div>

        {overSpend && (
          <Alert type="warning" title="Tip">
            Your <strong>Entertainment & Luxuries</strong> is above target. Trim
            subscriptions/weekend spends and redirect to{" "}
            <strong>savings</strong> or <strong>health cover</strong>.
          </Alert>
        )}
        {underSave && (
          <Alert type="warning" title="Boost Savings">
            Your <strong>Savings / Investments</strong> are below target.
            Increase SIP/RD/NPS by a small fixed amount.
          </Alert>
        )}
      </div>
    </Card>
  );
}
