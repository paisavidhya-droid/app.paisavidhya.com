import { Card } from "../../../components";


export default function DashboardSection({ title, subtitle, right, children }) {
  return (
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
        <div className="pv-col" style={{ gap: 2 }}>
          <div style={{ fontWeight: 800 }}>{title}</div>
          {subtitle && <div style={{ color: "var(--pv-dim)", fontSize: 12 }}>{subtitle}</div>}
        </div>
        {right}
      </div>

      <div style={{ height: 12 }} />
      {children}
    </Card>
  );
}
