import { useState } from "react";
import { Select, Input, Button, Textarea, Alert } from "../../../components";
import toast from "react-hot-toast";
import { updateLeadOutreach } from "../../../services/leads.service";
import { useMemo } from "react";
import { useEffect } from "react";

const STATUS = [
  "New",
  "Contacted",
  "Follow-Up",
  "Meeting Scheduled",
  "Won",
  "Lost",
];

function rulesForStatus(status) {
  switch (status) {
    case "New":
      return {
        showNote: false,
        noteRequired: false,
        showFollowUp: false,
        followUpRequired: false,
      };
    case "Contacted":
      return {
        showNote: true,
        noteRequired: true,
        showFollowUp: true,
        followUpRequired: false,
      };
    case "Follow-Up":
      return {
        showNote: true,
        noteRequired: true,
        showFollowUp: true,
        followUpRequired: true,
      };
    case "Meeting Scheduled":
      return {
        showNote: true,
        noteRequired: false,
        showFollowUp: true,
        followUpRequired: true,
      };
    case "Won":
    case "Lost":
      return {
        showNote: true,
        noteRequired: true,
        showFollowUp: false,
        followUpRequired: false,
      };
    default:
      return {
        showNote: true,
        noteRequired: false,
        showFollowUp: true,
        followUpRequired: false,
      };
  }
}

