// client\src\components\ui\moduleHeader\ModuleHeader.jsx
import { useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./moduleHeader.css";
import { FaArrowLeft, FaChevronRight } from "react-icons/fa";
import Button from "../Button";

function humanize(seg) {
  return seg
    .replace(/[-_]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());
}

/**
 * Minimal ModuleHeader
 * - Auto breadcrumbs from URL (Home / pfc / report / ...)
 * - Optional back button
 * - Title + subtitle
 * - Actions slot (keep 1–2 buttons)
 *
 * Props:
 *  title: string
 *  subtitle?: ReactNode
 *  actions?: ReactNode
 *  sticky?: boolean (default true)
 *  backTo?: string | number | false (default -1)
 *  routeLabels?: Record<string, string>
 */
export default function ModuleHeader({
  title,
  subtitle,
  actions,
  sticky = true,
  backTo = -1,
  routeLabels = {
    pfc: "PFC",
    ffc: "FFC",
    bfc: "BFC",
    report: "Report",
    tools: "Tools",
    calculators: "Calculators",
    "sip-calculator": "SIP Calculator",
    insurance: "Insurance",
    applications: "Applications",
    admin: "Admin",
    "user-management": "User Management",
    users: "Users",
  },
}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const crumbs = useMemo(() => {
    const segs = pathname.split("/").filter(Boolean);
    const out = [{ label: "Home", to: "/" }];
    let acc = "";
    for (const seg of segs) {
      acc += `/${seg}`;
      out.push({ label: routeLabels[seg] || humanize(seg), to: acc });
    }
    // Make last crumb non-clickable in render, so it behaves like current page.
    return out;
  }, [pathname, routeLabels]);

  const onBack = () => {
    if (backTo === false) return;
    navigate(backTo);
  };

  return (
    <header className={`mh ${sticky ? "mh-sticky" : ""}`}>
      <div className="mh-top">
        <div className="mh-main">
          <h1 className="mh-title">{title}</h1>
          {subtitle ? <div className="mh-subtitle">{subtitle}</div> : null}
        </div>

        <div className="mh-actions">
          {backTo !== false && (
            <Button type="button" variant="ghost" onClick={onBack}>
              <FaArrowLeft />
              {/* ←  */}
              Back
            </Button>
          )}
          {actions}
        </div>
      </div>
      <nav className="mh-bc" aria-label="Breadcrumb">
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <span key={`${c.to}-${i}`} className="mh-bcItem">
              {i > 0 && (
                <span className="mh-sep" aria-hidden="true">
                  <FaChevronRight size={10} />
                </span>
              )}

              {!isLast ? (
                <Link to={c.to} className="mh-link">
                  {c.label}
                </Link>
              ) : (
                <span className="mh-current" aria-current="page">
                  {c.label}
                </span>
              )}
            </span>
          );
        })}
      </nav>
    </header>
  );
}
