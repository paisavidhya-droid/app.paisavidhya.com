import { useEffect, useRef, useState } from "react";
import { Tooltip } from "../../components";
import { FaEllipsisVertical } from "react-icons/fa6";
import {
  FaEdit,
  FaListAlt,
  FaSyncAlt,
  FaExchangeAlt,
  FaTrash,
  FaHistory,
} from "react-icons/fa";

// Minimal, dependency-free “meatball” dropdown.
// Keyboard + outside-click + role-gating friendly.
export default function LeadActionsDropdown({
  lead,
  onViewDetails, // () => void
  onUpdateOutreach, // () => void
  onTransfer, // () => void (optional)
  onViewLogs, // () => void (optional)
  canUpdate = true, // booleans you can compute per row
  canTransfer = true, // e.g., based on assignedTo/user
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const btnRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (!dropdownRef.current) return;
      if (
        !dropdownRef.current.contains(e.target) &&
        !btnRef.current?.contains(e.target)
      )
        setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Keyboard toggle
  const onKeyToggle = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen((p) => !p);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  // Menu item helper
  const Item = ({ children, onClick, disabled, title }) => (
    <li
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      onClick={() => !disabled && (onClick?.(), setOpen(false))}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
          setOpen(false);
        }
      }}
      aria-disabled={disabled}
      className="pv-row"
      style={{
        padding: "8px 10px",
        gap: 8,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
      title={title}
    >
      {children}
    </li>
  );

  // You can swap this “⋯” for an icon button if you have one.
  return (
    <div
      style={{ position: "relative", display: "inline-block" }}
      ref={dropdownRef}
    >
      <button
        ref={btnRef}
        className="dropdown-toggle"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Actions for ${lead?.name || "lead"}`}
        onClick={() => setOpen((p) => !p)}
        onKeyDown={onKeyToggle}
        style={{ padding: "6px 8px", minWidth: 0 }}
      >
        <Tooltip content="Actions" placement="top">
          <FaEllipsisVertical />
        </Tooltip>
      </button>

      {open && (
        <ul
          role="menu"
          style={{
            position: "absolute",
            right: 0,
            marginTop: 6,
            minWidth: 200,
            background: "var(--pv-card, #fff)",
            border: "1px solid var(--pv-border)",
            borderRadius: 10,
            boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
            padding: 6,
            zIndex: 20,
            listStyle: "none",
          }}
        >
          <Item
            onClick={onUpdateOutreach}
            disabled={!canUpdate}
            title={!canUpdate ? "Only assignee can update" : ""}
          >
            <FaSyncAlt className="dropdown-icon" /> Update Status
          </Item>

          {onTransfer && (
            <Item
              onClick={onTransfer}
              disabled={!canTransfer}
              title={!canTransfer ? "Only assignee can transfer" : ""}
            >
              <FaExchangeAlt className="dropdown-icon" />
              Transfer To
            </Item>
          )}

          {!onViewLogs && (
            <Item onClick={onViewLogs}>
              <FaHistory className="dropdown-icon" />
              View Activity Logs
            </Item>
          )}

          <Item onClick={onViewDetails}>
            <FaListAlt className="dropdown-icon" />
            View Details
          </Item>
          <Item onClick={onViewDetails}>
            <FaEdit className="dropdown-icon" />
            Edit Details
          </Item>

          <Item onClick={onViewDetails}>
            <FaTrash className="dropdown-icon" style={{ color: "red" }} />
            Delete Lead
          </Item>
        </ul>
      )}
    </div>
  );
}