export default function OutreachEditor({ lead, onClose, onSaved }) {
  // converts a Date/ISO -> "YYYY-MM-DDTHH:mm" in LOCAL time (for datetime-local)
  const toLocalInput = (d) => {
    if (!d) return "";
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return "";
    const tzOff = date.getTimezoneOffset(); // minutes
    date.setMinutes(date.getMinutes() - tzOff);
    return date.toISOString().slice(0, 16);
  };

  // converts "YYYY-MM-DDTHH:mm" (local input) -> ISO string
  const fromLocalInputToIso = (val) => {
    if (!val) return null;
    const date = new Date(val); // interpreted as LOCAL by browser
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
  };

  const [attempted, setAttempted] = useState(false);

  const [status, setStatus] = useState(lead?.outreach?.status || "New");
  const [followUpAt, setFollowUpAt] = useState(() =>
    toLocalInput(lead?.outreach?.followUpAt)
  );
  const [note, setNote] = useState(lead?.outreach?.note || "");
  const [saving, setSaving] = useState(false);

  const rules = useMemo(() => rulesForStatus(status), [status]);

  // UX guard: when switching to statuses where follow-up is irrelevant, clear it.
  useEffect(() => {
    setAttempted(false);
    if (!rules.showFollowUp && followUpAt) setFollowUpAt("");
    if (!rules.showNote && note.trim()) setNote("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const validationError = useMemo(() => {
    const trimmedNote = (note || "").trim();

    if (rules.noteRequired && !trimmedNote) {
      if (status === "Contacted")
        return "Note is required for Contacted (write the call outcome).";
      if (status === "Follow-Up")
        return "Note is required for Follow-Up (mention what was agreed).";
      if (status === "Won")
        return "Note is required for Won (capture what was closed).";
      if (status === "Lost")
        return "Note is required for Lost (capture the reason).";
      return "Note is required.";
    }

    if (rules.followUpRequired) {
      if (!followUpAt) {
        return status === "Meeting Scheduled"
          ? "Meeting time is required."
          : "Follow-up time is required.";
      }
      const iso = fromLocalInputToIso(followUpAt);
      if (!iso) return "Please select a valid follow-up time.";
      // Don’t allow follow-up in the past (allow 1 minute clock skew)
      const d = new Date(iso);
      if (d.getTime() < Date.now() - 60_000) {
        return status === "Meeting Scheduled"
          ? "Meeting time must be in the future."
          : "Follow-up time must be in the future.";
      }
    }

    return "";
  }, [rules, note, followUpAt, status]);

  const helperText = useMemo(() => {
    if (status === "New") return "This request has not been contacted yet.";
    if (status === "Contacted")
      return "Add outcome note. Add follow-up only if next action is needed.";
    if (status === "Follow-Up")
      return "Next action is mandatory: set a follow-up time and note.";
    if (status === "Meeting Scheduled")
      return "Set the meeting date & time. Add meeting details in the note (optional).";
    if (status === "Won")
      return "Capture closure details (amount/fund/plan/next steps).";
    if (status === "Lost")
      return "Capture reason (no interest, already invested, call back later, etc.).";
    return "";
  }, [status]);

  const followUpLabel =
    status === "Meeting Scheduled"
      ? rules.followUpRequired
        ? "Meeting at *"
        : "Meeting at"
      : rules.followUpRequired
      ? "Follow-up at *"
      : "Follow-up at";

  async function save() {
    setAttempted(true);

    if (validationError) {
      // optional: toast only, no scary alert
      toast.error(validationError);
      return;
    }
    setSaving(true);
    try {
      const patch = {};

      const beforeStatus = lead?.outreach?.status || "New";
      const beforeNote = (lead?.outreach?.note || "").trim();
      const beforeFollowLocal = toLocalInput(lead?.outreach?.followUpAt);
      // status
      if (status !== beforeStatus) patch.status = status;

      // note (only if changed)
      const nextNote = (note || "").trim();
      if (nextNote !== beforeNote) patch.note = nextNote;

      // followUpAt (support clear)
      if (followUpAt !== beforeFollowLocal) {
        patch.followUpAt = fromLocalInputToIso(followUpAt); // can be null if cleared
      }

      if (Object.keys(patch).length === 0) {
        toast("No changes to save");
        return;
      }

      await updateLeadOutreach(lead._id, patch);
      toast.success("Updated");
      onSaved?.();
      onClose?.();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Update failed");
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

      {helperText ? (
        <div className="pv-dim" style={{ fontSize: 12 }}>
          {helperText}
        </div>
      ) : null}

      {rules.showNote && (
        <Textarea
          label={rules.noteRequired ? "Note *" : "Note"}
          placeholder={
            status === "Contacted"
              ? "Example: Spoke to client, shared details, asked to call back tomorrow"
              : status === "Lost"
              ? "Example: Not interested / Already has MF / Will invest later"
              : "Short note"
          }
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      )}

      {rules.showFollowUp && (
        <Input
          label={followUpLabel}
          type="datetime-local"
          value={followUpAt}
          onChange={(e) => setFollowUpAt(e.target.value)}
        />
      )}

      {/* {validationError ? (
        <div style={{ fontSize: 12, color: "var(--pv-danger, #b91c1c)" }}>
          {validationError}
        </div>
      ) : null} */}

      {attempted && validationError ? (
        <Alert type="danger">{validationError}</Alert>
      ) : null}

      <div className="pv-row" style={{ justifyContent: "flex-end", gap: 8 }}>
        <Button variant="ghost" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}

// // without condition form
// return (
//     <div className="pv-col" style={{ gap: 10 }}>
//       <Select
//         label="Status"
//         value={status}
//         onChange={(e) => setStatus(e.target.value)}
//       >
//         {STATUS.map((s) => (
//           <option key={s} value={s}>
//             {s}
//           </option>
//         ))}
//       </Select>
//       <Textarea
//         label="Note"
//         placeholder="short note"
//         value={note}
//         onChange={(e) => setNote(e.target.value)}
//       />
//       <Input
//         label="Follow-up at"
//         type="datetime-local"
//         value={followUpAt}
//         onChange={(e) => setFollowUpAt(e.target.value)}
//       />
//       <div className="pv-row" style={{ justifyContent: "flex-end", gap: 8 }}>
//         <Button variant="ghost" onClick={onClose}>
//           Cancel
//         </Button>
//         <Button onClick={save} disabled={saving}>
//           {saving ? "Saving…" : "Save"}
//         </Button>
//       </div>
//     </div>
//   );
// }
