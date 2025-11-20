// import React, { useState } from "react";
import ThemeToggle from "../components/ThemeToggleBtn/ThemeToggle";
import { FaBell, FaSearch } from "react-icons/fa";
import { FaBars } from "react-icons/fa6";
import { NavLink } from "react-router-dom";
import { AvatarMenu } from "./AvatarMenu";
import { useAuth } from "../hooks/useAuth";
import { useDeviceSize } from "../context/DeviceSizeContext";

// export default function Navbar({ onOpenMobileSidebar, rightSlot }) {
//   const [active, setActive] = useState("dashboard");

export default function Navbar({ onOpenMobileSidebar }) {
  const { user, isLoggedIn } = useAuth();
  const { isMobile } = useDeviceSize();

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

      {/* center: primary nav (desktop)*/}
      {!isLoggedIn && (
        <div className="navbar__nav" role="menubar" aria-label="Sections">
          {[
            { id: "Home", label: "Home", to: "/" },
            { id: "tools", label: "Tools", to: "/tools" },
            {
              id: "WealthPath",
              label: "WealthPath",
              to: "https://paisavidhya.com/wealthpath",
            },
            {
              id: "about",
              label: "About",
              to: "https://paisavidhya.com/about",
            },
            { id: "blog", label: "Blog", to: "https://paisavidhya.com/blog" },
          ].map((item) => (
            <NavLink
              key={item.id}
              className={({ isActive }) =>
                `navbar__link ${isActive ? "is-active" : ""}`
              }
              to={item.to}
              role="menuitem"
              aria-current={({ isActive }) => (isActive ? "page" : undefined)}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}

      {/* right: search + actions */}
      <div className="navbar__actions">
        <label className="search" aria-label="Search">
          <FaSearch className="search__icon" />
          <input type="search" placeholder="Search…" />
        </label>

        {/* <NavLink
          to="/invest/start"
          className="pv-btn ghost"
          aria-label="Start a SIP"
        >
          Start SIP
        </NavLink> */}
        {isLoggedIn ? (
          <>
            {/* Notifications bell (separate from avatar) */}
            <button
              aria-label="Notifications"
              title="Notifications"
              style={{
                border: "1px solid var(--pv-border)",
                borderRadius: 10,
                width: 38,
                height: 38,
                display: "grid",
                placeItems: "center",
                background: "var(--pv-surface)",
              }}
            >
              <FaBell />
            </button>

            {/* Account menu */}

            <AvatarMenu
              user={user}
              // kycStatus={kycStatus}
              // mandateStatus={mandateStatus}
              // isNRI={isNRI}
              // onSignOut={onSignOut}
            />
          </>
        ) : (
          <>
            {" "}
            <NavLink
              to="/auth"
              className="pv-btn primary"
              aria-label="Start a SIP"
            >
              Sign in
            </NavLink>
            {!isMobile && <ThemeToggle />}
          </>
        )}
        {/* theme toggle slot (optional) 
        {rightSlot}*/}
      </div>
    </nav>
  );
}
