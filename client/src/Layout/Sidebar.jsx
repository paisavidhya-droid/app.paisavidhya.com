// import React, { useEffect, useRef, useMemo } from "react";
// import { NavLink, useNavigate } from "react-router-dom";
// import {
//   FaSignOutAlt,
//   FaChartPie,
//   FaCog,
//   FaTachometerAlt,
// } from "react-icons/fa";
// import { useAuth } from "../hooks/useAuth";
// import { IconButton } from "../components";
// import { FaBars, FaXmark } from "react-icons/fa6";

// export default function Sidebar({
//   collapsed,
//   setCollapsed,
//   mobileOpen,
//   setMobileOpen,
// }) {
//   const panelRef = useRef(null);
//   const navigate = useNavigate();
//   const { isLoggedIn /*, initialized*/ } = useAuth();

//   // (optional) prevent flicker while auth bootstraps
//   // if you prefer to hide the rail until we know auth state:
//   // if (!initialized) return null;

//   // ROUTES: update these paths to match your router config
//   const menu = useMemo(
//     () => [
//       {
//         label: "Overview",
//         to: "/",
//         icon: <FaTachometerAlt aria-hidden="true" />,
//         tip: "Overview",
//       },
//       {
//         label: "Analytics",
//         to: "/analytics",
//         icon: <FaChartPie aria-hidden="true" />,
//         tip: "Analytics",
//       },
//       {
//         label: "Settings",
//         to: "/settings",
//         icon: <FaCog aria-hidden="true" />,
//         tip: "Settings",
//       },
//     ],
//     []
//   );

//   // Close mobile on ESC
//   useEffect(() => {
//     const onKey = (e) => {
//       if (e.key === "Escape") setMobileOpen(false);
//     };
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [setMobileOpen]);

//   // Simple focus trap when mobile menu is open
//   useEffect(() => {
//     if (!mobileOpen) return;
//     const container = panelRef.current;
//     if (!container) return;

//     const focusables = container.querySelectorAll(
//       'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
//     );
//     const first = focusables[0];
//     const last = focusables[focusables.length - 1];

//     // Focus first item for accessibility
//     first?.focus();

//     const handleTab = (e) => {
//       if (e.key !== "Tab") return;
//       if (e.shiftKey && document.activeElement === first) {
//         e.preventDefault();
//         last?.focus();
//       } else if (!e.shiftKey && document.activeElement === last) {
//         e.preventDefault();
//         first?.focus();
//       }
//     };

//     container.addEventListener("keydown", handleTab);
//     return () => container.removeEventListener("keydown", handleTab);
//   }, [mobileOpen]);

//   const handleRailToggle = () => {
//     setCollapsed((c) => !c);
//   };

//   const Section = (
//     <nav className="sidebar__section" aria-label="Main">
//       <ul className="sidebar__list">
//         {menu.map((item) => (
//           <li key={item.to}>
//             <NavLink
//               to={item.to}
//               end
//               className={({ isActive }) =>
//                 [
//                   "sidebar__item",
//                   isActive ? "is-active" : "",
//                   collapsed ? "is-compact" : "",
//                 ].join(" ")
//               }
//               aria-label={collapsed ? item.label : undefined}
//               data-tooltip={collapsed ? item.tip : undefined}
//             >
//               <span className="sidebar__icon">{item.icon}</span>
//               <span className="sidebar__label">{item.label}</span>
//             </NavLink>
//           </li>
//         ))}

//         {/* Logout as a sidebar item */}
//         {isLoggedIn && (
//           <li
//             className={`sidebar__item ${collapsed ? "is-compact" : ""}`}
//             onClick={() => navigate("/logout", { replace: true })}
//             aria-label={collapsed ? "Logout" : undefined}
//             data-tooltip={collapsed ? "Logout" : undefined}
//             variant="text"
//           >
//             <span className="sidebar__icon">
//               <FaSignOutAlt />
//             </span>
//             <span className="sidebar__label">Logout</span>
//           </li>
//         )}
//       </ul>
//     </nav>
//   );

