// client/src/components/PledgeShareCard.jsx
export default function PledgeShareCard({ name, certId, issuedAt, verifyUrl }) {
  return (
    <div
      id="share-certificate-card"
      style={{
        width: 420,
        padding: 22,
        borderRadius: 20,
        position: "relative",
        overflow: "hidden",
        color: "#fff",
        fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        background:
          "radial-gradient(1200px 500px at -10% -20%, rgba(255,255,255,0.22), transparent 45%)," +
          "radial-gradient(900px 400px at 110% 0%, rgba(34,197,94,0.18), transparent 55%)," +
          "linear-gradient(135deg, #0f766e 0%, #064e3b 55%, #022c22 100%)",
        boxShadow: "0 18px 45px rgba(0,0,0,0.35)",
        border: "1px solid rgba(255,255,255,0.16)",
      }}
    >
      {/* Watermark */}
      <div
        style={{
          position: "absolute",
          inset: -40,
          background:
            "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.10), transparent 45%)," +
            "radial-gradient(circle at 70% 60%, rgba(255,255,255,0.08), transparent 50%)",
          transform: "rotate(-8deg)",
          pointerEvents: "none",
        }}
      />

      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: 0.8, opacity: 0.92 }}>
            PAISAVIDHYA • Financial Safety
          </div>
          <div style={{ marginTop: 6, fontSize: 22, fontWeight: 800, lineHeight: 1.1 }}>
            Financial Safety Pledge
          </div>
        </div>

        {/* Seal */}
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            background: "rgba(255,255,255,0.14)",
            border: "1px solid rgba(255,255,255,0.18)",
            display: "grid",
            placeItems: "center",
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            flex: "0 0 auto",
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 999,
              background: "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.35))",
              display: "grid",
              placeItems: "center",
              color: "#064e3b",
              fontWeight: 900,
              fontSize: 14,
            }}
          >
            ✓
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ marginTop: 18 }}>
        <div style={{ fontSize: 13, opacity: 0.9 }}>This certifies that</div>

        <div
          style={{
            marginTop: 8,
            fontSize: 26,
            fontWeight: 900,
            letterSpacing: 0.2,
            lineHeight: 1.15,
            wordBreak: "break-word",
            textShadow: "0 8px 24px rgba(0,0,0,0.25)",
          }}
        >
          {name}
        </div>

        <div style={{ marginTop: 10, fontSize: 13, opacity: 0.9, lineHeight: 1.35 }}>
          has committed to disciplined and safe financial behavior and will actively avoid scams, loan traps, and risky schemes.
        </div>
      </div>

      {/* Footer details */}
      <div
        style={{
          marginTop: 18,
          paddingTop: 14,
          borderTop: "1px solid rgba(255,255,255,0.22)",
          display: "flex",
          justifyContent: "space-between",
          gap: 14,
          alignItems: "flex-end",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 11, opacity: 0.75 }}>Certificate ID</div>
          <div
            style={{
              marginTop: 4,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              fontWeight: 800,
              fontSize: 12,
              letterSpacing: 0.2,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: 210,
              background: "rgba(0,0,0,0.18)",
              padding: "6px 8px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.12)",
            }}
            title={certId}
          >
            {certId || "—"}
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, opacity: 0.75 }}>Issued on</div>
          <div style={{ marginTop: 4, fontSize: 12, fontWeight: 800 }}>
            {issuedAt || "—"}
          </div>
        </div>
      </div>

      {/* Verify strip */}
      <div
        style={{
          marginTop: 14,
          borderRadius: 14,
          padding: "10px 12px",
          background: "rgba(255,255,255,0.10)",
          border: "1px solid rgba(255,255,255,0.14)",
          fontSize: 12,
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
          alignItems: "center",
        }}
      >
        <div style={{ opacity: 0.9 }}>Verify at</div>
        <div
          style={{
            fontWeight: 800,
            opacity: 0.95,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: 270,
          }}
        >
          {verifyUrl ? verifyUrl.replace(/^https?:\/\//, "") : "paisavidhya.com"}
        </div>
      </div>
    </div>
  );
}
