// src/components/ui/Placeholder.jsx
export default function Placeholder({ label }) {
  return (
    <div className="pv-container" style={{ textAlign: "center", padding: "60px 16px" }}>
      <h2>{label}</h2>
      <p style={{ color: "var(--pv-dim)" }}>We’re building something great here…</p>
    </div>
  );
}
