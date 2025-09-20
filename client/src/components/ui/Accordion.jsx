
import { useState } from "react";

export default function Accordion({ items = [] }) {
  const [open, setOpen] = useState(null);
  return (
    <div className="pv-col">
      {items.map((it, i) => {
        const expanded = open === i;
        return (
          <div key={i} className="pv-acc-item">
            <button
              className="pv-acc-head"
              onClick={() => setOpen(expanded ? null : i)}
              aria-expanded={expanded}
            >
              <span>{it.title}</span>
              <span>{expanded ? "−" : "+"}</span>
            </button>
            {expanded && <div className="pv-acc-body">{it.content}</div>}
          </div>
        );
      })}
    </div>
  );
}
