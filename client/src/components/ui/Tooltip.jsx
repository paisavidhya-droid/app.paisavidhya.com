import { useEffect, useRef, useState } from "react";
import Portal from "./Portal";

export default function Tooltip({ content, children, gap = 8 }) {
  const [show, setShow] = useState(false);
  const anchorRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const updatePos = () => {
    const el = anchorRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({
      left: r.left + r.width / 2,
      top: r.top - gap,
    });
  };

  useEffect(() => {
    if (!show) return;
    updatePos();
    const onScroll = () => updatePos();
    const onResize = () => updatePos();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [show, gap]);

  return (
    <span
      ref={anchorRef}
      style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}

      {show && (
        <Portal>
          <span
            style={{
              position: "fixed",
              left: pos.left,
              top: pos.top,
              transform: "translate(-50%, -100%)",
              background: "var(--pv-dim)",
              color: "var(--pv-primary-ink)",
              border: "1px solid var(--pv-border)",
              padding: "6px 8px",
              borderRadius: 8,
              fontSize: 12,
              whiteSpace: "nowrap",
              zIndex: 99999,
              pointerEvents: "none",
            }}
          >
            {content}
          </span>
        </Portal>
      )}
    </span>
  );
}



// Alternative simpler version without portal delete if everything is working fine
// import { useRef, useState } from "react";

// export default function Tooltip({ content, children }) {
//   const [show, setShow] = useState(false);
//   const ref = useRef(null);
//   return (
//     <span
//       ref={ref}
//       style={{ position: "relative", display: "inline-flex" }}
//       onMouseEnter={() => setShow(true)}
//       onMouseLeave={() => setShow(false)}
//     >
//       {children}
//       {show && (
//         <span
//           style={{
//             position: "absolute",
//             bottom: "calc(100% + 8px)",
//             left: "50%",
//             transform: "translateX(-50%)",
//             background: "var(--pv-dim)", 
//             color: "var(--pv-primary-ink)",
//             border: "1px solid var(--pv-border)",
//             padding: "6px 8px",
//             borderRadius: 8,
//             fontSize: 12,
//             whiteSpace: "nowrap",
//             zIndex: 80,
//           }}
//         >
//           {content}
//         </span>
//       )}
//     </span>
//   );
// }
