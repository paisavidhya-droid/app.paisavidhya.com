import React, { useEffect, useRef, useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaSignOutAlt,
  FaChartPie,
  FaCog,
  FaTachometerAlt,
} from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";
import { IconButton } from "../components";
import { FaBars, FaXmark } from "react-icons/fa6";

export default function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) {
  const panelRef = useRef(null);
  const navigate = useNavigate();
  const { isLoggedIn /*, initialized*/ } = useAuth();

  // (optional) prevent flicker while auth bootstraps
  // if you prefer to hide the rail until we know auth state:
  // if (!initialized) return null;

  // ROUTES: update these paths to match your router config
  const menu = useMemo(
    () => [
      {
        label: "Overview",
        to: "/",
        icon: <FaTachometerAlt aria-hidden="true" />,
        tip: "Overview",
      },
      {
        label: "Analytics",
        to: "/analytics",
        icon: <FaChartPie aria-hidden="true" />,
        tip: "Analytics",
      },
      {
        label: "Settings",
        to: "/settings",
        icon: <FaCog aria-hidden="true" />,
        tip: "Settings",
      },
    ],
    []
  );

  // Close mobile on ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setMobileOpen]);

  // Simple focus trap when mobile menu is open
  useEffect(() => {
    if (!mobileOpen) return;
    const container = panelRef.current;
    if (!container) return;

    const focusables = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    // Focus first item for accessibility
    first?.focus();

    const handleTab = (e) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };

    container.addEventListener("keydown", handleTab);
    return () => container.removeEventListener("keydown", handleTab);
  }, [mobileOpen]);

  const handleRailToggle = () => {
    setCollapsed((c) => !c);
  };

  const Section = (
    <nav className="sidebar__section" aria-label="Main">
      <ul className="sidebar__list">
        {menu.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end
              className={({ isActive }) =>
                [
                  "sidebar__item",
                  isActive ? "is-active" : "",
                  collapsed ? "is-compact" : "",
                ].join(" ")
              }
              aria-label={collapsed ? item.label : undefined}
              data-tooltip={collapsed ? item.tip : undefined}
            >
              <span className="sidebar__icon">{item.icon}</span>
              <span className="sidebar__label">{item.label}</span>
            </NavLink>
          </li>
        ))}

        {/* Logout as a sidebar item */}
        {isLoggedIn && (
          <li
            className={`sidebar__item ${collapsed ? "is-compact" : ""}`}
            onClick={() => navigate("/logout", { replace: true })}
            aria-label={collapsed ? "Logout" : undefined}
            data-tooltip={collapsed ? "Logout" : undefined}
            variant="text"
          >
            <span className="sidebar__icon">
              <FaSignOutAlt />
            </span>
            <span className="sidebar__label">Logout</span>
          </li>
        )}
      </ul>
    </nav>
  );

  return (
    <>
      {/* Desktop rail */}
      <aside
        className={`sidebar ${collapsed ? "sidebar--collapsed" : ""}`}
        aria-label="Sidebar"
      >
        <div className="sidebar__header">
          <IconButton
            className="sidebar__toggle pv-icon-btn"
            onClick={handleRailToggle}
            aria-pressed={collapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <FaBars size={18} /> : <FaXmark size={18} />}
          </IconButton>
          <strong className="sidebar__brand" aria-hidden={collapsed}>
            <span className="sidebar__label">Menu</span>
          </strong>
        </div>

        {Section}
      </aside>

      {/* Mobile off-canvas */}
      <div
        className={`offcanvas ${mobileOpen ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile menu"
        onClick={() => setMobileOpen(false)}
        style={{ zIndex: 60 }}
      >
        <div
          className="offcanvas__panel"
          ref={panelRef}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="offcanvas__header">
            <strong id="mobileMenuTitle">Menu</strong>
            <button
              className="sidebar__toggle pv-icon-btn"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <FaXmark size={18} />
            </button>
          </div>
          {Section}
        </div>
      </div>
    </>
  );
}