//   return (
//     <>
//       {/* Desktop rail */}
//       <aside
//         className={`sidebar ${collapsed ? "sidebar--collapsed" : ""}`}
//         aria-label="Sidebar"
//       >
//         <div className="sidebar__header">
//           <IconButton
//             className="sidebar__toggle pv-icon-btn"
//             onClick={handleRailToggle}
//             aria-pressed={collapsed}
//             aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
//             title={collapsed ? "Expand" : "Collapse"}
//           >
//             {collapsed ? <FaBars size={18} /> : <FaXmark size={18} />}
//           </IconButton>
//           <strong className="sidebar__brand" aria-hidden={collapsed}>
//             <span className="sidebar__label">Menu</span>
//           </strong>
//         </div>

//         {Section}
//       </aside>

//       {/* Mobile off-canvas */}
//       <div
//         className={`offcanvas ${mobileOpen ? "open" : ""}`}
//         role="dialog"
//         aria-modal="true"
//         aria-label="Mobile menu"
//         onClick={() => setMobileOpen(false)}
//         style={{ zIndex: 60 }}
//       >
//         <div
//           className="offcanvas__panel"
//           ref={panelRef}
//           onClick={(e) => e.stopPropagation()}
//         >
//           <div className="offcanvas__header">
//             <strong id="mobileMenuTitle">Menu</strong>
//             <button
//               className="sidebar__toggle pv-icon-btn"
//               onClick={() => setMobileOpen(false)}
//               aria-label="Close menu"
//             >
//               <FaXmark size={18} />
//             </button>
//           </div>
//           {Section}
//         </div>
//       </div>
//     </>
//   );
// }

