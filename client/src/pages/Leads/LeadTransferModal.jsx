// src/components/modals/TransferLeadModal.jsx
import React, { useEffect, useState } from "react";
import { Modal, Select, Button, Alert, Spinner, Badge } from "../../components";
import toast from "react-hot-toast";
import { useAssignableUsers } from "../../hooks/useUsers"; 

/**
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - lead: the lead object to transfer
 * - onTransferred?: () => void
 * - currentUserId?: string
 */
export default function TransferLeadModal({
  isOpen,
  onClose,
  lead,
  onTransferred,
  currentUserId,
}) {
  // Load assignable users only when the modal opens.
  const { assignable, loading: loadingUsers, error, /*reload*/ } = useAssignableUsers(isOpen);

  const [assigneeId, setAssigneeId] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (isOpen) {
      setAssigneeId("");
      setErr("");
    }
  }, [isOpen, lead?._id]);

  // Optionally surface hook errors in your alert area
  useEffect(() => {
    if (error) setErr(error);
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!assigneeId) return setErr("Please select a user to transfer.");
    if (currentUserId && assigneeId === String(currentUserId)) {
      return setErr("You’re already assigned. Pick a different user.");
    }

    try {
      setSubmitLoading(true);
      // await LeadsAPI.transfer({ leadId: lead._id, assigneeId });
      toast.success("Lead transferred successfully.");
      onClose?.();
      onTransferred?.();
    } catch (e) {
      setErr(e?.message || "Transfer failed");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Transfer Lead – ${lead?.name || ""}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="transfer-lead-form"
            disabled={submitLoading || loadingUsers}
          >
            {submitLoading ? "Transferring…" : "Transfer"}
          </Button>
        </>
      }
    >
      <form
        id="transfer-lead-form"
        onSubmit={handleSubmit}
        className="pv-col"
        style={{ gap: 12 }}
      >
        {err && (
          <Alert type="danger" title="Unable to transfer">
            {err}
          </Alert>
        )}

        <div className="pv-row" style={{ alignItems: "center", gap: 8 }}>
          <span className="pv-dim">Lead:</span>
          <Badge>{lead?.name || "—"}</Badge>
          {lead?.outreach?.assignedTo && (
            <Badge>
              <b>Current:</b>&nbsp;…{String(lead.outreach.assignedTo).slice(-6)}
            </Badge>
          )}
        </div>

        {loadingUsers ? (
          <div className="pv-row" style={{ gap: 8, alignItems: "center" }}>
            <Spinner size={16} />
            <span className="pv-dim">Loading users…</span>
          </div>
        ):(
        <Select
          label="Assign to"
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
          disabled={loadingUsers}
        >
          <option value="">— Select user —</option>
          {assignable.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name}
              {u.email ? ` (${u.email})` : ""}
            </option>
          ))}
        </Select>)}


        {/* Optional manual reload button if you like */}
        {/* <Button onClick={() => reload()} variant="ghost" disabled={loadingUsers}>Reload</Button> */}
      </form>
    </Modal>
  );
}
