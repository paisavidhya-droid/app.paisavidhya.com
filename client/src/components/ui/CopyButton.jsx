import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaRegCopy, FaCheckCircle } from "react-icons/fa";
import Tooltip from "./Tooltip";

/**
 * CopyButton (reusable)
 *
 * Props:
 * - value: string (text to copy)
 * - label?: string (used in aria/title)
 * - successMessage?: string
 * - errorMessage?: string
 * - showToast?: boolean
 * - disabled?: boolean
 * - className?: string
 * - style?: object
 * - size?: number (icon size)
 * - stopPropagation?: boolean (default true, useful in tables/rows)
 * - copiedDurationMs?: number (default 1500)
 */
export default function CopyButton({
  value = "",
  label = "text",
  successMessage = "Copied!",
  errorMessage = "Failed to copy",
  showToast = true,
  disabled = false,
  className = "",
  style = {},
  size = 16,
  stopPropagation = true,
  copiedDurationMs = 1500,
}) {
  const [copied, setCopied] = useState(false);
  const text = String(value || "").trim();
  const isDisabled = disabled || !text;

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), copiedDurationMs);
    return () => clearTimeout(t);
  }, [copied, copiedDurationMs]);

  const doCopyFallback = (t) => {
    const ta = document.createElement("textarea");
    ta.value = t;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-9999px";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  };

  const handleCopy = async (e) => {
    if (stopPropagation) {
      e?.preventDefault?.();
      e?.stopPropagation?.();
    }

    if (isDisabled) return;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ok = doCopyFallback(text);
        if (!ok) throw new Error("fallback_failed");
      }

      setCopied(true);
      if (showToast) toast.success(successMessage);
    } catch (err) {
      if (showToast) toast.error(errorMessage);
    }
  };

  return (
    <Tooltip content={copied ? successMessage : `Copy ${label}`}>
      <button
        type="button"
        onClick={handleCopy}
        disabled={isDisabled}
        aria-label={`Copy ${label}`}
        title={copied ? successMessage : `Copy ${label}`}
        className={className}
        style={{
          marginLeft: 2,
          background: "transparent",
          border: "none",
          padding: 4,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: isDisabled ? "not-allowed" : "pointer",
          opacity: isDisabled ? 0.45 : 1,
          color: copied ? "var(--pv-success)" : "var(--pv-dim)",
          ...style,
        }}
      >
        {copied ? <FaCheckCircle size={size} /> : <FaRegCopy size={size} />}
      </button>
    </Tooltip>
  );
}
