// client\src\components\ui\FloatField.jsx
import './FloatField.css';
import { useId, useMemo, useState } from "react";

/**
 * FloatField – modern floating-label input
 *
 * Props:
 *  - label        string
 *  - type         "text" | "email" | "password" | etc.
 *  - value        string
 *  - onChange     (e) => void
 *  - hint         string
 *  - error        string
 *  - leftIcon     ReactNode
 *  - rightIcon    ReactNode (ignored when type=password and showToggle is true)
 *  - showToggle   boolean (password visibility toggle)
 *  - disabled     boolean
 *  - required     boolean
 *  - name, id, autoComplete, inputMode, maxLength, etc. are forwarded
 *  - size         "sm" | "md" | "lg"
 *  - variant      "default" | "ghost"
 */
export default function FloatField({
  label = "Label",
  type = "text",
  value,
  onChange,
  hint,
  error,
  leftIcon,
  rightIcon,
  showToggle = false,
  disabled = false,
  required = false,
  size = "md",
  variant = "default",
  id,
  name,
  autoComplete,
  inputMode,
  maxLength,
  ...rest
}) {
  const reactId = useId();
  const inputId = id || `ff-${reactId}`;
  const [show, setShow] = useState(false);

  const isPassword = type === "password";
  const actualType = isPassword && showToggle ? (show ? "text" : "password") : type;

  const cls = useMemo(() => {
    const classes = ["pv-float", `size-${size}`, variant];
    if (error) classes.push("is-error");
    if (disabled) classes.push("is-disabled");
    return classes.join(" ");
  }, [size, variant, error, disabled]);

  // Use a single-space placeholder to enable :placeholder-shown CSS trick
  return (
    <div className={cls} data-has-value={value ? "1" : "0"}>
      {leftIcon && <span className="pv-float-icon left">{leftIcon}</span>}

      <div className="pv-float-field">
        <input
          id={inputId}
          name={name}
          type={actualType}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          inputMode={inputMode}
          maxLength={maxLength}
          className="pv-float-input"
          placeholder=" "             // ← important for :placeholder-shown
          aria-invalid={!!error}
          {...rest}
        />
        <label htmlFor={inputId} className="pv-float-label">
          {label}{required ? " *" : ""}
        </label>

        {/* Right adornment */}
        {isPassword && showToggle ? (
          <button
            type="button"
            className="pv-float-icon right pv-float-eye"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {show ? "🙈" : "👁️"}
          </button>
        ) : (
          rightIcon && <span className="pv-float-icon right">{rightIcon}</span>
        )}
      </div>

      {/* Helper lines */}
      {!error && hint && (
        <small className="pv-float-hint" aria-live="polite">{hint}</small>
      )}
      {error && (
        <small className="pv-float-error" role="alert">{error}</small>
      )}
    </div>
  );
}
