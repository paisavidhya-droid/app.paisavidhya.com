import { useEffect, useMemo, useRef, useState } from "react";
import { FaChevronDown, FaTimes } from "react-icons/fa";

/**
 * SearchNSelect (single-field searchable select)
 *
 * options: [{ value, label, subLabel? }]
 * value: string
 * onChange: (value) => void
 */
export default function SearchNSelect({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select…",
  disabled = false,
  loading = false,
  clearable = true,
  clearLabel = "Clear",
  noResultsText = "No results",
  maxMenuHeight = 260,
  style,
}) {
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasFocus, setHasFocus] = useState(false);

  const selected = useMemo(() => {
    return options.find((o) => String(o.value) === String(value)) || null;
  }, [options, value]);

  // What to show inside the ONE input:
  // - if focused/open -> show query (user typing)
  // - otherwise -> show selected label (like a normal select)
  const inputText = open || hasFocus ? query : selected?.label || "";

  const filtered = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => {
      const hay = `${o.label || ""} ${o.subLabel || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [options, query]);

  // Close on outside click
  useEffect(() => {
    const onDown = (e) => {
      if (!open) return;
      if (wrapRef.current?.contains(e.target)) return;
      setOpen(false);
      setQuery("");
      setActiveIndex(0);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // Keep active option visible
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector(`[data-idx="${activeIndex}"]`);
    el?.scrollIntoView?.({ block: "nearest" });
  }, [activeIndex, open]);

  const pick = (val) => {
    onChange?.(val);
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
    // keep focus pleasant
    setTimeout(() => inputRef.current?.blur(), 0);
  };

  const clear = () => {
    onChange?.("");
    setQuery("");
    setActiveIndex(0);
    setOpen(false);
  };

  const openMenu = () => {
    if (disabled) return;
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const closeMenu = () => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  };

  const onKeyDown = (e) => {
    if (disabled) return;

    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      e.preventDefault();
      openMenu();
      return;
    }

    if (!open) return;

    if (e.key === "Escape") {
      e.preventDefault();
      closeMenu();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const item = filtered[activeIndex];
      if (item) pick(item.value);
      return;
    }
  };

  const showClear = clearable && !!value && !disabled;

  return (
    <div ref={wrapRef} className="pv-col" style={{ gap: 6 }}>
      {label ? (
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--pv-dim)" }}>
          {label}
        </div>
      ) : null}

      {/* ONE input (looks like select, doubles as search) */}
      <div style={{ position: "relative" }}>
        <input
          type="search"
          ref={inputRef}
          value={inputText}
          placeholder={selected ? "" : placeholder}
          disabled={disabled}
          onFocus={() => {
            setHasFocus(true);
            // when focusing, switch into "search mode"
            setQuery("");
            openMenu();
          }}
          onBlur={() => {
            setHasFocus(false);
            // Note: outside click handler will close it.
            // If user tabs away, close.
            setTimeout(() => {
              if (!wrapRef.current?.contains(document.activeElement))
                closeMenu();
            }, 0);
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onKeyDown={onKeyDown}
          style={{
            width: "100%",
            padding: "10px 38px 10px 12px",
            border: "1px solid var(--pv-border)",
            borderRadius: 10,
            background: disabled ? "rgba(0,0,0,0.03)" : "var(--pv-card, #fff)",
            outline: "none",
          }}
        />

        {/* Right side: clear + chevron */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            height: "100%",
            display: "flex",
            alignItems: "center",
            gap: 6,
            paddingRight: 10,
          }}
        >
          {loading ? (
            <span className="pv-dim" style={{ fontSize: 12 }}>
              …
            </span>
          ) : showClear ? (
            <button
              type="button"
              title={clearLabel}
              onMouseDown={(e) => e.preventDefault()}
              onClick={clear}
              style={{
                border: "none",
                background: "white",
                cursor: "pointer",
                fontSize: 16,
                lineHeight: 1,
                padding: 4,
                color: "var(--pv-dim)",
              }}
              aria-label="Clear selection"
            >
              <FaTimes />
            </button>
          ) : null}

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => (open ? closeMenu() : openMenu())}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: 4,
              color: "var(--pv-dim)",
              fontSize: 14,
            }}
            aria-label="Toggle dropdown"
          >
            <FaChevronDown />
            {/* ▾ */}
          </button>
        </div>

        {/* Dropdown */}
        {open && (
          <div
            style={{
              width: "100%",
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              right: 0,
              zIndex: 9999,
              border: "1px solid var(--pv-border)",
              borderRadius: 10,
              background: "var(--pv-card, #fff)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
              overflow: "hidden",
              ...style,
            }}
          >
            <div
              ref={listRef}
              role="listbox"
              style={{
                maxHeight: maxMenuHeight,
                overflowY: "auto",
                padding: 6,
              }}
            >
              {loading ? (
                <div className="pv-dim" style={{ padding: 10 }}>
                  Loading…
                </div>
              ) : filtered.length === 0 ? (
                <div className="pv-dim" style={{ padding: 10 }}>
                  {noResultsText}
                </div>
              ) : (
                filtered.map((o, idx) => {
                  const active = idx === activeIndex;
                  const selectedNow = String(o.value) === String(value);
                  return (
                    <div
                      key={o.value}
                      data-idx={idx}
                      role="option"
                      aria-selected={selectedNow}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => pick(o.value)}
                      style={{
                        padding: "10px 10px",
                        borderRadius: 10,
                        cursor: "pointer",
                        background: active ? "rgba(0,0,0,0.06)" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, lineHeight: 1.2 }}>
                          {o.label}
                        </div>
                        {o.subLabel ? (
                          <div className="pv-dim" style={{ fontSize: 12 }}>
                            {o.subLabel}
                          </div>
                        ) : null}
                      </div>

                      {selectedNow ? (
                        <div aria-hidden style={{ fontWeight: 900 }}>
                          ✓
                        </div>
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