import React, { useEffect, useMemo, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { IconButton } from "../components";
import {
  FaTachometerAlt,
  FaBell,
  FaPlayCircle,
  FaBullseye,
  FaExchangeAlt,
  FaListUl,
  FaChartPie,
  FaFileAlt,
  FaReceipt,
  FaFolderOpen,
  FaIdCard,
  FaUniversity,
  FaUserShield,
  FaCogs,
  FaGlobeAsia,
  FaLifeRing,
  FaBookOpen,
  FaRocket,
  FaSignOutAlt,
} from "react-icons/fa";
import { FaBars, FaXmark } from "react-icons/fa6";

export default function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) {
  const panelRef = useRef(null);
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  // 1) define your sections, and mark the few you want when collapsed
  const sections = useMemo(
    () => [
      {
        title: "Overview",
        items: [
          {
            label: "Dashboard",
            to: "/",
            icon: <FaTachometerAlt aria-hidden="true" />,
            pinOnCollapse: true, // 👈 pinned
          },
          {
            label: "Notifications",
            to: "/notifications",
            icon: <FaBell aria-hidden="true" />,
          },
        ],
      },
      {
        title: "Invest",
        items: [
          {
            label: "SIPs",
            to: "/sips",
            icon: <FaPlayCircle aria-hidden="true" />,
            pinOnCollapse: true, // 👈 pinned
          },
          {
            label: "Goals",
            to: "/goals",
            icon: <FaBullseye aria-hidden="true" />,
          },
          {
            label: "Transactions",
            to: "/txns",
            icon: <FaExchangeAlt aria-hidden="true" />,
            pinOnCollapse: true, // 👈 pinned
          },
          {
            label: "Orders",
            to: "/orders",
            icon: <FaListUl aria-hidden="true" />,
          },
        ],
      },
      {
        title: "Portfolio",
        items: [
          {
            label: "Holdings",
            to: "/portfolio",
            icon: <FaChartPie aria-hidden="true" />,
            pinOnCollapse: true, // 👈 pinned
          },
          {
            label: "Reports",
            to: "/reports",
            icon: <FaFileAlt aria-hidden="true" />,
          },
          {
            label: "Tax Center",
            to: "/tax",
            icon: <FaReceipt aria-hidden="true" />,
          },
          {
            label: "Documents",
            to: "/docs",
            icon: <FaFolderOpen aria-hidden="true" />,
          },
        ],
      },
      {
        title: "Setup",
        items: [
          {
            label: "KYC & Mandates",
            to: "/settings/kyc",
            icon: <FaIdCard aria-hidden="true" />,
          },
          {
            label: "Bank & Nominees",
            to: "/settings/banking",
            icon: <FaUniversity aria-hidden="true" />,
          },
          {
            label: "Risk Profile",
            to: "/settings/risk",
            icon: <FaUserShield aria-hidden="true" />,
          },
          {
            label: "Preferences",
            to: "/settings/preferences",
            icon: <FaCogs aria-hidden="true" />,
          },
        ],
      },
      {
        title: "NRI",
        items: [
          {
            label: "NRI Desk",
            to: "/nri",
            icon: <FaGlobeAsia aria-hidden="true" />,
          },
        ],
      },
      {
        title: "Help",
        items: [
          {
            label: "Support",
            to: "/support",
            icon: <FaLifeRing aria-hidden="true" />,
            pinOnCollapse: true, // 👈 pinned (5th icon)
          },
          {
            label: "Guides",
            to: "/learn/guides",
            icon: <FaBookOpen aria-hidden="true" />,
          },
          {
            label: "Changelog",
            to: "/changelog",
            icon: <FaRocket aria-hidden="true" />,
          },
        ],
      },
    ],
    []
  );

  // 2) build the "collapsed shortcuts" (flat 4–5 icons) once
  const collapsedShortcuts = useMemo(() => {
    const allItems = sections.flatMap((s) => s.items);
    // keep order as defined above, cap to 5
    return allItems.filter((i) => i.pinOnCollapse).slice(0, 5);
  }, [sections]);

  // Close mobile on ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setMobileOpen]);

  // Focus trap when mobile is open
  useEffect(() => {
    if (!mobileOpen) return;
    const container = panelRef.current;
    if (!container) return;
    const focusables = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
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

  const handleRailToggle = () => setCollapsed((c) => !c);

  const MenuSection = ({ title, items }) => (
    <div className="sidebar__section">
      {!!title && (
        <div className="sidebar__title" aria-hidden={collapsed}>
          {title}
        </div>
      )}
      <ul className="sidebar__list">
        {items.map((item) => (
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
              data-tooltip={collapsed ? item.label : undefined}
            >
              <span className="sidebar__icon">{item.icon}</span>
              <span className="sidebar__label">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );

  const LogoutItem = isLoggedIn ? (
    <button
      className={["sidebar__item", collapsed ? "is-compact" : ""].join(" ")}
      onClick={() => navigate("/logout", { replace: true })}
      aria-label={collapsed ? "Logout" : undefined}
      data-tooltip={collapsed ? "Logout" : undefined}
      title="Logout"
    >
      <span className="sidebar__icon">
        <FaSignOutAlt aria-hidden="true" />
      </span>
      <span className="sidebar__label">Logout</span>
    </button>
  ) : null;

  // 3) choose what to render based on collapsed
  const renderedForRail = collapsed
    ? // collapsed: just the 4–5 pinned icons in one “Quick” group
      [{ title: "", items: collapsedShortcuts }]
    : // expanded: full sections
      sections;

  const DesktopRail = (
    <aside
      className={["sidebar", collapsed ? "sidebar--collapsed" : ""].join(" ")}
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

      <div className="sidebar__scroll">
        {renderedForRail.map((s) => (
          <MenuSection
            key={s.title || "quick"}
            title={s.title}
            items={s.items}
          />
        ))}
      </div>

      <div className="sidebar__footer">{LogoutItem}</div>
    </aside>
  );

  // Mobile: usually you want full nav when the drawer is open,
  // but if you want the same "pinned-only" behavior on small screens,
  // swap `sections` with the same `renderedForRail` below.
  const MobileOffcanvas = (
    <div
      className={["offcanvas", mobileOpen ? "open" : ""].join(" ")}
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
        <div className="offcanvas__scroll">
          {sections.map((s) => (
            <MenuSection key={s.title} title={s.title} items={s.items} />
          ))}
          {LogoutItem}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {DesktopRail}
      {MobileOffcanvas}
    </>
  );
}
