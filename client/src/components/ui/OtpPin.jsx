import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import Alert from "./Alert";

/**
 * OtpPin
 * Props:
 *  - length?: number (default 6)
 *  - value?: string (controlled). Otherwise internal state.
 *  - onChange?: (val: string) => void
 *  - onComplete?: (val: string) => void
 *  - autoFocus?: boolean
 *  - disabled?: boolean
 *  - error?: boolean | string            // when string, shown in an Alert
 *  - success?: boolean                   // when true, shows a success Alert (generic message)
 *  - mask?: boolean                      // shows • instead of digits
 *  - name?: string   // useful if you wrap in a form
 *  - size?: "sm" | "md" | "lg" (visual only)
 */
const OtpPin = forwardRef(function OtpPin(
  {
    length = 6,
    value,
    onChange,
    onComplete,
    autoFocus = false,
    disabled = false,
    error = false,
    success = false,
    mask = false,
    name,
    size = "md",
    ariaLabel = "One-time code",
  },
  ref
) {
  const inputsRef = useRef([]);
  const isControlled = typeof value === "string";
  const [internal, setInternal] = useState(() => Array(length).fill(""));
  const valArray = useMemo(
    () =>
      isControlled
        ? (value || "").slice(0, length).padEnd(length, " ").split("")
        : internal,
    [isControlled, value, internal, length]
  );

  // expose focus() to parent
  useImperativeHandle(ref, () => ({
    focus: (index = 0) => {
      inputsRef.current[index]?.focus();
      inputsRef.current[index]?.select?.();
    },
    clear: () => {
      if (isControlled) onChange?.("");
      else setInternal(Array(length).fill(""));
      inputsRef.current[0]?.focus();
    },
  }));

  // initial focus
  useEffect(() => {
    if (autoFocus && !disabled) {
      const t = setTimeout(() => inputsRef.current[0]?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [autoFocus, disabled]);

  const commit = (nextArr) => {
    const next = nextArr.join("");
    if (!isControlled) setInternal(nextArr);
    onChange?.(next);
    if (next.replace(/\s/g, "").length === length) {
      onComplete?.(next);
    }
  };

  const handleChange = (i, ch) => {
    if (disabled) return;
    const onlyDigits = ch.replace(/\D/g, "");
    if (!onlyDigits) return;

    const next = [...valArray];
    next[i] = onlyDigits[0];

    // If user typed more than one char (e.g., Android autofill), spread across cells
    if (onlyDigits.length > 1) {
      for (let k = 1; k < onlyDigits.length && i + k < length; k++) {
        next[i + k] = onlyDigits[k];
      }
      const last = Math.min(i + onlyDigits.length - 1, length - 1);
      commit(next);
      inputsRef.current[last]?.focus();
      inputsRef.current[last]?.select?.();
      return;
    }

    commit(next);
    // jump to next empty cell
    const nextIndex = Math.min(i + 1, length - 1);
    inputsRef.current[nextIndex]?.focus();
    inputsRef.current[nextIndex]?.select?.();
  };

  const handleKeyDown = (i, e) => {
    if (disabled) return;
    const key = e.key;

    if (key === "Backspace") {
      e.preventDefault();
      const next = [...valArray];
      if (next[i]) {
        next[i] = "";
        commit(next);
      } else {
        const prev = Math.max(i - 1, 0);
        next[prev] = "";
        commit(next);
        inputsRef.current[prev]?.focus();
      }
      return;
    }
    if (key === "ArrowLeft") {
      e.preventDefault();
      inputsRef.current[Math.max(i - 1, 0)]?.focus();
      return;
    }
    if (key === "ArrowRight") {
      e.preventDefault();
      inputsRef.current[Math.min(i + 1, length - 1)]?.focus();
      return;
    }
    if (key === " " || key === "Spacebar") {
      e.preventDefault();
      return;
    }
  };

  const handlePaste = (i, e) => {
    if (disabled) return;
    e.preventDefault();
    const pasted = (e.clipboardData.getData("text") || "").replace(/\D/g, "");
    if (!pasted) return;

    const next = [...valArray];
    for (let k = 0; k < pasted.length && i + k < length; k++) {
      next[i + k] = pasted[k];
    }
    commit(next);

    const last = Math.min(i + pasted.length - 1, length - 1);
    inputsRef.current[last]?.focus();
    inputsRef.current[last]?.select?.();
  };

  const status = error ? "error" : success ? "success" : undefined;
  // Use the alert element as the described-by target when an error message string is present
  const hasErrorText = typeof error === "string" && error.trim().length > 0;
  const describedById = hasErrorText ? "pv-pin-alert" : undefined;

  return (
    <div
      className={`pv-pin ${status ? `is-${status}` : ""} size-${size} ${
        disabled ? "is-disabled" : ""
      }`}
      role="group"
      aria-label={ariaLabel}
      aria-describedby={describedById}
    >
      {Array.from({ length }).map((_, i) => {
        const val = valArray[i] || "";
        const display = mask && val ? "•" : val;
        const filled = val !== "";
        return (
          <input
            key={i}
            ref={(el) => (inputsRef.current[i] = el)}
            className={`pv-pin-cell ${filled ? "filled" : ""}`}
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="one-time-code"
            type="text"
            name={name ? `${name}-${i}` : undefined}
            value={display}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={(e) => handlePaste(i, e)}
            onFocus={(e) => e.target.select()}
            disabled={disabled}
            aria-invalid={!!error}
            aria-label={`Digit ${i + 1}`}
          />
        );
      })}
      {hasErrorText && (
        <div id="pv-pin-alert" style={{ marginTop: 6 }}>
          <Alert type="danger" title="Error">
            {error}
          </Alert>
        </div>
      )}

      {success && !error && (
        <div style={{ marginTop: 6 }}>
          <Alert type="success" title="Success">
           {typeof success === "string" ? success : "All set."}
          </Alert>
        </div>
      )}
    </div>
  );
});

export default OtpPin;
