export default function Timeline({ items }) {
  if (!items?.length) return <div style={{ color: "var(--pv-dim)" }}>No recent activity.</div>;

  return (
    <div className="pv-col" style={{ gap: 12 }}>
      {items.map((ev, i) => (
        <div key={i} className="pv-row" style={{ gap: 10, alignItems: "flex-start" }}>
          <div style={{ width: 6, height: 6, borderRadius: 6, background: "currentColor", marginTop: 7 }} />
          <div className="pv-col" style={{ gap: 2 }}>
            <div style={{ fontWeight: 600 }}>{ev.title}</div>
            <div style={{ color: "var(--pv-dim)", fontSize: 12 }}>
              {ev.time} · {ev.actor}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
