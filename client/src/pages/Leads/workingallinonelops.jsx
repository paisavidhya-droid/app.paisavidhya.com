// this is copy of leads ops before making seperate components it can be directly pasted into LeadsOps.jsx and used
import { useEffect, useState } from "react";
import "./leads.css";
import {
  Input,
  Card,
  Button,
  Badge,
  Modal,
  Pagination,
  Spinner,
  Tooltip,
  ActiveFilterPill,
  Checkbox,
  CopyButton,
} from "../../components";
import toast from "react-hot-toast";
import OutreachEditor from "./components/OutreachEditor";
import StatusBadge from "../../components/ui/StatusBadge";
import { useNavigate } from "react-router-dom";
import LeadActionsDropdown from "./LeadActionsDropdown";
import TransferLeadModal from "./LeadTransferModal";
import { useAssignableUsers } from "../../hooks/useUsers";

import {
  archiveLeadById,
  bulkArchiveLeads,
  bulkHardDeleteLeads,
  bulkRestoreLeads,
  hardDeleteLeadById,
  listLeads,
  restoreLeadById,
} from "../../services/leads.service";
import { useAuth } from "../../hooks/useAuth";
import LeadLogsModal from "./components/LeadLogsModal";
import Swal from "sweetalert2";
import LeadFilters from "./components/LeadFilters";
import { FaExchangeAlt, FaPlus, FaTimes, FaTrashAlt } from "react-icons/fa";
import { FaArrowRotateLeft } from "react-icons/fa6";
import LeadDetailsEditor from "./components/LeadDetailsEditor";
import CallbackForm from "../../components/CallbackForm";

const DEFAULT_FILTERS = {
  q: "",
  phone: "",
  status: "",
  assignedTo: "",
  source: "",
  followUp: "", // "" | overdue | today | upcoming
  archiveMode: "active", // active | archived | all
  sort: "recent", // recent | followup | activity
};

