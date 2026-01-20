import { Link } from "react-router-dom";

export default function StatCard({
  label,
  value,
  hint,
  intent,
  className,
  to,
  onClick,
}) {
  const intentColor =
    intent === "danger"
      ? "#D14343"
      : intent === "warn"
        ? "#A37F00"
        : intent === "ok"
          ? "#0E7C66"
          : "var(--pv-fg)";

  const clickable = !!to || !!onClick;

  const body = (
    <div
      className={className ?? "pv-card"}
      style={{
        padding: 14,
        flex: "1 1 200px",
        minWidth: 200,
        cursor: clickable ? "pointer" : "default",
        textDecoration: "none",
      }}
      onClick={onClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick?.();
            }
          : undefined
      }
    >
      <div style={{ fontSize: 12, color: "var(--pv-dim)" }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: intentColor }}>
        {value}
      </div>
      {hint && (
        <div style={{ fontSize: 12, color: "var(--pv-dim)" }}>{hint}</div>
      )}
    </div>
  );
  if (to) {
    return (
      <Link
        to={to}
        style={{
          textDecoration: "none",
          color: "inherit",
          flex: "1 1 200px",
          minWidth: 200,
        }}
      >
        {body}
      </Link>
    );
  }

  return body;
}
