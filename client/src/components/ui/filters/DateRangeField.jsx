import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import "./DateRangeField.css";

/* ─── tiny helpers ─────────────────────────────────────────────────── */
function ymd(date) {
  if (!date) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function parseYmd(v) {
  if (!v) return null;
  const [y, m, d] = String(v).split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function sod(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function isSameDay(a, b) {
  return a && b && ymd(a) === ymd(b);
}

/* ─── calendar engine ──────────────────────────────────────────────── */
function calendarDays(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startOffset = (first.getDay() + 6) % 7; // Mon-first
  const days = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d));
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];
const DAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

/* ─── presets ──────────────────────────────────────────────────────── */
const PRESETS = [
  { id: "today",     label: "Today",        getDates: () => { const t = sod(new Date()); return { from: t, to: t }; } },
  { id: "yesterday", label: "Yesterday",    getDates: () => { const t = sod(addDays(new Date(), -1)); return { from: t, to: t }; } },
  { id: "last7",     label: "Last 7 days",  getDates: () => { const t = sod(new Date()); return { from: addDays(t, -6), to: t }; } },
  { id: "last30",    label: "Last 30 days", getDates: () => { const t = sod(new Date()); return { from: addDays(t, -29), to: t }; } },
  { id: "thisMonth", label: "This month",   getDates: () => { const t = sod(new Date()); return { from: new Date(t.getFullYear(), t.getMonth(), 1), to: t }; } },
  { id: "lastMonth", label: "Last month",   getDates: () => { const t = new Date(); return { from: new Date(t.getFullYear(), t.getMonth() - 1, 1), to: new Date(t.getFullYear(), t.getMonth(), 0) }; } },
];

function detectPreset(from, to) {
  if (!from || !to) return null;
  for (const p of PRESETS) {
    const r = p.getDates();
    if (isSameDay(r.from, from) && isSameDay(r.to, to)) return p.id;
  }
  return null;
}

function formatDisplay(from, to) {
  if (!from) return null;
  const fmt = (d) => d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  if (!to || isSameDay(from, to)) return fmt(from);
  return `${fmt(from)} – ${fmt(to)}`;
}

/* ─── component ────────────────────────────────────────────────────── */
export default function DateRangeField({
  // label = "Date",
  label = "",
  from,
  to,
  onChange,
  placeholder = "Select date or range",
  presets: presetIds = ["today", "yesterday", "last7", "last30", "thisMonth", "lastMonth"],
  singleOnly = false,
}) {
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);

  const parsedFrom = useMemo(() => parseYmd(from), [from]);
  const parsedTo   = useMemo(() => parseYmd(to),   [to]);

  const [draft, setDraft] = useState({ from: parsedFrom, to: parsedTo });
  const [hovered, setHovered] = useState(null);
  const [picking, setPicking] = useState(null);

  const today = sod(new Date());
  const [viewYear,  setViewYear]  = useState((parsedFrom || today).getFullYear());
  const [viewMonth, setViewMonth] = useState((parsedFrom || today).getMonth());

  useEffect(() => {
    if (open) {
      const f = parseYmd(from);
      const t = parseYmd(to);
      setDraft({ from: f, to: t });
      setPicking(null);
      if (f) { setViewYear(f.getFullYear()); setViewMonth(f.getMonth()); }
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (!rootRef.current?.contains(e.target)) setOpen(false); };
    const onEsc  = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onEsc);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onEsc); };
  }, [open]);

  const commit = useCallback((f, t) => {
    const nf = f ? ymd(f) : "";
    const nt = t ? ymd(t) : (singleOnly ? nf : nf);
    onChange?.({ from: nf, to: nt });
  }, [onChange, singleOnly]);

  const handleDayClick = (day) => {
    if (!day) return;
    const d = sod(day);

    if (singleOnly) {
      setDraft({ from: d, to: d });
      commit(d, d);
      setOpen(false);
      return;
    }

    if (!draft.from || (draft.from && draft.to) || picking === "from") {
      setDraft({ from: d, to: null });
      setPicking("to");
    } else {
      let f = draft.from;
      let t = d;
      if (t < f) { [f, t] = [t, f]; }
      setDraft({ from: f, to: t });
      setPicking(null);
      commit(f, t);
    }
  };

  const handlePreset = (preset) => {
    const r = preset.getDates();
    setDraft(r);
    setPicking(null);
    commit(r.from, r.to);
    setOpen(false);
  };

  const handleClear = () => {
    setDraft({ from: null, to: null });
    setPicking(null);
    onChange?.({ from: "", to: "" });
  };

  const handleApply = () => {
    if (draft.from) commit(draft.from, draft.to || draft.from);
    setOpen(false);
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const days = calendarDays(viewYear, viewMonth);

  const rangeFrom = draft.from;
  const rangeTo   = picking === "to" && hovered ? (hovered < draft.from ? draft.from : hovered) : draft.to;
  const rangePreviewFrom = picking === "to" && hovered && hovered < draft.from ? hovered : rangeFrom;

  function dayState(day) {
    if (!day) return {};
    const d = sod(day);
    const isToday    = isSameDay(d, today);
    const isStart    = isSameDay(d, rangeFrom);
    const isEnd      = rangeTo ? isSameDay(d, rangeTo) : false;
    const isSelected = isStart || isEnd;

    let inRange = false;
    if (rangePreviewFrom && rangeTo && !isSameDay(rangePreviewFrom, rangeTo)) {
      inRange = d > rangePreviewFrom && d < rangeTo;
    }

    return { isToday, isStart, isEnd, isSelected, inRange };
  }

  const displayText  = formatDisplay(parsedFrom, parsedTo);
  const activePreset = detectPreset(parsedFrom, parsedTo);
  const activePresets = presetIds.map(id => PRESETS.find(p => p.id === id)).filter(Boolean);

  return (
    <div ref={rootRef} style={{ position: "relative", minWidth: 260 }}>
      {label && <div className="drf-label">{label}</div>}

      <button
        type="button"
        className={`drf-trigger ${open ? "drf-trigger--open" : ""} ${displayText ? "drf-trigger--filled" : ""}`}
        onClick={() => setOpen(v => !v)}
      >
        <span className="drf-trigger-icon"><CalIcon /></span>
        <span className={`drf-trigger-text ${!displayText ? "drf-trigger-text--placeholder" : ""}`}>
          {displayText || placeholder}
        </span>
        <span className={`drf-chevron ${open ? "drf-chevron--up" : ""}`}><ChevronIcon /></span>
      </button>

      {displayText && (
        <button
          type="button"
          className="drf-clear-x"
          onClick={(e) => { e.stopPropagation(); handleClear(); }}
          title="Clear"
        >×</button>
      )}

      {open && (
        <div className="drf-panel">
          {activePresets.length > 0 && (
            <div className="drf-presets">
              {activePresets.map(p => (
                <button
                  key={p.id}
                  type="button"
                  className={`drf-preset ${activePreset === p.id ? "drf-preset--active" : ""}`}
                  onClick={() => handlePreset(p)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}

          <div className="drf-cal">
            <div className="drf-cal-header">
              <button type="button" className="drf-nav" onClick={prevMonth}><ChevLeftIcon /></button>
              <span className="drf-cal-title">{MONTH_NAMES[viewMonth]} {viewYear}</span>
              <button type="button" className="drf-nav" onClick={nextMonth}><ChevRightIcon /></button>
            </div>

            <div className="drf-grid">
              {DAY_LABELS.map(d => (
                <div key={d} className="drf-day-label">{d}</div>
              ))}
              {days.map((day, i) => {
                if (!day) return <div key={`e${i}`} />;
                const { isToday, isStart, isEnd, isSelected, inRange } = dayState(day);
                const cn = [
                  "drf-day",
                  isSelected ? "drf-day--selected" : "",
                  isStart    ? "drf-day--start"    : "",
                  isEnd      ? "drf-day--end"       : "",
                  inRange    ? "drf-day--range"     : "",
                  isToday && !isSelected ? "drf-day--today" : "",
                ].filter(Boolean).join(" ");

                return (
                  <button
                    key={ymd(day)}
                    type="button"
                    className={cn}
                    onClick={() => handleDayClick(day)}
                    onMouseEnter={() => setHovered(sod(day))}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <span className="drf-day-inner">{day.getDate()}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="drf-footer">
            <div className="drf-selected-display">
              {draft.from ? (
                <>
                  <span className="drf-pill">
                    {draft.from.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                  </span>
                  {!singleOnly && draft.to && !isSameDay(draft.from, draft.to) && (
                    <>
                      <span className="drf-arrow">→</span>
                      <span className="drf-pill">
                        {draft.to.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                      </span>
                    </>
                  )}
                  {picking === "to" && <span className="drf-hint">Pick end date</span>}
                </>
              ) : (
                <span className="drf-hint">{singleOnly ? "Pick a date" : "Pick start date"}</span>
              )}
            </div>
            <div className="drf-footer-actions">
              <button type="button" className="drf-btn-clear" onClick={handleClear}>Clear</button>
              <button type="button" className="drf-btn-apply" onClick={handleApply}>Apply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── icons ────────────────────────────────────────────────────────── */
const CalIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <rect x="1" y="3" width="14" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M1 7h14" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M5 1v3M11 1v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <circle cx="5.5" cy="10.5" r="1" fill="currentColor"/>
    <circle cx="8.5" cy="10.5" r="1" fill="currentColor"/>
    <circle cx="11.5" cy="10.5" r="1" fill="currentColor"/>
  </svg>
);

const ChevronIcon = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
    <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevLeftIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
