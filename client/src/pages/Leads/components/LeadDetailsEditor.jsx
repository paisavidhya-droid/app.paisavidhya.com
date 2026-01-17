// client\src\pages\Leads\components\LeadDetailsEditor.jsx

import { useEffect, useMemo, useState } from "react";
import { Button, Input, Select, Alert, Spinner } from "../../../components";
import toast from "react-hot-toast";
import { updateLeadById } from "../../../services/leads.service";

const PREFERRED_TIME_TYPES = [/*"ASAP",*/ "Later", "SCHEDULED"];

export default function LeadDetailsEditor({ lead, onClose, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [preferredTimeType, setPreferredTimeType] = useState("Later");
  const [preferredTimeAt, setPreferredTimeAt] = useState("");

  const toLocalInput = (d) => {
    if (!d) return "";
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return "";
    const tzOff = date.getTimezoneOffset();
    date.setMinutes(date.getMinutes() - tzOff);
    return date.toISOString().slice(0, 16);
  };

  const fromLocalInputToIso = (val) => {
    if (!val) return null;
    const date = new Date(val); // local
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
  };

  useEffect(() => {
    if (!lead) return;
    setErr("");

    setName(lead.name || "");
    setEmail(lead.email || "");
    const type = lead.preferredTimeType || "Later";
    setPreferredTimeType(type);
    setPreferredTimeAt(
      type === "SCHEDULED" ? toLocalInput(lead.preferredTimeAt) : ""
    );
  }, [lead]);

  const patch = useMemo(() => {
    const p = {};

    // Only send fields that changed (clean PATCH)
    if ((lead?.name || "") !== name) p.name = name;
    if ((lead?.email || "") !== email) p.email = email;

    if ((lead?.preferredTimeType || "Later") !== preferredTimeType) {
      p.preferredTimeType = preferredTimeType;
    }

    // preferredTimeAt only if scheduled
    if (preferredTimeType === "SCHEDULED") {
      const iso = preferredTimeAt ? fromLocalInputToIso(preferredTimeAt) : null;
      const beforeLocal = toLocalInput(lead?.preferredTimeAt);
      if (preferredTimeAt !== beforeLocal) p.preferredTimeAt = iso;
    } else {
      if (lead?.preferredTimeAt) p.preferredTimeAt = null;
    }

    return p;
  }, [lead, name, email, preferredTimeType, preferredTimeAt]);

  const canSave = Object.keys(patch).length > 0 && !loading;

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!name.trim()) return setErr("Name is required.");

    if (preferredTimeType === "SCHEDULED" && !preferredTimeAt) {
      return setErr("Please select Scheduled date/time.");
    }

    try {
      setLoading(true);
      const res = await updateLeadById(lead._id, patch);
      toast.success("Lead details updated");
      onSaved?.(res?.lead);
      onClose?.();
    } catch (e2) {
      setErr(e2?.response?.data?.message || e2?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="pv-col" style={{ gap: 12 }} onSubmit={submit}>
      {err && (
        <Alert type="danger" title="Unable to update">
          {err}
        </Alert>
      )}

      <Input
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <Input
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="name@email.com"
      />

      <Select
        label="Preferred Time"
        value={preferredTimeType}
        onChange={(e) => setPreferredTimeType(e.target.value)}
      >
        {PREFERRED_TIME_TYPES.map((x) => (
          <option key={x} value={x}>
            {x}
          </option>
        ))}
      </Select>

      {preferredTimeType === "SCHEDULED" && (
        <Input
          type="datetime-local"
          label="Scheduled At"
          value={preferredTimeAt}
          onChange={(e) => setPreferredTimeAt(e.target.value)}
        />
      )}

      <div className="pv-row" style={{ justifyContent: "flex-end", gap: 8 }}>
        <Button
          variant="ghost"
          type="button"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={!canSave}>
          {loading ? (
            <span className="pv-row" style={{ gap: 8 }}>
              <Spinner size={16} />
              Saving…
            </span>
          ) : (
            "Save"
          )}
        </Button>
      </div>
    </form>
  );
}
