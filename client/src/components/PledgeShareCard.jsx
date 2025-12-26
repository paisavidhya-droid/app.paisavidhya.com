// client/src/components/PledgeShareCard.jsx

import {forwardRef } from "react";




const PledgeShareCard = forwardRef(({ user, certId }, ref) => {
  const name = user?.name || "I";
  const firstName = name.split(" ")[0] || name;

  return (
    <div
      ref={ref}
      style={{
        width: 1080,
        height: 1080,
        boxSizing: "border-box",
        padding: 72,
        borderRadius: 40,
        background:
          "radial-gradient(circle at top left, #4f46e5 0, #020617 55%), radial-gradient(circle at bottom right,#22c55e 0,#020617 55%)",
        color: "#f9fafb",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        fontFamily:
          "Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
      }}
    >
      {/* Top brand row */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.9 }}>
          PAISAVIDHYA
          <div style={{ fontSize: 13, fontWeight: 400, opacity: 0.8, marginTop: 6 }}>
            Financial Discipline & Safety Pledge
          </div>
        </div>
        <div
          style={{
            padding: "8px 14px",
            borderRadius: 999,
            border: "1px solid rgba(191,219,254,0.7)",
            background: "rgba(15,23,42,0.7)",
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: 999,
              background: "radial-gradient(circle,#bbf7d0,#22c55e)",
              boxShadow: "0 0 12px rgba(34,197,94,0.9)",
            }}
          />
          Official certificate snapshot
        </div>
      </div>

      {/* Middle content */}
      <div>
        <div style={{ fontSize: 18, color: "#e5e7eb", marginBottom: 8 }}>
          This is to certify that
        </div>
        <div
          style={{
            fontSize: 42,
            fontWeight: 800,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          {name}
        </div>

        <div
          style={{
            marginTop: 24,
            fontSize: 18,
            lineHeight: 1.6,
            maxWidth: 780,
          }}
        >
          has taken the{" "}
          <span style={{ fontWeight: 700 }}>
            Financial Discipline & Safety Pledge
          </span>{" "}
          to stay away from loan traps, scams, and risky money schemes — and to
          follow safer financial habits.
        </div>

        <div
          style={{
            marginTop: 24,
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            fontSize: 13,
          }}
        >
          <span
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              border: "1px solid rgba(148,163,184,0.7)",
              background: "rgba(15,23,42,0.8)",
            }}
          >
            ✅ Spot scam patterns & red flags
          </span>
          <span
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              border: "1px solid rgba(148,163,184,0.7)",
              background: "rgba(15,23,42,0.8)",
            }}
          >
            ✅ Borrow responsibly & avoid debt traps
          </span>
          <span
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              border: "1px solid rgba(148,163,184,0.7)",
              background: "rgba(15,23,42,0.8)",
            }}
          >
            ✅ Protect digital money & accounts
          </span>
        </div>
      </div>

      {/* Bottom row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 24,
          fontSize: 14,
        }}
      >
        <div style={{ maxWidth: 420 }}>
          <div style={{ opacity: 0.9 }}>
            “{firstName} has promised to pause, verify and choose the safer
            money option — especially when something feels too good to be true.”
          </div>
          {certId && (
            <div
              style={{
                marginTop: 10,
                fontSize: 13,
                fontFamily: "monospace",
                opacity: 0.9,
              }}
            >
              Certificate ID: <b>{certId}</b>
            </div>
          )}
        </div>

        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            Financial Safety Pledge
          </div>
          <div style={{ fontSize: 13, marginTop: 4, opacity: 0.9 }}>
            Take yours at paisavidhya.com
          </div>
        </div>
      </div>
    </div>
  );
});

export default PledgeShareCard;