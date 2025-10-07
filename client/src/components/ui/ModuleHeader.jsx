// src/components/ModuleHeader.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";

/**
 * Reusable page header with optional breadcrumbs and actions.
 *
 * Props:
 * - title: string (required)
 * - subtitle?: string | ReactNode
 * - actions?: ReactNode (buttons, etc.)
 * - breadcrumbs?: Array<{ label: string, to?: string }>
 *     If provided, renders exactly this trail.
 *     If omitted, renders: Home › {title}
 * - backTo?: string (default "/")
 * - sticky?: boolean (default true)
 * - compact?: boolean (default false) // tighter spacing
 */
export default function ModuleHeader({
  title,
  subtitle,
  actions,
  breadcrumbs,
  backTo = "/",
  sticky = true,
  compact = false,
}) {
  const navigate = useNavigate();

  const computedCrumbs =
    breadcrumbs && breadcrumbs.length
      ? breadcrumbs
      : [
          { label: "Home", to: "/" },
          { label: title || "Module" },
        ];

  return (
    <header
      className="pv-col"
      style={{
        gap: compact ? 6 : 10,
        position: sticky ? "sticky" : "static",
        top: 0,
        zIndex: 5,
        background: "var(--pv-bg)",
        padding: compact ? "8px 12px" : "12px 16px",
        borderBottom: "1px solid var(--pv-border)",
        backdropFilter: "blur(6px)",
      }}
    >
      {/* Breadcrumbs */}
      <nav
        className="pv-row"
        aria-label="Breadcrumb"
        style={{ gap: 8, flexWrap: "wrap", fontSize: 13, color: "var(--pv-dim)" }}
      >
        {computedCrumbs.map((c, i) => {
          const isLast = i === computedCrumbs.length - 1;
          return (
            <span key={i} className="pv-row" style={{ gap: 6, alignItems: "center" }}>
              {i > 0 && <span>›</span>}
              {c.to && !isLast ? (
                <Link to={c.to} style={{ color: "inherit", textDecoration: "none" }}>
                  {c.label}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined} style={{ color: isLast ? "var(--pv-text)" : "inherit", fontWeight: isLast ? 600 : 400 }}>
                  {c.label}
                </span>
              )}
            </span>
          );
        })}
      </nav>

      {/* Title / subtitle / actions */}
      <div className="pv-row" style={{ justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div className="pv-col" style={{ gap: 4 }}>
          <h1 style={{ margin: 0, fontSize: 22 }}>{title}</h1>
          {subtitle ? (
            <div style={{ color: "var(--pv-dim)" }}>{subtitle}</div>
          ) : null}
        </div>
        <div className="pv-row" style={{ gap: 8 }}>
          {actions}
          <button
            className="pv-btn ghost"
            type="button"
            onClick={() => navigate(backTo)}
            aria-label="Go back"
            title="Go back"
          >
            ← Back
          </button>
        </div>
      </div>
    </header>
  );
}



// import { Link, useLocation, useNavigate } from "react-router-dom";
// import "../styles/ui.css";
// import { Card, Button, Tooltip, Badge } from "../components";

// export default function ModuleHeader({ title, /*subtitle,*/ actions }) {
//   const location = useLocation();
//   const navigate = useNavigate();

//   // simple breadcrumb map
//   const crumbs = [
//     { path: "/", label: "Home" },
//     { path: location.pathname, label: title || "Module" },
//   ];

//   return (
//     <div
//       className="pv-row"
//       style={{
//         position: "sticky",
//         top: 0,
//         zIndex: 5,
//         background: "var(--pv-bg)",
//         padding: "10px 16px",
//         borderBottom: "1px solid var(--pv-border)",
//         alignItems: "center",
//         justifyContent: "space-between",
//         backdropFilter: "blur(6px)",
//         marginTop: "-20px",
//       }}
//     >
//       {/* Breadcrumbs */}
//       <div className="pv-row" style={{ gap: 8, flexWrap: "wrap" }}>
//         {crumbs.map((c, i) => (
//           <span
//             key={i}
//             className="pv-row"
//             style={{ alignItems: "center", gap: 6 }}
//           >
//             {i > 0 && <span style={{ color: "var(--pv-dim)" }}>›</span>}
//             <Link
//               to={c.path}
//               style={{
//                 color:
//                   i === crumbs.length - 1 ? "var(--pv-text)" : "var(--pv-dim)",
//                 fontWeight: i === crumbs.length - 1 ? 600 : 400,
//                 textDecoration: "none",
//               }}
//             >
//               {c.label}
//             </Link>
//           </span>
//         ))}
//       </div>

//       {/* Actions */}
//       <div className="pv-row" style={{ gap: 8 }}>
//         {actions}
//         <Tooltip content="Return to dashboard">
//           <Button variant="ghost" onClick={() => navigate("/")}>
//             ← Back
//           </Button>
//         </Tooltip>
//       </div>
//     </div>
//   );
// }
