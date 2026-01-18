// src/pages/leads/components/LeadsToolbar.jsx
import { Button, ActiveFilterPill } from "../../../components";
import LeadFilters from "./LeadFilters";
import { FaExchangeAlt, FaPlus, FaTrashAlt } from "react-icons/fa";
import { FaArrowRotateLeft } from "react-icons/fa6";

export default function LeadsToolbar({
  // filters
  filters,
  assignable,
  setFilter,
  onClearFilters,

  // selection / bulk
  selectedCount,
  clearSelection,
  notManageableCount,
  bulkArchiveIds,
  bulkRestoreIds,
  bulkDeleteIds,
  bulkTransferIds,
  onBulkArchive,
  onBulkRestore,
  onBulkDelete,
  onBulkTransfer,

  // create
  onCreate,
}) {
  return (
    <div className="pv-col" style={{ gap: 12 }}>
      <LeadFilters
        filters={filters}
        assignable={assignable}
        setFilter={setFilter}
        onClear={onClearFilters}
      />

      <div
        className="pv-row"
        style={{ justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}
      >
        <div>
          {selectedCount > 0 ? (
            <ActiveFilterPill
              label={`${selectedCount} selected`}
              showSeparator
              onClear={clearSelection}
              clearTooltip="Clear selection"
            />
          ) : null}
        </div>

        <div className="pv-col" style={{ gap: 6, alignItems: "flex-end" }}>
          {selectedCount > 0 ? (
            <div
              className="pv-row"
              style={{ gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}
            >
              {bulkArchiveIds.length > 0 && (
                <Button
                  variant="ghost"
                  onClick={() => onBulkArchive(bulkArchiveIds)}
                  style={{
                    boxShadow: " 0 6px 8px rgba(0, 0, 0, 0.25)",
                    border: "1.5px solid red",
                  }}
                >
                  <FaTrashAlt style={{ color: "red" }} />
                  Archive ({bulkArchiveIds.length})
                </Button>
              )}

              {bulkRestoreIds.length > 0 && (
                <Button
                  variant="ghost"
                  onClick={() => onBulkRestore(bulkRestoreIds)}
                >
                  <FaArrowRotateLeft />
                  Restore ({bulkRestoreIds.length})
                </Button>
              )}

              {/* <Button variant="danger" onClick={() => onBulkDelete(bulkDeleteIds)}>
                <FaTrashAlt style={{ color: "white" }} />
                Delete ({bulkDeleteIds.length}) ⚠
              </Button> */}

              <Button onClick={() => onBulkTransfer(bulkTransferIds)}>
                <FaExchangeAlt />
                Transfer ({bulkTransferIds.length})
              </Button>
            </div>
          ) : (
            <Button
              onClick={onCreate}
              style={{ boxShadow: " 0 6px 8px rgba(0, 0, 0, 0.35)" }}
            >
              <FaPlus /> Add CB Request
            </Button>
          )}

          {selectedCount > 0 && notManageableCount > 0 ? (
            <div className="pv-dim" style={{ fontSize: 12 }}>
              {notManageableCount} selected lead(s) can’t be managed by you and
              will be ignored.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
