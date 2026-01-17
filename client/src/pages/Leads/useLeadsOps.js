// src/pages/leads/useLeadsOps.js
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

import {
  archiveLeadById,
  bulkArchiveLeads,
  bulkHardDeleteLeads,
  bulkRestoreLeads,
  hardDeleteLeadById,
  listLeads,
  restoreLeadById,
  transferLead,
} from "../../services/leads.service";

const DEFAULT_FILTERS = {
  q: "",
  phone: "",
  status: "",
  assignedTo: "",
  source: "",
  followUp: "", // "" | overdue | today | upcoming
  archiveMode: "active", // active | archived | all
  sort: "recent", // recent | followup | activity
  interests: "", // string (single) OR comma separated
};

export function useLeadsOps({ limit = 10, user, isAdmin }) {
  // filters
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  // paging & data
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // UI states (modals)
  const [createLeadOpen, setCreateLeadOpen] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [noteLead, setNoteLead] = useState(null);
  const [logsLead, setLogsLead] = useState(null);
  const [editDetailsLead, setEditDetailsLead] = useState(null);
  const [transferIds, setTransferIds] = useState([]);

  // selection
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  const fmtDate = useCallback((d) => (d ? new Date(d).toLocaleString() : ""), []);

  const getAssigneeId = useCallback((lead) => {
    const a = lead?.outreach?.assignedTo;
    if (!a) return "";
    return typeof a === "object" ? String(a._id || "") : String(a);
  }, []);

  const canUpdateLead = useCallback(
    (lead) => {
      const assigneeId = getAssigneeId(lead);
      if (isAdmin) return true;
      if (!assigneeId) return false; // 🔒 unassigned => no updates for staff
      return assigneeId === String(user?._id);
    },
    [getAssigneeId, isAdmin, user?._id]
  );

  const canTransferLead = useCallback(
    (lead) => {
      const assigneeId = getAssigneeId(lead);
      if (isAdmin) return true;

      // ✅ allow staff to CLAIM unassigned leads (to self only)
      if (!assigneeId) return true;

      // ✅ allow transfer only if they own it (or keep false if you want stricter)
      return assigneeId === String(user?._id);
    },
    [getAssigneeId, isAdmin, user?._id]
  );


  const isArchived = useCallback((lead) => !!lead?.archivedAt, []);

  const load = useCallback(async () => {
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
        interests: filters.interests,
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
  }, [filters, page, limit]);

  // Debounced auto load
  const tRef = useRef(null);
  useEffect(() => {
    clearTimeout(tRef.current);
    tRef.current = setTimeout(() => load(), 300);
    return () => clearTimeout(tRef.current);
  }, [load]);

  // reset selection whenever page/filters change
  useEffect(() => {
    setSelectedIds(new Set());
  }, [page, filters]);

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  }, []);

  // selection helpers
  const selectedLeads = useMemo(
    () => items.filter((x) => selectedIds.has(String(x._id))),
    [items, selectedIds]
  );

  const selectableLeads = useMemo(() => items.filter(canTransferLead), [items, canTransferLead]);

  const selectedManageable = useMemo(
    () => selectedLeads.filter(canTransferLead),
    [selectedLeads, canTransferLead]
  );

  // for bulk update/archive/etc, use canUpdateLead separately
  const selectedUpdatable = useMemo(
    () => selectedLeads.filter(canUpdateLead),
    [selectedLeads, canUpdateLead]
  );



  const selectedActive = useMemo(
    () => selectedUpdatable.filter((l) => !isArchived(l)),
    [selectedUpdatable, isArchived]
  );

  const selectedArchived = useMemo(
    () => selectedUpdatable.filter((l) => isArchived(l)),
    [selectedUpdatable, isArchived]
  );

  const bulkArchiveIds = useMemo(() => selectedActive.map((l) => l._id), [selectedActive]);
  const bulkRestoreIds = useMemo(() => selectedArchived.map((l) => l._id), [selectedArchived]);
  const bulkDeleteIds = useMemo(() => selectedUpdatable.map((l) => l._id), [selectedUpdatable]);


  const selectedTransferable = useMemo(
    () => selectedLeads.filter(canTransferLead),
    [selectedLeads, canTransferLead]
  );

  const bulkTransferIds = useMemo(
    () => selectedTransferable.map((l) => l._id),
    [selectedTransferable]
  );


  const notManageableCount = useMemo(
    () => selectedLeads.length - selectedManageable.length,
    [selectedLeads, selectedManageable]
  );

  const claimLead = useCallback(
    async (lead) => {
      const res = await Swal.fire({
        title: "Claim this lead?",
        html: `
        <div style="text-align:left">
          <p>This lead is currently <b>unassigned</b>.</p>
          <p>Claiming it will assign the lead to <b>you</b>, and others won’t be able to update it.</p>
        </div>
      `,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Claim lead",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#2563eb",
        reverseButtons: true,
      });

      if (!res.isConfirmed) return;

      try {
        await transferLead({
          leadId: lead._id,
          assigneeId: user?._id,
        });

        toast.success("Lead claimed successfully");
        load();
      } catch (e) {
        toast.error(e?.response?.data?.message || "Failed to claim lead");
      }
    },
    [user?._id, load]
  );




  const selectableIdsOnPage = useMemo(
    () => selectableLeads.map((x) => String(x._id)),
    [selectableLeads]
  );

  const isAllSelectedOnPage = useMemo(() => {
    return selectableIdsOnPage.length > 0 && selectableIdsOnPage.every((id) => selectedIds.has(id));
  }, [selectableIdsOnPage, selectedIds]);

  const selectedCount = selectedIds.size;

  const toggleOne = useCallback((leadId) => {
    const id = String(leadId);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAllOnPage = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected =
        selectableIdsOnPage.length > 0 &&
        selectableIdsOnPage.every((id) => next.has(id));

      if (allSelected) selectableIdsOnPage.forEach((id) => next.delete(id));
      else selectableIdsOnPage.forEach((id) => next.add(id));

      return next;
    });
  }, [selectableIdsOnPage]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  // next action formatter (same as yours)
  const fmtNextAction = useCallback(
    (lead) => {
      const fu = lead?.outreach?.followUpAt;
      const type = lead?.preferredTimeType;
      const pref = lead?.preferredTimeAt;

      if (fu) return `Follow-up • ${fmtDate(fu)}`;
      if (type === "SCHEDULED" && pref) return `Scheduled • ${fmtDate(pref)}`;
      return type && type !== "SCHEDULED" ? type : "ASAP";
    },
    [fmtDate]
  );

  // single actions
  const handleHardDelete = useCallback(
    async (lead) => {
      if (!lead?._id) return;

      const res = await Swal.fire({
        title: "Delete lead?",
        html: `<div style="text-align:left">
          <div><b>${lead.name || "This lead"}</b> will be permanently deleted.</div>
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
        load();
      } catch (e) {
        Swal.fire({
          title: "Delete failed",
          text: e?.response?.data?.message || "Something went wrong.",
          icon: "error",
        });
      }
    },
    [load]
  );

  const handleArchive = useCallback(
    async (lead) => {
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
        toast.error(e?.response?.data?.message || "Failed to archive lead");
      }
    },
    [load]
  );

  const handleRestore = useCallback(
    async (lead) => {
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
        toast.error(e?.response?.data?.message || "Failed to restore lead");
      }
    },
    [load]
  );

  // bulk actions
  const bulkArchive = useCallback(
    async (ids) => {
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
    },
    [clearSelection, load]
  );

  const bulkRestore = useCallback(
    async (ids) => {
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
    },
    [clearSelection, load]
  );

  const bulkDelete = useCallback(
    async (ids) => {
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
    },
    [clearSelection, load]
  );

  return {
    // data
    filters,
    setFilter,
    clearFilters,
    page,
    setPage,
    total,
    items,
    loading,
    limit,
    load,

    // helpers
    fmtDate,
    fmtNextAction,
    canUpdateLead,
    canTransferLead,
    getAssigneeId,
    isArchived,

    // selection
    selectedIds,
    selectedCount,
    toggleOne,
    toggleAllOnPage,
    isAllSelectedOnPage,
    clearSelection,

    selectedLeads,
    selectedManageable,
    notManageableCount,

    bulkArchiveIds,
    bulkRestoreIds,
    bulkDeleteIds,
    bulkTransferIds,

    // actions
    handleArchive,
    handleRestore,
    handleHardDelete,
    bulkArchive,
    bulkRestore,
    bulkDelete,

    // modals/state setters
    createLeadOpen,
    setCreateLeadOpen,
    editLead,
    setEditLead,
    noteLead,
    setNoteLead,
    logsLead,
    setLogsLead,
    editDetailsLead,
    setEditDetailsLead,
    transferIds,
    setTransferIds,
    claimLead,
  };
}

export { DEFAULT_FILTERS };
