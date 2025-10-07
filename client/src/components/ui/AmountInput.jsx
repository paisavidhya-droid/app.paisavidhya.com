import React from "react";
import "../../styles/ui.css";

export default function AmountInput({
  label,
  value,
  onChange,
  placeholder = "0",
  min = 0,
  disabled = false,
  ...rest
}) {
  // Handle number formatting without leading zeros
  const handleChange = (e) => {
    const val = e.target.value;
    if (val === "") return onChange(0);
    const num = Number(val.replace(/^0+(?=\d)/, "")); // strip leading zeros
    if (!isNaN(num)) onChange(num);
  };

  return (
    <div className="pv-col" style={{ gap: 4 }}>
      {label && (
        <label style={{ fontSize: 13, color: "var(--pv-dim)" }}>{label}</label>
      )}
      <div
        className="pv-row"
        style={{
          alignItems: "baseline",
          border: "1px solid var(--pv-border)",
          borderRadius: 8,
          background: "var(--pv-surface)",
          padding: "6px 10px",
          gap: 6,
        }}
      >
        <span style={{ color: "var(--pv-dim)", fontWeight: 500 }}>₹</span>
        <input
          type="number"
          min={min}
          disabled={disabled}
          value={value === 0 ? "" : value}
          onChange={handleChange}
          placeholder={placeholder}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            color: "var(--pv-text)",
            fontSize: 15,
          }}
          {...rest}
        />
      </div>
    </div>
  );
}
