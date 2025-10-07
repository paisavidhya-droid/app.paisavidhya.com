// src/components/Alert.jsx
export default function AlertWithIcons({
  type = "info",
  title,
  children,
  compact = false,
  closable = false,
  onClose,
  style,
}) {
  const colors = {
    info: "#0ea5e9",
    success: "var(--pv-success)",
    warning: "var(--pv-warning)",
    danger: "var(--pv-danger)",
    error: "var(--pv-danger)",
  };

  const icons = {
    info: "ℹ️",
    success: "✅",
    warning: "⚠️",
    danger: "🚨",
    error: "⛔",
  };

  return (
    <div
      className="pv-card"
      style={{
        padding: compact ? 8 : 12,
        borderLeft: `4px solid ${colors[type]}`,
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        alignItems: "start",
        gap: 8,
        ...style,
      }}
    >
      <div aria-hidden style={{ lineHeight: 1.2 }}>{icons[type] || "ℹ️"}</div>

      <div>
        {title && (
          <div style={{ fontWeight: 700, marginBottom: compact ? 2 : 6 }}>
            {title}
          </div>
        )}
        {children && (
          <div style={{ color: "var(--pv-dim)" }}>{children}</div>
        )}
      </div>

      {closable && (
        <button
          onClick={onClose}
          aria-label="Dismiss"
          className="pv-btn ghost"
          style={{ padding: "2px 8px" }}
        >
          ✖
        </button>
      )}
    </div>
  );
}
