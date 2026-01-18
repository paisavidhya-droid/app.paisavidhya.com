import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { FaEllipsisVertical } from "react-icons/fa6";
import { FaEdit, FaUserSlash, FaUserCheck, FaTrash, FaEye } from "react-icons/fa";
import { Portal, Tooltip } from "../../../components";

/**
 * UsersActionsDropdown
 * - Minimal dependency-free meatball dropdown
 * - Portal + outside-click + ESC close + keyboard activation
 * - Pass "can*" flags from parent to gate actions
 */
export default function UsersActionsDropdown({
  user,
  onEdit,
  onToggleStatus, // required for suspend/activate
  onView, 
  onDelete,
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 220 });

  const close = () => setOpen(false);

  // outside click + ESC
  useEffect(() => {
    if (!open) return;

    const onDown = (e) => {
      const btn = btnRef.current;
      const menu = menuRef.current;
      if (btn?.contains(e.target)) return;
      if (menu?.contains(e.target)) return;
      close();
    };

    const onKey = (e) => {
      if (e.key === "Escape") close();
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // position near button
  const computePos = () => {
    const el = btnRef.current;
    if (!el) return;

    const r = el.getBoundingClientRect();
    const menuWidth = 220;

    let left = r.right - menuWidth;
    let top = r.bottom + 8;

    left = Math.max(8, Math.min(left, window.innerWidth - menuWidth - 8));
    setPos({ top, left, width: menuWidth });
  };

  useLayoutEffect(() => {
    if (!open) return;
    computePos();

    const onScroll = () => computePos();
    const onResize = () => computePos();

    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  const Item = ({ children, onClick, disabled, danger = false }) => (
    <li
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onClick={() => {
        if (disabled) return;
        onClick?.();
        close();
      }}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
          close();
        }
      }}
      className="pv-menu-item"
      style={{
        padding: "8px 10px",
        display: "flex",
        gap: 8,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        borderRadius: 8,
        color: danger ? "var(--pv-danger, #d11)" : "inherit",
      }}
    >
      {children}
    </li>
  );

  const suspended = user?.status === "SUSPENDED";
  const toggleLabel = suspended ? "Activate user" : "Suspend user";
  const toggleIcon = suspended ? <FaUserCheck className="dropdown-icon" /> : <FaUserSlash className="dropdown-icon" />;


  return (
    <>
      <button
        ref={btnRef}
        className="dropdown-toggle"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Actions for ${user?.name || user?.email || "user"}`}
        onClick={() => setOpen((p) => !p)}
        style={{ padding: "6px 8px", minWidth: 0 }}
        type="button"
      >
        <Tooltip content="More options">
          <FaEllipsisVertical />
        </Tooltip>
      </button>

      {open && (
        <Portal>
          <ul
            ref={menuRef}
            role="menu"
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              width: pos.width,
              margin: 0,
              padding: 6,
              listStyle: "none",
              background: "var(--pv-card, #fff)",
              border: "1px solid var(--pv-border)",
              borderRadius: 10,
              boxShadow: "0 8px 30px rgba(0,0,0,0.18)",
              zIndex: 9999,
            }}
          >
            {onView && (
              <Tooltip content="View user details">
                <Item onClick={() => onView(user)}>
                  <FaEye className="dropdown-icon" /> View details
                </Item>
              </Tooltip>
            )}

            {onEdit && (
              <Tooltip content="Edit user">
                <Item onClick={() => onEdit(user)}>
                  <FaEdit className="dropdown-icon" /> Edit
                </Item>
              </Tooltip>
            )}

            {onToggleStatus && (
              <Tooltip content={toggleLabel}>
                <Item onClick={() => onToggleStatus(user)} >
                  {toggleIcon} {toggleLabel}
                </Item>
              </Tooltip>
            )}

            {onDelete && (
              <Tooltip content="Delete user">
                <Item onClick={() => onDelete(user)}  danger>
                  <FaTrash className="dropdown-icon" /> Delete
                </Item>
              </Tooltip>
            )}
          </ul>
        </Portal>
      )}
    </>
  );
}
