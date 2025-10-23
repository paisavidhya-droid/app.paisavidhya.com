// import React, { useState } from "react";
import ThemeToggle from "../components/ThemeToggleBtn/ThemeToggle";
import { FaSearch } from "react-icons/fa";
import { FaBars } from "react-icons/fa6";

// export default function Navbar({ onOpenMobileSidebar, rightSlot }) {
//   const [active, setActive] = useState("dashboard");

  
export default function Navbar({ onOpenMobileSidebar }) {


  return (
    <nav className="navbar" role="navigation" aria-label="Primary">
      {/* left: brand & mobile menu */}
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <button
          className="navbar__menuBtn"
          aria-label="Open menu"
          onClick={onOpenMobileSidebar}
        >
          {/* burger */}
          <FaBars />
        </button>

        <a className="navbar__brand" href="/" aria-label="Home">
          <span className="navbar__logo" aria-hidden="true"></span>
          Paisavidhya
        </a>
      </div>

      {/* center: primary nav (desktop)
      <div className="navbar__nav" role="menubar" aria-label="Sections">
        {[
          { id: "dashboard", label: "Dashboard", href: "#" },
          { id: "projects", label: "Projects", href: "#" },
          { id: "teams", label: "Teams", href: "#" },
          { id: "reports", label: "Reports", href: "#" },
        ].map((item) => (
          <a
            key={item.id}
            className="navbar__link"
            href={item.href}
            role="menuitem"
            aria-current={active === item.id ? "page" : undefined}
            onClick={() => setActive(item.id)}
          >
            {item.label}
          </a>
        ))}
      </div> */}

      {/* right: search + actions */}
      <div className="navbar__actions">
        <label className="search" aria-label="Search">
          <FaSearch className="search__icon"/>
          <input type="search" placeholder="Search…" />
        </label>

        {/* theme toggle slot (optional) 
        {rightSlot}*/}
        <ThemeToggle />
        
      </div>
    </nav>
  );
}

// // Layout.jsx
// import React from "react";
// import Navbar from "../components/Navbar/Navbar";
// // import BottomNav from "./BottomNav/BottomNav";
// // import { useDeviceSize } from "../../context/DeviceSizeContext";

// const  MainLayout = ({ children }) => {
//   // const { isMobile } = useDeviceSize();

//   return (
//     <>

//       <Navbar />

//       <main>{children}</main>

//       {/* {isMobile && <BottomNav /> }  */}
//     </>
//   );
// };

// export default  MainLayout;

import React, { Suspense, useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import BottomNav from "./BottomNav";
import { Skeleton } from "../components";

function ThemeChip() {
  const apply = (t) => document.documentElement.setAttribute("data-theme", t);
  const current =
    document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "dark" ? "light" : "dark";
  return (
    <button
      onClick={() => apply(next)}
      aria-label={`Switch to ${next} theme`}
      style={{
        padding: "8px 12px",
        borderRadius: 999,
        border: `1px solid var(--pv-border)`,
        background: "var(--pv-surface)",
        color: "var(--pv-text)",
      }}
    >
      {current === "dark" ? "🌙" : "☀️"}
    </button>
  );
}

function RouteLoader() {
  return (
    <div
      style={{
        minHeight: "40vh",
        display: "grid",
        placeItems: "center",
      }}
    >
      <div
        style={{ display: "grid", gap: "12px", width: "80%", maxWidth: 480 }}
      >
        <Skeleton height={28} width="60%" radius={6} />
        <Skeleton height={18} width="90%" radius={6} />
        <Skeleton height={18} width="85%" radius={6} />
        <Skeleton height={18} width="75%" radius={6} />
      </div>
    </div>
  );
}

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const mainRef = useRef(null);

  // Close mobile sidebar & move focus to main on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
    // small timeout lets the DOM update before focusing
    const id = setTimeout(() => mainRef.current?.focus(), 0);
    return () => clearTimeout(id);
  }, [location.pathname]);

  return (
    <>
      {/* Skip link for accessibility */}
      <a
        href="#main"
        style={{
          position: "absolute",
          left: -9999,
          top: -9999,
          background: "var(--pv-primary)",
          color: "var(--pv-primary-ink)",
          padding: "8px 12px",
          borderRadius: 8,
        }}
        onFocus={(e) => {
          e.currentTarget.style.left = "8px";
          e.currentTarget.style.top = "8px";
        }}
      >
        Skip to content
      </a>

      <Navbar
        onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        rightSlot={<ThemeChip />}
      />

      <div className={`app-shell ${sidebarCollapsed ? "collapsed" : ""}`}>
        <Sidebar
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          mobileOpen={mobileSidebarOpen}
          setMobileOpen={setMobileSidebarOpen}
        />

        <main
          className="main"
          id="main"
          tabIndex="-1" /* focus target for a11y */
          ref={mainRef}
          role="main"
          aria-live="polite"
        >
          <Suspense fallback={<RouteLoader />}>
            <Outlet /> {/* all pages render here */}
          </Suspense>
        </main>
      </div>
      <Footer />

      {/* Mobile bottom bar (hidden on desktop via CSS) 
      <BottomNav />*/}
    </>
  );
}

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
