import { useEffect, useId, useRef, useState } from "react";

export function Tabs({ tabs = [], defaultIndex = 0, selectedIndex, onChange }) {
  // const [active, setActive] = useState(defaultIndex);
  const listRef = useRef(null);
  const baseId = useId();

  // uncontrolled state
  const [internalActive, setInternalActive] = useState(defaultIndex);

  // if selectedIndex is provided, we're controlled
  const isControlled = selectedIndex != null;
  const active = isControlled ? selectedIndex : internalActive;
  const setActive = (i) => {
    if (isControlled) {
      onChange?.(i);
    } else {
      setInternalActive(i);
    }
  };

  // keep uncontrolled state in sync if defaultIndex changes
  useEffect(() => {
    if (!isControlled) setInternalActive(defaultIndex);
  }, [defaultIndex, isControlled]);

  // keyboard navigation for great UX
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const handler = (e) => {
      const buttons = Array.from(el.querySelectorAll('[role="tab"]'));
      const idx = buttons.findIndex((b) => b === document.activeElement);
      if (idx < 0) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        buttons[(idx + 1) % buttons.length].focus();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        buttons[(idx - 1 + buttons.length) % buttons.length].focus();
      }
      if (e.key === "Home") {
        e.preventDefault();
        buttons[0].focus();
      }
      if (e.key === "End") {
        e.preventDefault();
        buttons[buttons.length - 1].focus();
      }
    };
    el.addEventListener("keydown", handler);
    return () => el.removeEventListener("keydown", handler);
  }, []);

  return (
    <div>
      <div className="pv-tabs" role="tablist" aria-label="Tabs" ref={listRef}>
        {tabs.map((t, i) => (
          <button
            key={i}
            id={`${baseId}-tab-${i}`}
            role="tab"
            aria-selected={i === active}
            aria-controls={`${baseId}-panel-${i}`}
            tabIndex={i === active ? 0 : -1}
            className={`pv-tab ${i === active ? "active" : ""}`}
            onClick={() => setActive(i)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div
        id={`${baseId}-panel-${active}`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${active}`}
        className="pv-tabpanel"
      >
        {tabs[active]?.content}
      </div>
    </div>
  );
}
