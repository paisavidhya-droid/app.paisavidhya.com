// src/pages/admin/users/components/UsersTable.jsx
import { Checkbox, Tooltip, Badge, CopyButton } from "../../../../components";
import StatusBadge from "../../../../components/ui/StatusBadge";
import UsersActionsDropdown from "./UsersActionsDropdown";

export default function UsersTable({
  items,
  selectedIds,
  isAllSelectedOnPage,
  toggleAllOnPage,
  toggleOne,
  goToUser,
  onEdit,
  onToggleStatus,
  onDelete,
}) {
  const fmt = (d) => (d ? new Date(d).toLocaleString() : "—");

  return (
    <div className="pv-table-wrap">
      <table className="pv-table leads-table">
        <thead>
          <tr style={{ background: "rgba(0,0,0,0.03)" }}>
            <th style={{ width: 44 }}>
              <Tooltip content="Select all on this page">
                <div>
                  <Checkbox checked={isAllSelectedOnPage} onChange={toggleAllOnPage} />
                </div>
              </Tooltip>
            </th>
            <th>Name / Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Status</th>
            <th>Last Login</th>
            <th>Created</th>
            <th className="pv-th-actions">Actions</th>
          </tr>
        </thead>

        <tbody>
          {items.map((u) => {
            const nameOrEmail = u.name || u.email || "—";
            return (
              <tr key={u._id}>
                <td>
                  <Tooltip content="Select user">
                    <div onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.includes(u._id)}
                        onChange={() => toggleOne(u._id)}
                      />
                    </div>
                  </Tooltip>
                </td>

                <td>
                  <Tooltip content={`View details for ${nameOrEmail}`}>
                    <div
                      className="pv-cell-main"
                      onClick={() => goToUser(u._id)}
                      style={{ cursor: "pointer" }}
                    >
                      {u.name || "—"}
                    </div>
                  </Tooltip>

                  {u.email ? (
                    <div className="pv-cell-sub pv-ellipsis" style={{ marginTop: "1rem" }} title={u.email}>
                      <a
                        href={`mailto:${u.email}`}
                        onClick={(e) => e.stopPropagation()}
                        className="pv-link"
                        title="Send email"
                      >
                        {u.email}
                      </a>
                      <CopyButton size={12} value={u.email} label="email" successMessage="Email copied" />
                    </div>
                  ) : (
                    <div className="pv-cell-sub pv-dim">—</div>
                  )}
                </td>

                <td className="pv-mono">
                  <a
                    href={`tel:${u.phoneNumber}`}
                    className="pv-link"
                    title="Call"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {u.phoneNumber}
                  </a>
                  <CopyButton
                    size={14}
                    value={u.phoneNumber}
                    label="phone number"
                    successMessage="Phone number copied"
                  />
                </td>

                <td className="pv-ellipsis" title={u.role || ""}>
                  {u.role ? <Badge>{String(u.role).toLowerCase()}</Badge> : <span className="pv-dim">—</span>}
                </td>

                <td>
                  <StatusBadge status={u.status === "SUSPENDED" ? "Suspended" : "Active"} />
                </td>

                <td className="pv-ellipsis" title={fmt(u.lastLoginAt)}>
                  <span className="pv-dim">{fmt(u.lastLoginAt)}</span>
                </td>

                <td className="pv-ellipsis" title={fmt(u.createdAt)}>
                  <span className="pv-dim">{fmt(u.createdAt)}</span>
                </td>

                <td className="pv-td-actions">
                  <UsersActionsDropdown
                    user={u}
                    onView={() => goToUser(u._id)}
                    onEdit={() => onEdit(u)}
                    onToggleStatus={() => onToggleStatus(u)}
                    onDelete={() => onDelete(u)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}