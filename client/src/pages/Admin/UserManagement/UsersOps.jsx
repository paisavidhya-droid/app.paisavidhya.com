// client\src\pages\Admin\UserManagement\UsersOps.jsx

import "../../Leads/leads.css";
import "../../Dashboards/dashboard.css";

import { Card, Pagination, Spinner, Alert, Button, Tooltip } from "../../../components";
import ModuleHeader from "../../../components/ui/moduleHeader/ModuleHeader";
import { FaArrowRotateRight } from "react-icons/fa6";

import UsersToolbar from "./components/UsersToolbar";
import UsersTable from "./components/UsersTable";
import UsersModals from "./components/UsersModals";

import { useUsersOps } from "./useUsersOps";

export default function UsersOps() {
  const ops = useUsersOps({ limit: 10 });

  return (
    <div className="pv-container leads-page">
      <ModuleHeader
        title="User Management"
        subtitle="View, edit roles, and manage access."
        routeLabels={{
          admin: "Admin",
          usermanagement: "User Management",
          users: "Users",
        }}
        actions={
          <Tooltip content={ops.loading ? "Refreshing…" : "Refresh users"}>
            <Button
              variant="ghost"
              onClick={ops.refresh}
              disabled={ops.loading}
              style={{ padding: "12px" }}
            >
              <FaArrowRotateRight className={ops.loading ? "animate-spin" : ""} />
            </Button>
          </Tooltip>
        }
      />

      <div style={{ marginBottom: 16 }}>
        <UsersToolbar
          filters={ops.filters}
          setFilter={ops.setFilter}
          onClearFilters={ops.clearFilters}
          selectedCount={ops.selectedCount}
          clearSelection={ops.clearSelection}
          bulkSuspendIds={ops.bulkSuspendIds}
          bulkActivateIds={ops.bulkActivateIds}
          bulkDeleteIds={ops.bulkDeleteIds}
          onBulkSuspend={ops.bulkSuspend}
          onBulkActivate={ops.bulkActivate}
          onBulkDelete={ops.bulkDelete}
          onCreate={() => ops.setCreateUserOpen(true)}
        />
      </div>

      {ops.error && <Alert type="danger">{ops.error}</Alert>}

      <Card title="Users">
        {ops.loading ? (
          <div className="pv-row" style={{ justifyContent: "center", padding: 20 }}>
            <Spinner size={28} />
          </div>
        ) : ops.items.length === 0 ? (
          <div className="pv-empty">
            <div style={{ fontWeight: 800 }}>No users found</div>
            <div className="pv-dim">Try changing filters or clearing the search.</div>
          </div>
        ) : (
          <>
            <UsersTable
              items={ops.items}
              selectedIds={ops.selectedIds}
              isAllSelectedOnPage={ops.isAllSelectedOnPage}
              toggleAllOnPage={ops.toggleAllOnPage}
              toggleOne={ops.toggleOne}
              goToUser={ops.goToUser}
              onEdit={(u) => ops.setEditUser(u)}
              onToggleStatus={ops.toggleStatus}
              onDelete={ops.deleteOne}
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
                {ops.total.toLocaleString()} users
              </div>

              <Pagination page={ops.page} total={ops.totalPages} onChange={ops.setPage} />
            </div>
          </>
        )}
      </Card>

      <UsersModals
        createUserOpen={ops.createUserOpen}
        setCreateUserOpen={ops.setCreateUserOpen}
        editUser={ops.editUser}
        setEditUser={ops.setEditUser}
        onCreated={ops.onCreated}
        onEdited={ops.onEdited}
      />
    </div>
  );
}