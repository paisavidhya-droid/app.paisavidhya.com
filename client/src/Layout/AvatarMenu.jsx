// ===============================
// AvatarMenu.jsx
// ===============================
import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  FaChevronDown,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUserCircle,
  FaSignOutAlt,
  FaLifeRing,
} from "react-icons/fa";
import { Badge, Button } from "../components";
import "./AvatarMenu.css";

/**
 * AvatarMenu
 * Props:
 * - user: { name, email }
 * - kycStatus: 'verified' | 'pending' | 'unverified' | 'action'
 * - mandateStatus: 'active' | 'pending' | 'missing'
 * - isNRI?: boolean
 * - onSignOut?: () => void
 */
export function AvatarMenu({
  user,
  kycStatus = "pending",
  mandateStatus = "pending",
  isNRI = false,
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const panelRef = useRef(null);
  const navigate = useNavigate();

  // close on outside click
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (!panelRef.current || !btnRef.current) return;
      if (
        panelRef.current.contains(e.target) ||
        btnRef.current.contains(e.target)
      )
        return;
      setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const statusChip = (label, tone = "neutral") => (
    <span
      style={{
        fontSize: 12,
        padding: "2px 6px",
        borderRadius: 999,
        border: "1px solid var(--pv-border)",
        background:
          tone === "ok"
            ? "color-mix(in srgb, var(--pv-primary) 12%, transparent)"
            : tone === "warn"
            ? "color-mix(in srgb, orange 18%, transparent)"
            : "var(--pv-card)",
      }}
    >
      {label}
    </span>
  );

  const kycChip = () => {
    switch (kycStatus) {
      case "verified":
        return statusChip("KYC Verified", "ok");
      case "action":
        return statusChip("KYC Action needed", "warn");
      case "unverified":
        return statusChip("KYC Not done");
      default:
        return statusChip("KYC Pending");
    }
  };

  const mandateChip = () => {
    switch (mandateStatus) {
      case "active":
        return statusChip("Mandate Active", "ok");
      case "missing":
        return statusChip("Mandate Missing", "warn");
      default:
        return statusChip("Mandate Pending");
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        ref={btnRef}
        className="pv-icon-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        style={{
          padding: 0,
          width: 38,
          height: 38,
          borderRadius: "50%",
          border: "1px solid var(--pv-border)",
          background: "var(--pv-surface)",
          cursor: "pointer",
        }}
      >
        <FaUserCircle size={28} />

        <span
          style={{ fontSize: 14, display: "none" }}
          className="hide-on-narrow"
        >
          {user?.name || "Account"}
        </span>
      </button>

      {open && (
        <div
          ref={panelRef}
          role="menu"
          aria-label="Account menu"
          className="avatar-menu__panel"
        >
          {/* Header */}
          <div style={{ padding: 8, display: "grid", gap: 4 }}>
            <strong style={{ fontSize: 14 }}>{user?.name || "User"}</strong>
            <small style={{ color: "var(--pv-dim)" }}>
              {user?.email || ""}
            </small>
            <div
              style={{
                display: "inline-flex",
                gap: 6,
                flexWrap: "wrap",
                marginTop: 6,
              }}
            >
              <Badge>{user.role}</Badge>
              {kycChip()} {mandateChip()}
            </div>
          </div>

          <hr
            style={{
              border: 0,
              borderTop: "1px solid var(--pv-border)",
              margin: "8px 0",
            }}
          />

          {/* Primary account links */}
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "grid",
              gap: 2,
            }}
          >
            <li>
              <NavLink to="/profile" className="menu-link" role="menuitem">
                My Profile
              </NavLink>
            </li>
            <li>
              <NavLink to="/settings/kyc" className="menu-link" role="menuitem">
                KYC & Mandates
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/settings/preferences"
                className="menu-link"
                role="menuitem"
              >
                Preferences
              </NavLink>
            </li>
          </ul>

          <hr
            style={{
              border: 0,
              borderTop: "1px solid var(--pv-border)",
              margin: "8px 0",
            }}
          />

          {/* Data & help */}
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "grid",
              gap: 2,
            }}
          >
            <li>
              <NavLink to="/docs" className="menu-link" role="menuitem">
                Documents
              </NavLink>
            </li>
            <li>
              <NavLink to="/tax" className="menu-link" role="menuitem">
                Tax Center
              </NavLink>
            </li>
            <li>
              <NavLink to="/support" className="menu-link" role="menuitem">
                <FaLifeRing style={{ marginRight: 6 }} />
                Support
              </NavLink>
            </li>
            {isNRI && (
              <li>
                <NavLink to="/nri" className="menu-link" role="menuitem">
                  NRI Desk
                </NavLink>
              </li>
            )}
          </ul>

          <hr
            style={{
              border: 0,
              borderTop: "1px solid var(--pv-border)",
              margin: "8px 0",
            }}
          />

          {/* Sign out */}
          <Button
            as={Link}
            to="/logout"
            variant="ghost"
            style={{
              width: "100%",
              // justifyContent: "flex-start",
            }}
          >
            <FaSignOutAlt /> Logout
          </Button>
        </div>
      )}

      {/* quick styles for menu items */}
      <style>{`
        .menu-link { display:inline-flex; align-items:center; gap:8px; width:100%; padding:8px 10px; border-radius:10px; text-decoration:none; color: var(--pv-text); border:1px solid transparent; }
        .menu-link:hover { background: var(--pv-card); }
        @media (max-width: 780px){ .hide-on-narrow { display:none !important; } }
      `}</style>
    </div>
  );
}
