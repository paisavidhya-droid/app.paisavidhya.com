// src/components/InsightsList.jsx
import AlertWithIcons from "./ui/AlertWithIcons";

export default function InsightsList({ items = [], onDismiss }) {
  if (!items?.length) {
    // default positive state
    return (
      <AlertWithIcons type="success" compact title="All good!">
        Finances look healthy. Keep monitoring monthly.
      </AlertWithIcons>
    );
  }

  return (
    <div className="pv-col" style={{ gap: 8 }}>
      {items.map((it, idx) => (
        <AlertWithIcons
          key={idx}
          type={it.type || "info"}
          title={it.title}
          compact
          closable={!!onDismiss}
          onClose={() => onDismiss?.(idx)}
        >
          {it.detail}
        </AlertWithIcons>
      ))}
    </div>
  );
}
