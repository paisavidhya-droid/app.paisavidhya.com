// import { useEffect, useState } from "react";
// import {
//   Card, Button, Badge, Modal, Pagination, Spinner, Tooltip, Input, Select, Alert,
// } from "../../components";
// import { UsersAPI } from "../../api/users";
// import toast from "react-hot-toast";
// import StatusBadge from "../../components/ui/StatusBadge";

// const ROLES = ["", "admin", "staff", "customer"];
// const STATUS = ["", "active", "disabled"];

// function RowHeader() {
//   return (
//     <div className="pv-row pv-table-head" style={{ fontWeight: 600, minWidth: 980 }}>
//       <div style={{ width: "28%" }}>Name / Email</div>
//       <div style={{ width: "14%" }}>Role</div>
//       <div style={{ width: "14%" }}>Status</div>
//       <div style={{ width: "18%" }}>Last Active</div>
//       <div style={{ width: "16%" }}>Created</div>
//       <div style={{ width: "10%", textAlign: "right" }}>Actions</div>
//     </div>
//   );
// }

// function UserRow({ user, onEdit, onReset, onToggle }) {
//   const fmt = (d) => (d ? new Date(d).toLocaleString() : "—");
//   return (
//     <div className="pv-row pv-table-row" style={{ minWidth: 980 }}>
//       <div style={{ width: "28%" }}>
//         <div style={{ fontWeight: 600 }}>{user.name || "—"}</div>
//         <div className="pv-dim" style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
//           {user.email}
//         </div>
//       </div>
//       <div style={{ width: "14%" }}>
//         <Badge>{user.role || "—"}</Badge>
//       </div>
//       <div style={{ width: "14%" }}>
//         {user.status === "SUSPENDED"
//           ? <StatusBadge status={"Suspended"}/>
//           : <StatusBadge status={"Active"}/>}
//       </div>
//       <div style={{ width: "18%" }}>{fmt(user.lastActiveAt)}</div>
//       <div style={{ width: "16%" }}>{fmt(user.createdAt)}</div>
//       <div style={{ width: "10%", textAlign: "right" }}>
//         <div className="pv-row" style={{ gap: 6, justifyContent: "flex-end" }}>
//           <Button variant="ghost" onClick={() => onEdit(user)}>Edit</Button>
//           <Tooltip content="Send password reset link">
//             <Button variant="ghost" onClick={() => onReset(user)}>Reset</Button>
//           </Tooltip>
//           <Button
//             variant="ghost"
//             onClick={() => onToggle(user)}
//             title={user.status === "SUSPENDED" ? "Activate user" : "Suspend user"}
//           >
//             {user.status === "SUSPENDED" ? "Activate" : "Suspend"}
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function UsersPage() {
//   // filters
//   const [q, setQ] = useState("");
//   const [role, setRole] = useState("");
//   const [status, setStatus] = useState("");

//   // paging and data
//   const [page, setPage] = useState(1);
//   const [total, setTotal] = useState(0);
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [err, setErr] = useState("");

//   // modals
//   const [inviteOpen, setInviteOpen] = useState(false);
//   const [editUser, setEditUser] = useState(null);

//   const limit = 10;
//   const skip = (page - 1) * limit;

//   async function load() {
//     setLoading(true);
//     setErr("");
//     try {
//       const data = await UsersAPI.list({ q, role, status, limit, skip });
//       setItems(data.items || []);
//       setTotal(data.total || 0);
//     } catch (e) {
//       setErr("Failed to load users");
//     } finally {
//       setLoading(false);
//     }
//   }
//   useEffect(() => { load(); /* eslint-disable-next-line */ }, [page]);

//   const applyFilters = () => { setPage(1); load(); };

//   // actions
//   async function handleInvite(form) {
//     try {
//       await UsersAPI.invite(form);
//       toast.success("Invite sent");
//       setInviteOpen(false);
//       load();
//     } catch {
//       toast.error("Failed to send invite");
//     }
//   }
//   async function handleSaveEdit({ _id, role, status }) {
//     try {
//       await UsersAPI.update(_id, { role, status });
//       toast.success("User updated");
//       setEditUser(null);
//       load();
//     } catch {
//       toast.error("Failed to update user");
//     }
//   }
//   async function handleReset(u) {
//     try {
//       await UsersAPI.resetPassword(u._id);
//       toast.success("Reset email sent");
//     } catch {
//       toast.error("Failed to send reset");
//     }
//   }
//   async function handleToggle(u) {
//     const to = u.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
//     try {
//       await UsersAPI.update(u._id, { status: to });
//       toast.success(`User ${to}`);
//       load();
//     } catch {
//       toast.error("Failed to toggle status");
//     }
//   }

//   return (
//     <div className="pv-col" style={{ gap: 16 }}>
//       {/* Header */}
//       <Card>
//         <div className="pv-row" style={{ justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
//           <div className="pv-col" style={{ gap: 2 }}>
//             <div style={{ fontWeight: 800 }}>User management</div>
//             <div className="pv-dim" style={{ fontSize: 12 }}>
//               Create, invite, edit roles, and manage access.
//             </div>
//           </div>
//           <div className="pv-row" style={{ gap: 8 }}>
//             <Button onClick={() => setInviteOpen(true)}>Invite user</Button>
//           </div>
//         </div>
//       </Card>

//       {/* Filters */}
//       <Card>
//         <div className="pv-row" style={{ gap: 8, flexWrap: "wrap", alignItems: "center" }}>
//           <Input placeholder="Search name/email…" value={q} onChange={(e) => setQ(e.target.value)} />
//           <Select value={role} onChange={(e) => setRole(e.target.value)} aria-label="Role filter">
//             {ROLES.map(r => <option key={r || "all"} value={r}>{r || "All roles"}</option>)}
//           </Select>
//           <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status filter">
//             {STATUS.map(s => <option key={s || "all"} value={s}>{s || "All status"}</option>)}
//           </Select>
//           <Button onClick={applyFilters}>Apply</Button>
//         </div>
//       </Card>

//       {err && <Alert type="danger">{err}</Alert>}

//       {/* Table */}
//       <Card title="Users">
//         {loading ? (
//           <div className="pv-row" style={{ justifyContent: "center", padding: 20 }}>
//             <Spinner size={28} />
//           </div>
//         ) : (
//           <div className="pv-col" style={{ gap: 8, overflowX: "auto" }}>
//             <RowHeader />
//             {items.map(u => (
//               <UserRow
//                 key={u._id}
//                 user={u}
//                 onEdit={() => setEditUser(u)}
//                 onReset={handleReset}
//                 onToggle={handleToggle}
//               />
//             ))}
//             <div className="pv-row" style={{ justifyContent: "center", marginTop: 8 }}>
//               <Pagination
//                 page={page}
//                 total={Math.ceil(total / limit)}
//                 onChange={setPage}
//               />
//             </div>
//           </div>
//         )}
//       </Card>

//       {/* Invite modal */}
//       <InviteUserModal
//         isOpen={inviteOpen}
//         onClose={() => setInviteOpen(false)}
//         onSubmit={handleInvite}
//       />

//       {/* Edit modal */}
//       <EditUserModal
//         user={editUser}
//         onClose={() => setEditUser(null)}
//         onSubmit={handleSaveEdit}
//       />
//     </div>
//   );
// }

// /* ---------- Modals ---------- */

// function InviteUserModal({ isOpen, onClose, onSubmit }) {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [role, setRole] = useState("staff");
//   useEffect(() => {
//     if (!isOpen) { setName(""); setEmail(""); setRole("staff"); }
//   }, [isOpen]);
//   return (
//     <Modal
//       isOpen={isOpen}
//       onClose={onClose}
//       title="Invite user"
//       footer={
//         <>
//           <Button variant="ghost" onClick={onClose}>Cancel</Button>
//           <Button onClick={() => onSubmit({ name, email, role })}>Send invite</Button>
//         </>
//       }
//     >
//       <div className="pv-col" style={{ gap: 10 }}>
//         <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
//         <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
//         <Select label="Role" value={role} onChange={(e) => setRole(e.target.value)}>
//           <option value="admin">admin</option>
//           <option value="staff">staff</option>
//           <option value="customer">customer</option>
//         </Select>
//         <div className="pv-dim" style={{ fontSize: 12 }}>
//           An invite email with a sign-in link will be sent.
//         </div>
//       </div>
//     </Modal>
//   );
// }

// function EditUserModal({ user, onClose, onSubmit }) {
//   const [role, setRole] = useState(user?.role || "staff");
//   const [status, setStatus] = useState(user?.status || "active");
//   useEffect(() => {
//     setRole(user?.role || "staff");
//     setStatus(user?.status || "active");
//   }, [user]);
//   if (!user) return null;

//   return (
//     <Modal
//       isOpen={!!user}
//       onClose={onClose}
//       title={`Edit user – ${user.name || user.email}`}
//       footer={
//         <>
//           <Button variant="ghost" onClick={onClose}>Cancel</Button>
//           <Button onClick={() => onSubmit({ _id: user._id, role, status })}>
//             Save changes
//           </Button>
//         </>
//       }
//     >
//       <div className="pv-col" style={{ gap: 10 }}>
//         <div><b>Email</b><div className="pv-dim">{user.email}</div></div>
//         <Select label="Role" value={role} onChange={(e) => setRole(e.target.value)}>
//           <option value="admin">admin</option>
//           <option value="staff">staff</option>
//           <option value="customer">customer</option>
//         </Select>
//         <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
//           <option value="ACTIVE">active</option>
//           <option value="SUSPENDED">Suspend</option>
//         </Select>
//       </div>
//     </Modal>
//   );
// }

// client/src/pages/Admin/Users.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Card, Button, Badge, Pagination, Spinner, Tooltip, Input, Select, Alert,
} from "../../components";
import StatusBadge from "../../components/ui/StatusBadge";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUsers,
  updateUser,
  setUserListFilters,
  setUserListPage,
  selectUsersList,
} from "../../app/slices/userSlice";
import toast from "react-hot-toast";

