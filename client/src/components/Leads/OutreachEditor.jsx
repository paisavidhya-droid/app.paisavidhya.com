import { useState } from "react";
import { Select, Input, Button, Textarea } from "../../components";
import toast from "react-hot-toast";
import { LeadsAPI } from "../../api/leads";

const STATUS = [
  "New",
  "Contacted",
  "Follow-Up",
  "Meeting Scheduled",
  "Won",
  "Lost",
];

export default function OutreachEditor({ lead, onClose, onSaved }) {
  const [status, setStatus] = useState(lead?.outreach?.status || "New");
  const [followUpAt, setFollowUpAt] = useState(
    lead?.outreach?.followUpAt
      ? new Date(lead.outreach.followUpAt).toISOString().slice(0, 16)
      : ""
  );
  const [assignedTo, setAssignedTo] = useState(
    lead?.outreach?.assignedTo || ""
  );
  const [note, setNote] = useState(lead?.outreach?.note || "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const patch = { status, note };
      if (followUpAt) patch.followUpAt = new Date(followUpAt);
      if (assignedTo) patch.assignedTo = assignedTo;
      await LeadsAPI.updateOutreach(lead._id, patch);
      toast.success("Updated");
      onSaved?.();
      onClose?.();
    } catch (e) {
      // console.error('OutreachEditor save error:', e);
      toast.error("Update failed", e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pv-col" style={{ gap: 10 }}>
      <Select
        label="Status"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        {STATUS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </Select>
      <Textarea
        label="Note"
        placeholder="short note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <Input
        label="Follow-up at"
        type="datetime-local"
        value={followUpAt}
        onChange={(e) => setFollowUpAt(e.target.value)}
      />
      <div className="pv-row" style={{ justifyContent: "flex-end", gap: 8 }}>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}
