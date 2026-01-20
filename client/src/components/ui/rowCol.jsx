export function Row({ children, style }) {
  return (
    <div className="pv-row" style={{ gap: 16, flexWrap: "wrap", ...(style || {}) }}>
      {children}
    </div>
  );
}

export function Col({ children, style }) {
  return (
    <div className="pv-col" style={{ gap: 16, ...(style || {}) }}>
      {children}
    </div>
  );
}