export default function LeadsOps() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  // filters
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  // paging & data
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const limit = 10;

  // assignable users for filter dropdown (safe to load on page mount)
  const { assignable = [] } = useAssignableUsers(true);

  const [createLeadOpen, setCreateLeadOpen] = useState(false);

  // edit & details
  const [editLead, setEditLead] = useState(null);
  const [noteLead, setNoteLead] = useState(null);
  const [logsLead, setLogsLead] = useState(null);
  const [editDetailsLead, setEditDetailsLead] = useState(null);

  const [transferIds, setTransferIds] = useState([]);

  // helpers
  const fmtDate = (d) => (d ? new Date(d).toLocaleString() : "");
  const getAssigneeId = (lead) => {
    const a = lead?.outreach?.assignedTo;
    if (!a) return "";
    return typeof a === "object" ? String(a._id || "") : String(a);
  };

  const canManageLead = (lead) => {
    const assigneeId = getAssigneeId(lead);
    return isAdmin || !assigneeId || assigneeId === String(user?._id);
  };

  // ✅ Debounced auto-load when filters or page changes
  useEffect(() => {
    const t = setTimeout(() => {
      load();
    }, 300); // debounce 300ms
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [page, filters]);

  async function load() {
    setLoading(true);
    try {
      const skip = (page - 1) * limit;

      const data = await listLeads({
        q: filters.q,
        status: filters.status,
        source: filters.source,
        assignedTo: filters.assignedTo,
        phone: filters.phone,
        followUp: filters.followUp,
        archiveMode: filters.archiveMode,
        sort: filters.sort,
        limit,
        skip,
      });

      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch {
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  }

  const truncate = (txt, n = 40) => {
    if (!txt) return "";
    const s = String(txt);
    return s.length > n ? s.slice(0, n).trim() + "…" : s;
  };

  // new: simplified next-action formatter
  const fmtNextAction = (lead) => {
    const fu = lead?.outreach?.followUpAt;
    const type = lead?.preferredTimeType;
    const pref = lead?.preferredTimeAt;

    if (fu) return `Follow-up • ${fmtDate(fu)}`;
    if (type === "SCHEDULED" && pref) return `Scheduled • ${fmtDate(pref)}`;
    return type && type !== "SCHEDULED" ? type : "ASAP";
  };

  const fmtNextActionNode = (lead) => {
    const t = fmtNextAction(lead);
    return t === "Later" ? <Badge>Later</Badge> : t;
    // return t === "ASAP" ? <Badge>ASAP</Badge> : t;
  };

  const handleHardDelete = async (lead) => {
    if (!lead?._id) return;

    const res = await Swal.fire({
      title: "Delete lead?",
      html: `<div style="text-align:left">
            <div><b>${
              lead.name || "This lead"
            }</b> will be permanently deleted.</div>
            <div style="margin-top:6px;color:#888">This action cannot be undone.</div>
           </div>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
      reverseButtons: true,
      allowOutsideClick: () => !Swal.isLoading(),
    });

    if (!res.isConfirmed) return;

    try {
      await hardDeleteLeadById(lead._id);

      await Swal.fire({
        title: "Deleted!",
        text: "Lead has been permanently deleted.",
        icon: "success",
        timer: 1400,
        showConfirmButton: false,
      });

      // refresh list
      load();
    } catch (e) {
      console.error(e);
      Swal.fire({
        title: "Delete failed",
        text: e?.response?.data?.message || "Something went wrong.",
        icon: "error",
      });
    }
  };

  const handleArchive = async (lead) => {
    if (!lead?._id) return;

    const res = await Swal.fire({
      title: "Archive lead?",
      text: "This will hide the lead from the active list. You can restore it later.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Archive",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!res.isConfirmed) return;

    try {
      await archiveLeadById(lead._id);
      toast.success("Lead archived");
      load();
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || "Failed to archive lead");
    }
  };

  const handleRestore = async (lead) => {
    if (!lead?._id) return;

    const res = await Swal.fire({
      title: "Restore lead?",
      text: "This will move the lead back to the active list.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Restore",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!res.isConfirmed) return;

    try {
      await restoreLeadById(lead._id);
      toast.success("Lead restored");
      load();
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || "Failed to restore lead");
    }
  };

  const isArchived = (lead) => !!lead?.archivedAt;

  // selection
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  const selectedLeads = items.filter((x) => selectedIds.has(String(x._id)));

  const selectedManageable = selectedLeads.filter(canManageLead);

  const selectedActive = selectedManageable.filter((l) => !isArchived(l));
  const selectedArchived = selectedManageable.filter((l) => isArchived(l));

  const bulkArchiveIds = selectedActive.map((l) => l._id);
  const bulkRestoreIds = selectedArchived.map((l) => l._id);
  const bulkDeleteIds = selectedManageable.map((l) => l._id); // or selectedLeads if admin can delete all
  const bulkTransferIds = selectedManageable.map((l) => l._id);

  const notManageableCount = selectedLeads.length - selectedManageable.length;

  const selectableLeads = items.filter((x) => canManageLead(x)); // only those user can act on
  const selectableIdsOnPage = selectableLeads.map((x) => String(x._id));

  const isAllSelectedOnPage =
    selectableIdsOnPage.length > 0 &&
    selectableIdsOnPage.every((id) => selectedIds.has(id));

  const selectedCount = selectedIds.size;

  const toggleOne = (leadId) => {
    const id = String(leadId);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllOnPage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);

      if (isAllSelectedOnPage) {
        selectableIdsOnPage.forEach((id) => next.delete(id));
      } else {
        selectableIdsOnPage.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  useEffect(() => {
    clearSelection();
  }, [page, filters]);

  const bulkArchive = async (ids) => {
    if (!ids?.length) return;

    const res = await Swal.fire({
      title: "Archive selected leads?",
      text: `You are about to archive ${ids.length} lead(s).`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Archive",
      reverseButtons: true,
    });
    if (!res.isConfirmed) return;

    try {
      const r = await bulkArchiveLeads(ids);
      toast.success(`Archived ${r?.modified ?? ids.length} lead(s)`);
      clearSelection();
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Bulk archive failed");
    }
  };

  const bulkRestore = async (ids) => {
    if (!ids?.length) return;

    const res = await Swal.fire({
      title: "Restore selected leads?",
      text: `You are about to restore ${ids.length} lead(s).`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Restore",
      reverseButtons: true,
    });
    if (!res.isConfirmed) return;

    try {
      const r = await bulkRestoreLeads(ids);
      toast.success(`Restored ${r?.modified ?? ids.length} lead(s)`);
      clearSelection();
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Bulk restore failed");
    }
  };

  const bulkDelete = async (ids) => {
    if (!ids?.length) return;

    const res = await Swal.fire({
      title: "Delete selected leads?",
      html: `<div style="text-align:left">
      <div><b>${ids.length}</b> lead(s) will be permanently deleted.</div>
      <div style="margin-top:6px;color:#888">This action cannot be undone.</div>
    </div>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      confirmButtonColor: "#d33",
      reverseButtons: true,
    });
    if (!res.isConfirmed) return;

    try {
      await bulkHardDeleteLeads(ids);
      toast.success(`Deleted ${ids.length} lead(s)`);
      clearSelection();
      load();
    } catch (e) {
      Swal.fire({
        title: "Delete failed",
        text: e?.response?.data?.message || "Something went wrong.",
        icon: "error",
      });
    }
  };

  return (
    <div className="pv-col" style={{ gap: 16 }}>
      {/* Filters */}

      <LeadFilters
        filters={filters}
        assignable={assignable}
        setFilter={(key, value) => {
          setFilters((prev) => ({ ...prev, [key]: value }));
          setPage(1);
        }}
        onClear={() => {
          setFilters(DEFAULT_FILTERS);
          setPage(1);
        }}
      />

      {/* Table */}
      <Card
        title="Callback Requests"
        leftActions={
          selectedCount > 0 ? (
            <>
              <ActiveFilterPill
                label={`${selectedCount} selected`}
                showSeparator
                onClear={clearSelection}
                clearTooltip="Clear selection"
              />
            </>
          ) : null
        }
        actions={
          selectedCount > 0 ? (
            <div className="pv-col" style={{ gap: 6 }}>
              <div className="pv-row" style={{ gap: 8, flexWrap: "wrap" }}>
                {bulkArchiveIds.length > 0 && (
                  <Button
                    variant="ghost"
                    onClick={() => bulkArchive(bulkArchiveIds)}
                  >
                    <FaTrashAlt style={{ color: "red" }} />
                    Archive ({bulkArchiveIds.length})
                  </Button>
                )}

                {bulkRestoreIds.length > 0 && (
                  <Button
                    variant="ghost"
                    onClick={() => bulkRestore(bulkRestoreIds)}
                  >
                    <FaArrowRotateLeft />
                    Restore ({bulkRestoreIds.length})
                  </Button>
                )}

                <Button
                  variant="danger"
                  onClick={() => bulkDelete(bulkDeleteIds)}
                >
                  <FaTrashAlt style={{ color: "white" }} />
                  Delete ({bulkDeleteIds.length}) ⚠
                </Button>

                <Button onClick={() => setTransferIds(bulkTransferIds)}>
                  <FaExchangeAlt />
                  Transfer ({bulkTransferIds.length})
                </Button>
              </div>

              {notManageableCount > 0 && (
                <div className="pv-dim" style={{ fontSize: 12 }}>
                  {notManageableCount} selected lead(s) can’t be managed by you
                  and will be ignored.
                </div>
              )}
            </div>
          ) : (
            <Button onClick={() => setCreateLeadOpen(true)}>
              <FaPlus /> Add CB Request
            </Button>
          )
        }
      >
        {loading ? (
          <div
            className="pv-row"
            style={{ justifyContent: "center", padding: 20 }}
          >
            <Spinner size={28} />
          </div>
        ) : items.length === 0 ? (
          <div className="pv-empty">
            <div style={{ fontWeight: 800 }}>No leads found</div>
            <div className="pv-dim">
              Try changing filters or clearing the phone.
            </div>
          </div>
        ) : (
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
                  <th>Source</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                  <th>Next Action</th>
                  <th>Message</th>
                  <th>Note</th>
                  <th className="pv-th-actions">Actions</th>
                </tr>
              </thead>

              <tbody>
                {items.map((lead) => (
                  <tr key={lead._id}>
                    <td>
                      <Tooltip
                        content={
                          !canManageLead(lead)
                            ? "You can’t manage this lead"
                            : "Select lead"
                        }
                      >
                        <div>
                          <Checkbox
                            disabled={!canManageLead(lead)}
                            checked={selectedIds.has(String(lead._id))}
                            onChange={() => toggleOne(lead._id)}
                          />
                        </div>
                      </Tooltip>
                    </td>
                    {/* Name / Email */}
                    <td>
                      <Tooltip content={`View details for ${lead.email}`}>
                        <div
                          className="pv-cell-main"
                          onClick={() => navigate(`/admin/leads/${lead._id}`)}
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

                    {/* Source */}
                    <td>{lead.source || <span className="pv-dim">—</span>}</td>

                    {/* Assigned */}
                    <td>
                      {lead.outreach?.assignedTo ? (
                        // <Tooltip content={String(lead.outreach.assignedTo.name)}>
                        //   <Badge>…{lead.outreach.assignedTo.name}</Badge>
                        // </Tooltip>
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
                              onClick={() => setNoteLead(lead)}
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
                        onViewDetails={() =>
                          navigate(`/admin/leads/${lead._id}`)
                        }
                        onUpdateOutreach={() => setEditLead(lead)}
                        onEditDetails={() => setEditDetailsLead(lead)}
                        onTransfer={() => setTransferIds([lead._id])}
                        onViewLogs={() => setLogsLead(lead)}
                        canUpdate={canManageLead(lead)}
                        canTransfer={canManageLead(lead)}
                        onArchive={() => handleArchive(lead)}
                        onRestore={() => handleRestore(lead)}
                        onDelete={() => handleHardDelete(lead)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div
              className="pv-row"
              style={{
                justifyContent: "space-between",
                padding: 12,
                boxShadow: "0 -10px 16px -12px rgba(0, 0, 0, .22)",
              }}
            >
              <div style={{ color: "var(--pv-dim)" }}>
                {total.toLocaleString()} leads
              </div>

              <Pagination
                page={page}
                total={Math.max(1, Math.ceil(total / limit))}
                onChange={setPage}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Update modal (existing) */}
      <Modal
        isOpen={!!editLead}
        onClose={() => setEditLead(null)}
        title={`Update Outreach – ${editLead?.name || ""}`}
        footer={null}
      >
        {editLead && (
          <OutreachEditor
            lead={editLead}
            onClose={() => setEditLead(null)}
            onSaved={() => {
              setEditLead(null);
              load();
            }}
          />
        )}
      </Modal>

      <Modal
        isOpen={!!noteLead}
        onClose={() => setNoteLead(null)}
        title={`Note – ${noteLead?.name || ""}`}
        footer={
          <div
            className="pv-row"
            style={{ justifyContent: "flex-end", gap: 8 }}
          >
            <Button
              onClick={() => {
                setEditLead(noteLead);
                setNoteLead(null);
              }}
            >
              Update Outreach
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate(`/admin/leads/${noteLead?._id}`)}
            >
              Open Details
            </Button>
          </div>
        }
      >
        {noteLead && (
          <div className="pv-col" style={{ gap: 10 }}>
            <div
              className="pv-dim"
              style={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                overflowWrap: "anywhere",
                maxHeight: 280,
                overflowY: "auto",
                lineHeight: 1.5,
              }}
            >
              {noteLead.outreach?.note}
            </div>
            <div
              className="pv-row"
              style={{ gap: 12, marginTop: 6, flexWrap: "wrap" }}
            >
              <Badge>
                <b>Status:</b>&nbsp;{noteLead.outreach?.status || "New"}
              </Badge>
              {noteLead.outreach?.followUpAt && (
                <Badge>
                  <b>Follow-up:</b>&nbsp;{fmtDate(noteLead.outreach.followUpAt)}
                </Badge>
              )}
              {noteLead.outreach?.lastActivityAt && (
                <Badge>
                  <b>Last activity:</b>&nbsp;
                  {fmtDate(noteLead.outreach.lastActivityAt)}
                </Badge>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Transfer modal */}
      {/* single transfer modal from dropdown menu */}
      {/* <TransferLeadModal
        isOpen={!!transferLead}
        onClose={() => setTransferLead(null)}
        lead={transferLead}
        onTransferred={() => {
          setTransferLead(null);
          load();
        }}
        currentAssigneeId={getAssigneeId(transferLead)}
      /> */}
      <TransferLeadModal
        isOpen={transferIds.length > 0}
        onClose={() => setTransferIds([])}
        leadIds={transferIds}
        title={
          transferIds.length > 1
            ? `Transfer ${transferIds.length} Leads`
            : "Transfer Lead"
        }
        onTransferred={() => {
          setTransferIds([]);
          clearSelection(); // optional (only matters if bulk)
          load();
        }}
      />

      <LeadLogsModal
        isOpen={!!logsLead}
        onClose={() => setLogsLead(null)}
        lead={logsLead}
      />
      <Modal
        isOpen={!!editDetailsLead}
        onClose={() => setEditDetailsLead(null)}
        title={`Edit Lead – ${editDetailsLead?.name || ""}`}
        footer={null}
      >
        {editDetailsLead && (
          <LeadDetailsEditor
            lead={editDetailsLead}
            onClose={() => setEditDetailsLead(null)}
            onSaved={() => {
              setEditDetailsLead(null);
              load(); // refresh list
            }}
          />
        )}
      </Modal>
      <Modal
        isOpen={createLeadOpen}
        onClose={() => setCreateLeadOpen(false)}
        title="Add Callback Request"
        footer={null}
      >
        <CallbackForm
          mode="ops"
          inModal
          onDone={() => {
            setCreateLeadOpen(false);
            load();
          }}
        />
      </Modal>
    </div>
  );
}
