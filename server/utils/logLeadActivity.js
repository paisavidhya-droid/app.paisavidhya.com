// server/utils/logLeadActivity.js
import LeadActivityLog from "../models/LeadActivityLog.js";
import { shouldAuditGlobally } from "./logPolicy.js";
import { addAudit } from "./audit.js";

const getUserId = (req, explicitUserId) => explicitUserId ?? req?.user?._id ?? null;

const isObject = (v) => v && typeof v === "object" && !Array.isArray(v);

const safePreview = (s, n = 60) => {
  const t = String(s || "").trim();
  if (!t) return "";
  return t.length > n ? t.slice(0, n).trim() + "…" : t;
};

const toId = (v) => {
  if (!v) return null;
  if (typeof v === "string") return v;
  if (isObject(v) && v._id) return String(v._id);
  if (v?.toString) return String(v);
  return null;
};

const userLabel = (u) => {
  if (!u) return null;
  if (typeof u === "string") return null; // id only
  if (isObject(u) && (u.name || u.email)) {
    const n = u.name || "User";
    const e = u.email ? ` (${u.email})` : "";
    return `${n}${e}`;
  }
  return null;
};

const normalizeByField = ({ action, field, value }) => {

   if (field === "outreach.assignedTo") {
    if (!value) return { id: null, label: "Unassigned" };
    const id = toId(value);
    const label = userLabel(value);
    return { id, label: label || "Assigned" };
  }
  if (value == null) return null;

 
  // followUpAt -> {iso,label}
  if (field === "outreach.followUpAt") {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return { iso: String(value) };
    return { iso: d.toISOString(), label: d.toLocaleString() };
  }

  // status -> plain string
  if (field === "outreach.status") return String(value);

  // note -> keep preview + length (avoid huge text in logs)
  if (field === "outreach.note" || action === "note_add") {
    const text = String(value || "").trim();
    return {
      preview: safePreview(text, 80),
      len: text.length,
    };
  }

  // lead details update -> expect object; keep minimal
  if (action === "lead_details_updated") {
    // value is usually object; store as-is but trimmed
    if (isObject(value)) {
      const out = {};
      for (const k of Object.keys(value)) {
        if (k === "message") out.messageLen = String(value.message || "").length;
        else if (k === "email") out.email = value.email ? "[updated]" : null;
        else if (k === "phone") out.phone = value.phone ? `***${String(value.phone).slice(-4)}` : null;
        else out[k] = value[k];
      }
      return out;
    }
    return value;
  }

  // default: avoid dumping huge objects
  if (isObject(value)) return value; // ok for small
  return value;
};

export async function logLeadActivity({
  req,
  leadId,
  action,
  field = null,
  from = null,
  to = null,
  meta = {},
  userId = null,
  audit = "auto", // "auto" | "skip" | "force"
}) {
  try {
    if (!leadId || !action) return;

    const requestId =
      req?.headers?.["x-request-id"] ||
      req?.headers?.["x-correlation-id"] ||
      null;

    const normFrom = normalizeByField({ action, field, value: from });
    const normTo = normalizeByField({ action, field, value: to });

    const doc = {
      leadId,
      userId: getUserId(req, userId),
      action,
      field,
      from: normFrom,
      to: normTo,
      meta: meta || {},
      ip: req?.ip,
      userAgent: req?.headers?.["user-agent"],
      requestId,
    };

    await LeadActivityLog.create(doc);

    const allowAudit =
      audit === "force" ||
      (audit === "auto" && shouldAuditGlobally?.({ action, field }));

    if (allowAudit) {
      await addAudit({
        req,
        action: `LEAD:${action}`,
        entity: "lead",
        entityId: leadId?.toString?.() || String(leadId),
        before: normFrom,
        after: normTo,
        meta: { ...(meta || {}), field, requestId },
      });
    }
  } catch (err) {
    console.error("logLeadActivity failed:", err?.message || err);
  }
}
