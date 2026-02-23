// src/pages/admin/users/components/UsersToolbar.jsx
import { Button, ActiveFilterPill } from "../../../../components";
import UserFilters from "./UserFilters";
import {
  FaUserPlus,
  FaUserSlash,
  FaUserCheck,
  FaTrashAlt,
} from "react-icons/fa";

export default function UsersToolbar({
  filters,
  setFilter,
  onClearFilters,

  selectedCount,
  clearSelection,

  bulkSuspendIds,
  bulkActivateIds,
  bulkDeleteIds,

  onBulkSuspend,
  onBulkActivate,
  onBulkDelete,

  onCreate,
}) {
  return (
    <div className="pv-col" style={{ gap: 12 }}>
      <UserFilters
        filters={filters}
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
              {bulkSuspendIds.length > 0 && (
                <Button
                  variant="ghost"
                  onClick={() => onBulkSuspend(bulkSuspendIds)}
                  style={{
                    boxShadow: "0 6px 8px rgba(0,0,0,.25)",
                    border: "1.5px solid red",
                  }}
                >
                  <FaUserSlash style={{ color: "red" }} />
                  Suspend ({bulkSuspendIds.length})
                </Button>
              )}

              {bulkActivateIds.length > 0 && (
                <Button
                  variant="ghost"
                  onClick={() => onBulkActivate(bulkActivateIds)}
                  style={{
                    boxShadow: "0 6px 8px rgba(0,0,0,.25)",
                    border: "1.5px solid #065f46",
                  }}
                >
                  <FaUserCheck />
                  Activate ({bulkActivateIds.length})
                </Button>
              )}
              {/* {bulkDeleteIds.length > 0 && (
                <Button
                  onClick={() => onBulkDelete(bulkDeleteIds)}
                  className="dlt-hover"
                >
                  <FaTrashAlt />
                  Delete ({bulkDeleteIds.length}) ⚠
                </Button>
              )} */}
            </div>
          ) : (
            <Button
              onClick={onCreate}
              style={{ boxShadow: "0 6px 8px rgba(0,0,0,.35)" }}
            >
              <FaUserPlus size={20} /> Add User
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
