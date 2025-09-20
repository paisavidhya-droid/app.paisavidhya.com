import { useRef, useState } from "react";

export default function Tooltip({ content, children }) {
  const [show, setShow] = useState(false);
  const ref = useRef(null);
  return (
    <span
      ref={ref}
      style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <span
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--pv-dim)", 
            color: "var(--pv-primary-ink)",
            border: "1px solid var(--pv-border)",
            padding: "6px 8px",
            borderRadius: 8,
            fontSize: 12,
            whiteSpace: "nowrap",
            zIndex: 80,
          }}
        >
          {content}
        </span>
      )}
    </span>
  );
}
