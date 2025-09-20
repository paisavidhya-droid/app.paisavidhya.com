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

          <Footer />
        </main>
      </div>

      {/* Mobile bottom bar (hidden on desktop via CSS) */}
      <BottomNav />
    </>
  );
}
