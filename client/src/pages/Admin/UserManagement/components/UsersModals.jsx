// src/pages/admin/users/components/UsersModals.jsx
import { useEffect, useState } from "react";
import { Button, Input, Modal, Select } from "../../../../components";
/* ---------- Create user Modal ---------- */
function CreateUserForm({ onClose, onSaved }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STAFF"); // backend expects ADMIN/STAFF/CUSTOMER

  const canSubmit =
    name.trim() && email.trim() && phoneNumber.trim() && password.trim();

  return (
    <div className="pv-col" style={{ gap: 10 }}>
      <Input
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Full name"
      />

      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="user@example.com"
      />

      <Input
        label="Phone"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        placeholder="Phone number"
        maxLength={10}
      />

      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Minimum 6 characters"
      />

      <Select
        label="Role"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        {/* <option value="ADMIN">ADMIN</option> */}
        <option value="STAFF">STAFF</option>
        <option value="CUSTOMER">CUSTOMER</option>
      </Select>

      <div className="pv-row" style={{ justifyContent: "flex-end", gap: 8 }}>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          disabled={!canSubmit}
          onClick={() =>
            onSaved({
              name: name.trim(),
              email: email.trim(),
              phoneNumber: phoneNumber.trim(),
              password,
              role,
            })
          }
        >
          Create user
        </Button>
      </div>
    </div>
  );
}

/* ---------- Edit Modal ---------- */
function EditUserForm({ user, onClose, onSaved }) {
  const [role, setRole] = useState(user?.role?.toLowerCase() || "staff");
  const [status, setStatus] = useState(user?.status || "ACTIVE");

  useEffect(() => {
    setRole(user?.role?.toLowerCase() || "staff");
    setStatus(user?.status || "ACTIVE");
  }, [user]);

  return (
    <div className="pv-col" style={{ gap: 10 }}>
      <div>
        <b>Email</b>
        <div className="pv-dim">{user.email || "—"}</div>
      </div>

      <Select
        label="Role"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="admin">admin</option>
        <option value="staff">staff</option>
        <option value="customer">customer</option>
      </Select>

      <Select
        label="Status"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="ACTIVE">active</option>
        <option value="SUSPENDED">suspended</option>
      </Select>

      <div className="pv-row" style={{ justifyContent: "flex-end", gap: 8 }}>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={() =>
            onSaved({
              _id: user._id,
              role,
              status,
            })
          }
        >
          Save changes
        </Button>
      </div>
    </div>
  );
}

export default function UsersModals({
  createUserOpen,
  setCreateUserOpen,
  editUser,
  setEditUser,
  onCreated,
  onEdited,
}) {
  return (
    <>
      <Modal
        isOpen={createUserOpen}
        onClose={() => setCreateUserOpen(false)}
        title="Add User"
        footer={null}
      >
        <CreateUserForm
          onClose={() => setCreateUserOpen(false)}
          onSaved={async (payload) => {
            await onCreated(payload);
            setCreateUserOpen(false);
          }}
        />
      </Modal>

      <Modal
        isOpen={!!editUser}
        onClose={() => setEditUser(null)}
        title={`Edit User – ${editUser?.name || editUser?.email || ""}`}
        footer={null}
      >
        {editUser && (
          <EditUserForm
            user={editUser}
            onClose={() => setEditUser(null)}
            onSaved={async (payload) => {
              await onEdited(payload);
              setEditUser(null);
            }}
          />
        )}
      </Modal>
    </>
  );
}
