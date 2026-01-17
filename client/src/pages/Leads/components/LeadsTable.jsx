// src/pages/leads/components/LeadsTable.jsx
import {  Checkbox, CopyButton, Tooltip } from "../../../components";
import StatusBadge from "../../../components/ui/StatusBadge";
import LeadActionsDropdown from "../LeadActionsDropdown";

export default function LeadsTable({
  items,
  goToLead,

  // selection
  selectedIds,
  isAllSelectedOnPage,
  toggleAllOnPage,
  toggleOne,

  // permissions
   canUpdateLead,
  canTransferLead,

  // helpers
  fmtNextActionNode,
  truncate,

  // actions
  onEditOutreach,
  onEditDetails,
  onTransfer,
  onLogs,
  onArchive,
  onRestore,
  onDelete,
  onClaim,
  isAdmin,
}) {
  return (
    <div className="pv-table-wrap">
      <table className="pv-table leads-table">
        <thead>
          <tr style={{ background: "rgba(0,0,0,0.03)" }}>
            <th style={{ width: 44 }}>
              <Tooltip content="Select all on this page">
                <div>
                  <Checkbox
                    checked={isAllSelectedOnPage}
                    onChange={toggleAllOnPage}
                  />
                </div>
              </Tooltip>
            </th>
            <th>Name / Email</th>
            <th>Phone</th>
            <th>Requested for</th>
            <th>Assigned To</th>
            <th>Status</th>
            <th>Next Action</th>
            <th>Message</th>
            <th>Note</th>
            <th className="pv-th-actions">Actions</th>
          </tr>
        </thead>

        <tbody>
          {items.map((lead) => {
            const canUpdate = canUpdateLead(lead);
            const canTransfer = canTransferLead(lead);
            const isUnassigned = !lead?.outreach?.assignedTo;
            const canClaim = isUnassigned && canTransfer;
            const selectTip = canUpdate
              ? "Select lead"
              : isUnassigned
              ? "Unassigned lead — claim it first"
              : "Only the assignee can update";
            return (
              <tr key={lead._id}>
                <td>
                  <Tooltip content={selectTip}>
                    <div>
                      <Checkbox
                        disabled={!canTransfer}
                        checked={selectedIds.has(String(lead._id))}
                        onChange={() => toggleOne(lead._id)}
                      />
                    </div>
                  </Tooltip>
                </td>

                {/* Name / Email */}
                <td>
                  <Tooltip
                    content={`View details for ${lead.email || lead.name}`}
                  >
                    <div
                      className="pv-cell-main"
                      onClick={() => goToLead(lead._id)}
                      style={{ cursor: "pointer" }}
                    >
                      {lead.name}
                    </div>
                  </Tooltip>

                  {lead.email ? (
                    <div
                      className="pv-cell-sub pv-ellipsis"
                      style={{ marginTop: "1rem" }}
                    >
                      <a
                        href={`mailto:${lead.email}`}
                        onClick={(e) => e.stopPropagation()}
                        className="pv-link"
                        title="Send email"
                      >
                        {lead.email}
                      </a>{" "}
                      <CopyButton
                        size={12}
                        value={lead.email}
                        label="email"
                        successMessage="Email copied"
                      />
                    </div>
                  ) : (
                    <div className="pv-cell-sub pv-dim">—</div>
                  )}
                </td>

                {/* Phone */}
                <td className="pv-mono">
                  <a
                    href={`tel:${lead.phone}`}
                    className="pv-link"
                    title="Call"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {lead.phone}
                  </a>
                  <CopyButton
                    size={14}
                    value={lead.phone}
                    label="phone number"
                    successMessage="Phone number copied"
                  />
                </td>

                {/* Requested for */}
                <td
                  className="pv-ellipsis"
                  title={(lead.interests || []).join(", ")}
                >
                  {Array.isArray(lead.interests) && lead.interests.length ? (
                    lead.interests.join(", ")
                  ) : (
                    <span className="pv-dim">—</span>
                  )}
                </td>

                {/* Assigned */}
                <td>
                  {lead.outreach?.assignedTo ? (
                    <>{lead.outreach.assignedTo.name}</>
                  ) : (
                    <span className="pv-dim">Unassigned</span>
                  )}
                </td>

                {/* Status */}
                <td>
                  <StatusBadge status={lead.outreach?.status || "New"} />
                </td>

                {/* Next Action */}
                <td className="pv-ellipsis">{fmtNextActionNode(lead)}</td>

                {/* Message */}
                <td>
                  {lead.message ? (
                    String(lead.message).length <= 50 ? (
                      <Tooltip content={String(lead.message)}>
                        <span className="pv-dim">
                          {truncate(lead.message, 50)}
                        </span>
                      </Tooltip>
                    ) : (
                      <span className="pv-dim">
                        {truncate(lead.message, 50)}
                      </span>
                    )
                  ) : (
                    <span className="pv-dim">—</span>
                  )}
                </td>

                {/* Note */}
                <td>
                  {lead.outreach?.note ? (
                    String(lead.outreach.note).length <= 50 ? (
                      <Tooltip content={String(lead.outreach.note)}>
                        <span className="pv-dim">
                          {truncate(lead.outreach.note, 50)}
                        </span>
                      </Tooltip>
                    ) : (
                      <span className="pv-dim">
                        {truncate(lead.outreach.note, 50)}{" "}
                        <button
                          className="view-note-btn"
                          onClick={
                            () => onEditOutreach(lead) /* or open note modal */
                          }
                          type="button"
                        >
                          View
                        </button>
                      </span>
                    )
                  ) : (
                    <span className="pv-dim">—</span>
                  )}
                </td>

                {/* Actions */}
                <td className="pv-td-actions">
                  <LeadActionsDropdown
                    lead={lead}
                    onViewDetails={() => goToLead(lead._id)}
                    onUpdateOutreach={() => onEditOutreach(lead)}
                    onEditDetails={() => onEditDetails(lead)}
                    onTransfer={() => onTransfer(lead)}
                    onViewLogs={() => onLogs(lead)}
                    canUpdate={canUpdate} 
                    canTransfer={canTransfer} 
                     onArchive={canUpdate ? () => onArchive(lead) : undefined}
                    onRestore={canUpdate ? () => onRestore(lead) : undefined}
                    onDelete={() => onDelete(lead)}
                    isUnassigned={isUnassigned}
                     isAdmin={isAdmin}
                    onClaim={canClaim ? () => onClaim(lead) : undefined}
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
