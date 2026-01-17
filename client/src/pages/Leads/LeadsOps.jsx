// src/pages/leads/LeadsOps.jsx
import "./leads.css";
import { Card, Pagination, Spinner } from "../../components";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useAssignableUsers } from "../../hooks/useUsers";

import LeadsToolbar from "./components/LeadsToolbar";
import LeadsTable from "./components/LeadsTable";
import LeadsModals from "./components/LeadsModals";

import { useLeadsOps } from "./useLeadsOps";
import { useEffect } from "react";

export default function LeadsOps() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const ops = useLeadsOps({ user, isAdmin, limit: 10 });

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const shouldCreate = params.get("create") === "1";
    if (shouldCreate && !ops.createLeadOpen) {
    ops.setCreateLeadOpen(true);

    // clean URL immediately so it does not re-trigger
    params.delete("create");
    navigate(
      { pathname: location.pathname, search: params.toString() ? `?${params}` : "" },
      { replace: true }
    );
  }
  }, [location.search, location.pathname, navigate, ops]);

  // assignable users for filter dropdown (safe to load on page mount)
  const { assignable = [] } = useAssignableUsers(true);

  const truncate = (txt, n = 40) => {
    if (!txt) return "";
    const s = String(txt);
    return s.length > n ? s.slice(0, n).trim() + "…" : s;
  };

  const fmtNextActionNode = (lead) => {
    const t = ops.fmtNextAction(lead);
    return t === "Later" ? <span>Later</span> : t;
  };

  const goToLead = (id) => navigate(String(id));

  return (
    <div className="pv-container leads-page">
      <div style={{ marginBottom: 16 }}>
        <LeadsToolbar
          filters={ops.filters}
          assignable={assignable}
          setFilter={ops.setFilter}
          onClearFilters={ops.clearFilters}
          selectedCount={ops.selectedCount}
          clearSelection={ops.clearSelection}
          notManageableCount={ops.notManageableCount}
          bulkArchiveIds={ops.bulkArchiveIds}
          bulkRestoreIds={ops.bulkRestoreIds}
          bulkDeleteIds={ops.bulkDeleteIds}
          bulkTransferIds={ops.bulkTransferIds}
          onBulkArchive={ops.bulkArchive}
          onBulkRestore={ops.bulkRestore}
          onBulkDelete={ops.bulkDelete}
          onBulkTransfer={(ids) => ops.setTransferIds(ids)}
          onCreate={() => ops.setCreateLeadOpen(true)}
        />
      </div>

      <Card title="Callback Requests">
        {ops.loading ? (
          <div
            className="pv-row"
            style={{ justifyContent: "center", padding: 20 }}
          >
            <Spinner size={28} />
          </div>
        ) : ops.items.length === 0 ? (
          <div className="pv-empty">
            <div style={{ fontWeight: 800 }}>No leads found</div>
            <div className="pv-dim">
              Try changing filters or clearing the phone.
            </div>
          </div>
        ) : (
          <>
            <LeadsTable
              items={ops.items}
              selectedIds={ops.selectedIds}
              isAllSelectedOnPage={ops.isAllSelectedOnPage}
              toggleAllOnPage={ops.toggleAllOnPage}
              toggleOne={ops.toggleOne}
              canUpdateLead={ops.canUpdateLead}
              canTransferLead={ops.canTransferLead}
              fmtNextActionNode={fmtNextActionNode}
              truncate={truncate}
              onEditOutreach={(lead) => ops.setEditLead(lead)}
              onEditDetails={(lead) => ops.setEditDetailsLead(lead)}
              onTransfer={(lead) => ops.setTransferIds([lead._id])}
              onLogs={(lead) => ops.setLogsLead(lead)}
              onArchive={ops.handleArchive}
              onRestore={ops.handleRestore}
              onDelete={ops.handleHardDelete}
              goToLead={goToLead}
              onClaim={(lead) => ops.claimLead(lead)}
              isAdmin={isAdmin}
            />

            <div
              className="pv-row"
              style={{
                justifyContent: "space-between",
                padding: 12,
                boxShadow: "0 -10px 16px -12px rgba(0, 0, 0, .22)",
              }}
            >
              <div style={{ color: "var(--pv-dim)" }}>
                {ops.total.toLocaleString()} leads
              </div>

              <Pagination
                page={ops.page}
                total={Math.max(1, Math.ceil(ops.total / ops.limit))}
                onChange={ops.setPage}
              />
            </div>
          </>
        )}
      </Card>

      <LeadsModals
        load={ops.load}
        editLead={ops.editLead}
        setEditLead={ops.setEditLead}
        noteLead={ops.noteLead}
        setNoteLead={ops.setNoteLead}
        logsLead={ops.logsLead}
        setLogsLead={ops.setLogsLead}
        editDetailsLead={ops.editDetailsLead}
        setEditDetailsLead={ops.setEditDetailsLead}
        createLeadOpen={ops.createLeadOpen}
        setCreateLeadOpen={ops.setCreateLeadOpen}
        transferIds={ops.transferIds}
        setTransferIds={ops.setTransferIds}
        fmtDate={ops.fmtDate}
        goToLead={goToLead}
      />
    </div>
  );
}
