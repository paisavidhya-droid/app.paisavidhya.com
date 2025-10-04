// import React, { useState } from "react";
import ThemeToggle from "../components/ThemeToggleBtn/ThemeToggle";
import {  useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { FaBars } from "react-icons/fa6";

// export default function Navbar({ onOpenMobileSidebar, rightSlot }) {
//   const [active, setActive] = useState("dashboard");

  
export default function Navbar({ onOpenMobileSidebar }) {
  const navigate = useNavigate();


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
