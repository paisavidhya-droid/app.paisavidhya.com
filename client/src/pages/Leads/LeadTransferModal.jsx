// src/components/modals/TransferLeadModal.jsx
import  { useEffect, useState } from "react";
import {
  Modal,
  Button,
  Alert,
  Spinner,
  Badge,
  SearchNSelect,
} from "../../components";
import toast from "react-hot-toast";
import { useAssignableUsers } from "../../hooks/useUsers";
import { bulkTransferLeads, transferLead } from "../../services/leads.service";
import { useMemo } from "react";

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
  leadIds = [],
  title,
  onTransferred,
  currentAssigneeId,
}) {
  // Load assignable users only when the modal opens.
  const {
    assignable = [],
    loading: loadingUsers,
    error,
  } = useAssignableUsers(isOpen);

  const [assigneeId, setAssigneeId] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [err, setErr] = useState("");

  const mode = useMemo(() => {
    if (Array.isArray(leadIds) && leadIds.length > 0) return "bulk";
    if (lead?._id) return "single";
    return "none";
  }, [lead?._id, leadIds]);

  const bulkCount = leadIds?.length || 0;

  useEffect(() => {
    if (isOpen) {
      setAssigneeId("");
      setErr("");
    }
  }, [isOpen, lead?._id, bulkCount]);

  useEffect(() => {
    if (error) setErr(error);
  }, [error]);

  const userOptions = assignable.map((u) => ({
    value: u._id,
    label: u.name,
    subLabel: u.email || "",
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (mode === "none") return setErr("No lead selected.");
    if (!assigneeId) return setErr("Please select a user to transfer.");

    // Single lead check: don't transfer to same user
    if (
      mode === "single" &&
      currentAssigneeId &&
      assigneeId === String(currentAssigneeId)
    ) {
      return setErr("You’re already assigned. Pick a different user.");
    }

    try {
      setSubmitLoading(true);

      if (mode === "single") {
        await transferLead({ leadId: lead._id, assigneeId });
      } else {
        await bulkTransferLeads({ leadIds, assigneeId });
      }

      toast.success(
        mode === "single"
          ? "Lead transferred successfully."
          : `Transferred ${bulkCount} lead(s) successfully.`
      );

      onClose?.();
      onTransferred?.();
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Transfer failed");
    } finally {
      setSubmitLoading(false);
    }
  };

  const modalTitle =
    title ||
    (mode === "bulk"
      ? `Transfer Leads (${bulkCount})`
      : `Transfer Lead – ${lead?.name || ""}`);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="transfer-lead-form"
            disabled={submitLoading || loadingUsers || mode === "none"}
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

        {mode === "single" && (
          <div className="pv-row" style={{ alignItems: "center", gap: 8 }}>
            <span className="pv-dim">Lead:</span>
            <Badge>{lead?.name || "—"}</Badge>
            {lead?.outreach?.assignedTo && (
              <Badge>
                <b>Current:</b>&nbsp;{lead.outreach.assignedTo.name}
              </Badge>
            )}
          </div>
        )}

        {mode === "bulk" && (
          <div className="pv-row" style={{ alignItems: "center", gap: 8 }}>
            <span className="pv-dim">Selected:</span>
            <Badge>
              <b>{bulkCount}</b>&nbsp;leads
            </Badge>
          </div>
        )}

        {loadingUsers ? (
          <div className="pv-row" style={{ gap: 8, alignItems: "center" }}>
            <Spinner size={16} />
            <span className="pv-dim">Loading users…</span>
          </div>
        ) : (
          <SearchNSelect
            label="Assign to"
            value={assigneeId}
            onChange={(val) => setAssigneeId(val)}
            options={userOptions}
            disabled={loadingUsers}
            loading={loadingUsers}
            placeholder="— Select user —"
            clearable
            style={{position:"relative"}}
          />
        )}

        {/* Optional manual reload button if you like */}
        {/* <Button onClick={() => reload()} variant="ghost" disabled={loadingUsers}>Reload</Button> */}
      </form>
    </Modal>
  );
}