const ROLES = ["", "admin", "staff", "customer"];
// Back-end uses enums: ACTIVE | SUSPENDED
const STATUS = ["", "ACTIVE", "SUSPENDED"];

function RowHeader() {
  return (
    <div className="pv-row pv-table-head" style={{ fontWeight: 600, minWidth: 980 }}>
      <div style={{ width: "28%" }}>Name / Email</div>
      <div style={{ width: "14%" }}>Role</div>
      <div style={{ width: "14%" }}>Status</div>
      <div style={{ width: "18%" }}>Last Active</div>
      <div style={{ width: "16%" }}>Created</div>
      <div style={{ width: "10%", textAlign: "right" }}>Actions</div>
    </div>
  );
}

function UserRow({ user, onEdit, onToggle }) {
  const fmt = (d) => (d ? new Date(d).toLocaleString() : "—");
  return (
    <div className="pv-row pv-table-row" style={{ minWidth: 980 }}>
      <div style={{ width: "28%" }}>
        <div style={{ fontWeight: 600 }}>{user.name || "—"}</div>
        <div className="pv-dim" style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
          {user.email}
        </div>
      </div>
      <div style={{ width: "14%" }}>
        <Badge>{(user.role || "—").toLowerCase()}</Badge>
      </div>
      <div style={{ width: "14%" }}>
        {user.status === "SUSPENDED"
          ? <StatusBadge status="Suspended" />
          : <StatusBadge status="Active" />}
      </div>
      <div style={{ width: "18%" }}>{fmt(user.lastActiveAt)}</div>
      <div style={{ width: "16%" }}>{fmt(user.createdAt)}</div>
      <div style={{ width: "10%", textAlign: "right" }}>
        <div className="pv-row" style={{ gap: 6, justifyContent: "flex-end" }}>
          <Button variant="ghost" onClick={() => onEdit(user)}>Edit</Button>
          <Tooltip content={user.status === "SUSPENDED" ? "Activate user" : "Suspend user"}>
            <Button
              variant="ghost"
              onClick={() => onToggle(user)}
              title={user.status === "SUSPENDED" ? "Activate user" : "Suspend user"}
            >
              {user.status === "SUSPENDED" ? "Activate" : "Suspend"}
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const dispatch = useDispatch();
  const list = useSelector(selectUsersList);

  // local form state for filters (kept local to avoid committing half-typed input)
  const [q, setQ] = useState(list.filters.q || "");
  const [role, setRole] = useState((list.filters.role || "").toLowerCase());
  const [status, setStatus] = useState(list.filters.status || "");

  // derive page from skip/limit; handle 1-based UI page
  const page = useMemo(() => Math.floor((list.skip || 0) / (list.limit || 10)) + 1, [list.skip, list.limit]);
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((list.total || 0) / (list.limit || 10))),
    [list.total, list.limit]
  );

  useEffect(() => {
    // initial load with whatever is in slice
    dispatch(fetchUsers({
      q: list.filters.q,
      role: list.filters.role,
      status: list.filters.status,
      limit: list.limit,
      skip: list.skip,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = () => {
    // normalize role to backend enums (uppercase) or empty
    const roleEnum = role ? role.toUpperCase() : "";
    const statusEnum = status || "";
    dispatch(setUserListFilters({ q, role: roleEnum, status: statusEnum }));
    // reset to first page
    dispatch(setUserListPage({ limit: list.limit, skip: 0 }));
    dispatch(fetchUsers({ q, role: roleEnum, status: statusEnum, limit: list.limit, skip: 0 }));
  };

  const onChangePage = (nextPage) => {
    const limit = list.limit || 10;
    const skip = (nextPage - 1) * limit;
    dispatch(setUserListPage({ limit, skip }));
    dispatch(fetchUsers({
      q: list.filters.q,
      role: list.filters.role,
      status: list.filters.status,
      limit,
      skip,
    }));
  };

  // actions
  const handleSaveEdit = async ({ _id, role, status }) => {
    try {
      await dispatch(updateUser({
        id: _id,
        patch: {
          role: role ? role.toUpperCase() : undefined,
          status: status ? status.toUpperCase() : undefined,
        },
      })).unwrap();
      toast.success("User updated");
    } catch (e) {
      toast.error(String(e));
    }
  };

  const handleToggle = async (u) => {
    const to = u.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    try {
      await dispatch(updateUser({ id: u._id, patch: { status: to } })).unwrap();
      toast.success(`User ${to === "ACTIVE" ? "activated" : "suspended"}`);
    } catch (e) {
      toast.error(String(e));
    }
  };

  // simple inline edit modal (kept from your component)
  const [editUser, setEditUser] = useState(null);

  return (
    <div className="pv-col" style={{ gap: 16 }}>
      {/* Header */}
      <Card>
        <div className="pv-row" style={{ justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div className="pv-col" style={{ gap: 2 }}>
            <div style={{ fontWeight: 800 }}>User management</div>
            <div className="pv-dim" style={{ fontSize: 12 }}>
              View, edit roles, and manage access.
            </div>
          </div>
          {/* Invite removed as requested for now */}
        </div>
      </Card>

      {/* Filters */}
      <Card>
        <div className="pv-row" style={{ gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <Input placeholder="Search name/email…" value={q} onChange={(e) => setQ(e.target.value)} />
          <Select value={role} onChange={(e) => setRole(e.target.value)} aria-label="Role filter">
            {ROLES.map((r) => <option key={r || "all"} value={r}>{r || "All roles"}</option>)}
          </Select>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status filter">
            {STATUS.map((s) => <option key={s || "all"} value={s}>{s || "All status"}</option>)}
          </Select>
          <Button onClick={applyFilters}>Apply</Button>
        </div>
      </Card>

      {list.error && <Alert type="danger">{list.error}</Alert>}

      {/* Table */}
      <Card title="Users">
        {list.loading ? (
          <div className="pv-row" style={{ justifyContent: "center", padding: 20 }}>
            <Spinner size={28} />
          </div>
        ) : (
          <div className="pv-col" style={{ gap: 8, overflowX: "auto" }}>
            <RowHeader />
            {list.items.map((u) => (
              <UserRow
                key={u._id}
                user={u}
                onEdit={() => setEditUser(u)}
                onToggle={handleToggle}
              />
            ))}
            <div className="pv-row" style={{ justifyContent: "center", marginTop: 8 }}>
              <Pagination page={page} total={totalPages} onChange={onChangePage} />
            </div>
          </div>
        )}
      </Card>

      {/* Edit modal */}
      <EditUserModal
        user={editUser}
        onClose={() => setEditUser(null)}
        onSubmit={handleSaveEdit}
      />
    </div>
  );
}

/* ---------- Edit Modal ---------- */
function EditUserModal({ user, onClose, onSubmit }) {
  const [role, setRole] = useState(user?.role?.toLowerCase() || "staff");
  const [status, setStatus] = useState(user?.status || "ACTIVE");
  useEffect(() => {
    setRole(user?.role?.toLowerCase() || "staff");
    setStatus(user?.status || "ACTIVE");
  }, [user]);
  if (!user) return null;

  return (
    <ModalLikeCard title={`Edit user – ${user.name || user.email}`} onClose={onClose}>
      <div className="pv-col" style={{ gap: 10 }}>
        <div><b>Email</b><div className="pv-dim">{user.email}</div></div>
        <Select label="Role" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="admin">admin</option>
          <option value="staff">staff</option>
          <option value="customer">customer</option>
        </Select>
        <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="ACTIVE">active</option>
          <option value="SUSPENDED">suspended</option>
        </Select>
        <div className="pv-row" style={{ justifyContent: "flex-end", gap: 8 }}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSubmit({ _id: user._id, role, status })}>Save changes</Button>
        </div>
      </div>
    </ModalLikeCard>
  );
}

/* tiny wrapper to emulate your Modal layout with Card */
function ModalLikeCard({ title, onClose, children }) {
  return (
    <Card>
      <div className="pv-row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontWeight: 800 }}>{title}</div>
        <Button variant="ghost" onClick={onClose}>✕</Button>
      </div>
      <div style={{ height: 12 }} />
      {children}
    </Card>
  );
}

