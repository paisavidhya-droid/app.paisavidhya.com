import { useEffect, useMemo, useState } from "react";
import { Card, Button, Select, Checkbox, Alert } from ".";
import toast from "react-hot-toast";
import useUTM from "../hooks/useUTM";
import FloatField from "./ui/FancyInput/FloatField";
import { useNavigate } from "react-router-dom";
import { createLead, createLeadOps } from "../services/leads.service";
import { useAssignableUsers } from "../hooks/useUsers";

function Wrapper({ inModal, children }) {
  if (inModal) return <>{children}</>;
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "grid",
        gridTemplateColumns: "minmax(0,520px)",
        placeContent: "center",
        padding: 24,
      }}
    >
      {children}
    </div>
  );
}

export default function CallbackForm({
  mode = "public",
  inModal = false,
  onDone,
}) {
  const navigate = useNavigate();
  const { utm, page } = useUTM();

  const apiCreate = mode === "ops" ? createLeadOps : createLead;

  const showAssign = mode === "ops";
  const { assignable = [], loading: loadingUsers } =
    useAssignableUsers(showAssign);

  const [assignedTo, setAssignedTo] = useState(""); // "" means unassigned

  useEffect(() => {
    // reset when switching modes/modal open
    if (!showAssign) setAssignedTo("");
  }, [showAssign]);

  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
    interest: "",
    preferredTimeType: "Later",
    preferredTimeAt: "",
    consent: true,
  });

  // prevent scheduling in the past (1 min skew allowed)
  const isPast = useMemo(() => {
    if (form.preferredTimeType !== "SCHEDULED" || !form.preferredTimeAt)
      return false;
    return new Date(form.preferredTimeAt).getTime() < Date.now() - 60_000;
  }, [form.preferredTimeType, form.preferredTimeAt]);

  const disabled =
    !form.name.trim() ||
    !form.phone.trim() ||
    (form.preferredTimeType === "SCHEDULED" && !form.preferredTimeAt);

  async function submit(e) {
    e.preventDefault();
    if (disabled || loading) return;
    setLoading(true);
    setFieldErrors({});
    setSubmitError("");
    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        interests: form.interest ? [form.interest] : [],
        message: form.message.trim() || undefined,
        preferredTimeType: form.preferredTimeType,
        preferredTimeAt:
          form.preferredTimeType === "SCHEDULED"
            ? new Date(form.preferredTimeAt).toISOString()
            : undefined,

        consent: !!form.consent,
        context: { utm, page },
        ...(mode === "ops" && assignedTo ? { outreach: { assignedTo } } : {}),
      };
      const data = await apiCreate(payload, {
        dedupeMinutes: mode === "ops" ? 0 : 10,
      });
      if (inModal) {
        toast.success("Lead added");
        onDone?.(data);
        return; // ✅ don't show success screen / redirect
      }
      toast.success(
        data?.deduped
          ? "We already have your request. We’ll call you shortly."
          : "Thanks! We’ll call you soon."
      );
      setSuccess({
        deduped: !!data?.deduped,
        scheduledAt: data?.preferredTimeAt
          ? new Date(data.preferredTimeAt)
          : null,
      });
      setForm({
        name: "",
        phone: "",
        email: "",
        message: "",
        preferredTimeType: "Later",
        preferredTimeAt: "",
        consent: true,
      });
    } catch (err) {
      const data = err?.response?.data;

      if (
        err?.response?.status === 422 &&
        data?.error === "validation_failed"
      ) {
        setFieldErrors(data?.fields || {});
        toast.error(data?.message || "Please fix the highlighted fields.");
        return;
      }

      toast.error("Something went wrong.");
      setSubmitError("Something went wrong. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  // auto-redirect after success for public form
  useEffect(() => {
    if (inModal) return;
    if (!success) return;
    const t = setTimeout(() => navigate("/"), 5000);
    return () => clearTimeout(t);
  }, [success, navigate, inModal]);

  // --- Success UI ---
  if (!inModal && success) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "grid",
          gridTemplateColumns: "minmax(0,520px)",
          placeContent: "center",
          padding: 24,
        }}
      >
        <Card>
          <div
            className="pv-col"
            style={{
              alignItems: "center",
              gap: 12,
              padding: 12,
              textAlign: "center",
            }}
          >
            <div
              aria-hidden
              style={{
                width: 84,
                height: 84,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                background: "var(--pv-success-bg, #E8F7EE)",
                color: "var(--pv-success-fg, #1F9254)",
                fontSize: 40,
              }}
            >
              ✓
            </div>
            <h2 style={{ margin: 0 }}>Request received!</h2>
            <div className="pv-dim">
              {success.deduped
                ? "We already have your request. Our team will reach out shortly."
                : success.scheduledAt
                ? `We’ll call you at ${success.scheduledAt.toLocaleString(
                    "en-IN",
                    {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    }
                  )}.`
                : "We’ll call you soon."}
            </div>

            <div className="pv-row" style={{ gap: 8, marginTop: 8 }}>
              <Button onClick={() => navigate("/")}>Go to Home</Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setSuccess(null);
                }}
              >
                New Request
              </Button>
            </div>

            <small className="pv-dim">Redirecting to home in 5 seconds…</small>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <Wrapper inModal={inModal}>
      <Card
        title={
          inModal
            ? null
            : mode === "ops"
            ? "Add CB Request"
            : "Request a Callback"
        }
      >
        {isPast && <Alert type="error">Time must be in the future</Alert>}
        {submitError && <Alert type="error">{submitError}</Alert>}
        <form onSubmit={submit} className="pv-col" style={{ gap: 12 }}>
          <FloatField
            label="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            maxLength={120}
            error={fieldErrors.name}
          />
          <FloatField
            label="Mobile"
            value={form.phone}
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value.replace(/\s+/g, "") })
            }
            // hint="+91 will auto-add for 10-digit numbers"
            required
            inputMode="tel"
            maxLength={10}
            error={fieldErrors.phone}
          />

          <FloatField
            label="Email "
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={fieldErrors.email}
          />
          <FloatField
            label="Message (optional)"
            type="textarea"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            maxLength={500}
          />
          <div>
            <Select
              label="I'm looking for"
              value={form.interest}
              onChange={(e) => setForm({ ...form, interest: e.target.value })}
            >
              <option value="">Select an option</option>
              <option value="MutualFunds">MutualFunds</option>
              <option value="Insurance">Insurance</option>
              <option value="FinancialPlanning">Financial Planning</option>
            </Select>
          </div>

          <div>
            <Select
              label="Callback preference"
              value={form.preferredTimeType}
              onChange={(e) =>
                setForm({ ...form, preferredTimeType: e.target.value })
              }
            >
              <option value="Later">Arrange a call</option>
              <option value="SCHEDULED">Schedule</option>
            </Select>
            {form.preferredTimeType === "SCHEDULED" && (
              <FloatField
                label="Pick date & time (IST)"
                type="datetime-local"
                value={form.preferredTimeAt}
                onChange={(e) =>
                  setForm({ ...form, preferredTimeAt: e.target.value })
                }
                required
                error={fieldErrors.preferredTimeAt}
              />
            )}
          </div>
          {showAssign && (
            <Select
              label="Assign to"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              disabled={loadingUsers}
            >
              <option value="">Unassigned</option>
              {assignable.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                  {u.email ? ` (${u.email})` : ""}
                </option>
              ))}
            </Select>
          )}
          {mode !== "ops" && (
            <Checkbox
              label="I consent to be contacted via call/WhatsApp/SMS."
              checked={form.consent}
              onChange={(v) => setForm({ ...form, consent: v })}
            />
          )}
          <Button disabled={disabled || loading || !!isPast}>
            {loading
              ? "Submitting…"
              : mode === "ops"
              ? "Add Request"
              : "Request a Callback"}
          </Button>
        </form>
      </Card>
    </Wrapper>
  );
}
