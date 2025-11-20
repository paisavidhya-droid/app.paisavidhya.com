import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function PasswordInput({ label="Password", hint, error, ...props }) {
  const [show, setShow] = useState(false);

  return (
    <div className="pv-col" style={{ position: "relative" }}>
      {label && <label className="pv-label">{label}</label>}
      
      <div style={{ position: "relative" }}>
        <input
          className="pv-input"
          type={show ? "text" : "password"}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          style={{
            position: "absolute",
            top: "50%",
            right: "10px",
            transform: "translateY(-50%)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 0,
            color: "var(--pv-dim)",
          }}
        >
          {show ? <FaEyeSlash size={16}  /> : <FaEye size={16}  />}
          {/* {show ? "🙈" : "👁️"} */}
        </button>
      </div>

      {hint && !error && <small style={{ color: "var(--pv-dim)" }}>{hint}</small>}
      {error && <small style={{ color: "var(--pv-danger)" }}>{error}</small>}
    </div>
  );
}
