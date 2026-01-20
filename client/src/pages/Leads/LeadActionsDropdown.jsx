import { useEffect, useRef, useState } from "react";
import { Tooltip } from "../../components";
import { FaArrowRotateLeft, FaEllipsisVertical } from "react-icons/fa6";
import {
  FaEdit,
  FaListAlt,
  FaSyncAlt,
  FaExchangeAlt,
  FaTrash,
  FaHistory,
  FaUserCheck,
} from "react-icons/fa";
import { useLayoutEffect } from "react";
import Portal from "../../components/ui/Portal";

// Minimal, dependency-free “meatball” dropdown.
// Keyboard + outside-click + role-gating friendly.
export default function LeadActionsDropdown({
  lead,
  onViewDetails,
  onUpdateOutreach,
  onTransfer,
  onViewLogs,
  onDelete,
  onRestore,
  onArchive,
  canUpdate = true,
  canTransfer = true,
  onEditDetails,
  isUnassigned = false,
  isAdmin = false,
  onClaim,
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);

  const menuRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 200 });

  const close = () => setOpen(false);

  // outside click (works with portal)
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

  // position menu near button
  const computePos = () => {
    const el = btnRef.current;
    if (!el) return;

    const r = el.getBoundingClientRect();
    const menuWidth = 170;

    // align right edge with button right edge
    let left = r.right - menuWidth;
    let top = r.bottom + 8;

    // keep inside viewport
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

  // Menu item helper
  const Item = ({ children, onClick, disabled }) => (
    <li
      role="menuitem"
      className="dropdown-item"
      tabIndex={disabled ? -1 : 0}
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
      aria-disabled={disabled}
      style={{
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </li>
  );

  const updateTip = !canUpdate
    ? isUnassigned
      ? "Unassigned lead - claim it first"
      : "Only assignee can update"
    : "Update lead status";

  const claimTip = canTransfer
    ? "Claim this lead (assign to you)"
    : "You can’t claim this lead";

  const transferTip = canTransfer
    ? "Transfer this lead"
    : "Only assignee can transfer";

  // Decide what the "assignment" action should be
  const showClaim = isUnassigned && !isAdmin; // staff + unassigned
  const showTransfer = !isUnassigned || isAdmin; // assigned OR admin (even if unassigned)

  const canDelete = true;

  // You can swap this “⋯” for an icon button if you have one.
  return (
    <div className="dropdown-container">
      <button
        ref={btnRef}
        className="dropdown-toggle"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Actions for ${lead?.name || "lead"}`}
        onClick={() => setOpen((p) => !p)}
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
            className="dropdown-menu"
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              width: pos.width,
            }}
          >
            <Tooltip content={updateTip}>
              <Item onClick={onUpdateOutreach} disabled={!canUpdate}>
                <FaSyncAlt className="dropdown-icon" /> Update Status
              </Item>
            </Tooltip>

            {/* {onTransfer && (
              <Tooltip content={transferTip}>
                <Item
                  onClick={onTransfer}
                  disabled={!canTransfer}
                  title={!canTransfer ? "Only assignee can transfer" : ""}
                >
                  <FaExchangeAlt className="dropdown-icon" />
                  Transfer To
                </Item>
              </Tooltip>
            )} */}
            {(showClaim || showTransfer) && (
              <Tooltip content={showClaim ? claimTip : transferTip}>
                <Item
                  onClick={showClaim ? onClaim : onTransfer}
                  disabled={!canTransfer}
                >
                  {showClaim ? (
                    <>
                      <FaUserCheck className="dropdown-icon" />
                      Claim Lead
                    </>
                  ) : (
                    <>
                      <FaExchangeAlt className="dropdown-icon" />
                      Transfer To
                    </>
                  )}
                </Item>
              </Tooltip>
            )}
            <Tooltip content="View lead details">
              <Item onClick={onViewDetails}>
                <FaListAlt className="dropdown-icon" />
                View Details
              </Item>
            </Tooltip>
            {onViewLogs && (
              <Tooltip content="View activity logs">
                <Item onClick={onViewLogs}>
                  <FaHistory className="dropdown-icon" />
                  Activity Logs
                </Item>
              </Tooltip>
            )}

            {onEditDetails && (
              <Tooltip content={updateTip} placement="right">
                <Item onClick={onEditDetails} disabled={!canUpdate}>
                  <FaEdit className="dropdown-icon" />
                  Edit Details
                </Item>
              </Tooltip>
            )}

            {/* <Item onClick={onViewDetails}>
            <FaEdit className="dropdown-icon" />
            Edit Details
          </Item> */}
            {!canDelete && (
              <>
                {lead?.archivedAt
                  ? onRestore && (
                      <Tooltip content="Restore lead">
                        <Item onClick={onRestore}>
                          <FaArrowRotateLeft className="dropdown-icon" />
                          Restore Lead
                        </Item>
                      </Tooltip>
                    )
                  : onArchive && (
                      <Tooltip content="Archive lead">
                        <Item onClick={onArchive}>
                          <FaTrash
                            className="dropdown-icon"
                            style={{ color: "red" }}
                          />
                          Archive Lead
                        </Item>
                      </Tooltip>
                    )}
              </>
            )}

            {!canDelete && (
              <Item onClick={onDelete} disabled={!canDelete}>
                <FaTrash className="dropdown-icon" style={{ color: "red" }} />
                Delete Lead
              </Item>
            )}
          </ul>
        </Portal>
      )}
    </div>
  );
}
