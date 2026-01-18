// controllers/leads.controller.js
import Lead from '../models/leadModel.js';
import { LEAD_SOURCES } from '../models/_enums.js';
import { logLeadActivity } from '../utils/logLeadActivity.js';
import LeadActivityLog from '../models/LeadActivityLog.js';
import { addAudit } from '../utils/audit.js';
import User from '../models/user.model.js';
import { notifyUsers } from '../utils/notify.js';

/**
 * deriveSource:
 * - if body.source is valid (in enum) -> use it
 * - else try UTM source
 * - else fallback to 'Website'
 * - if still unknown, store raw in context.utm.source and set source='Other'
 */
function hostOf(url) {
  try {
    return url ? new URL(url).hostname.replace(/^www\./, "").toLowerCase() : "";
  } catch {
    return "";
  }
}

function deriveSource({ body, headers }) {
  const valid = v => v && LEAD_SOURCES.includes(v);

  const provided = body?.source;
  if (valid(provided)) return { source: provided, raw: null };

  const utmSrc = body?.context?.utm?.source;
  if (valid(utmSrc)) return { source: utmSrc, raw: null };

  const xsrc = headers['x-source'];
  if (valid(xsrc)) return { source: xsrc, raw: null };

  const refHost = hostOf(body?.context?.page?.referrer);
  if (refHost === "paisavidhya.com") {
    return { source: "Website", raw: null };
  }

  // Unknown → mark as Other and preserve raw
  const raw = provided || utmSrc || xsrc || refHost || null;
  return { source: 'Other', raw };
}

function sendValidation(res, fields, status = 422) {
  return res.status(status).json({
    error: "validation_failed",
    message: "Please fix the highlighted fields.",
    fields,
  });
}


/**
 * POST /leads
 * Creates a lead with dedupe by phone within the last X minutes (default 10).
 */
export async function createLead(req, res, next) {
  try {
    const { source, raw } = deriveSource({ body: req.body, headers: req.headers });
    const { name, phone } = req.body || {};
    const fields = {};
    if (!name) fields.name = "Name is required.";
    if (!phone) fields.phone = "Phone is required.";
    if (Object.keys(fields).length) return sendValidation(res, fields, 422);


    // Dedupe window (minutes) optional override via header
    const windowMin = Number(req.headers['x-dedupe-minutes'] || 10);
    const recent = await Lead.findRecentByPhone(phone, windowMin);

    if (recent) {
      // Return the existing record to keep client idempotent
      return res.status(200).json({
        leadId: recent._id,
        deduped: true,
        status: recent.outreach?.status || 'New',
        preferredTimeType: recent.preferredTimeType,
        preferredTimeAt: recent.preferredTimeAt,
      });
    }

    // Prepare payload
    const payload = {
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      message: req.body.message || "",
      source,
      tags: req.body.tags || [],
      interests: req.body.interests || [],
      consent: req.body.consent !== false, // default true
      context: req.body.context || {},
      outreach: req.body.outreach || undefined,
      preferredTimeType: req.body.preferredTimeType || 'Later',
      preferredTimeAt: req.body.preferredTimeAt || undefined,
      notes: Array.isArray(req.body.notes) ? req.body.notes : [],
    };

    // If we had an unknown raw source, persist it in context.utm.source
    if (raw) {
      payload.context.utm = { ...(payload.context.utm || {}), source: String(raw) };
    }

    const lead = await Lead.create(payload);

    const staff = await User.find({ role: { $in: ["ADMIN", "STAFF"] } }).select("_id").lean();
    await notifyUsers(
      staff.map((u) => u._id),
      {
        title: "New Callback Request",
        body: `${lead.name || "Someone"} requested a callback`,
        data: { type: "lead.created", leadId: String(lead._id), screen: "/leads" },
      }
    );

    await logLeadActivity({
      req,
      leadId: lead._id,
      action: "lead_created",
    });


    return res.status(201).json({
      leadId: lead._id,
      deduped: false,
      status: lead.outreach?.status || 'New',
      preferredTimeType: lead.preferredTimeType,
      preferredTimeAt: lead.preferredTimeAt,
    });
  } catch (err) {
    console.log(err);
    
    // Mongoose validation errors
    if (err?.name === "ValidationError") {
      const fields = {};
      for (const [path, info] of Object.entries(err.errors || {})) {
        fields[path] = info?.message || "Invalid value";
      }
      return sendValidation(res, fields, 422);
    }

    next(err);
    // return res.status(500).json({ error: 'internal_error' });
  }
}

export async function createLeadOps(req, res) {
  // Force a source to mark it as manual
  req.body = {
    ...req.body,
    source: req.body.source || "Other",
    context: {
      ...(req.body.context || {}),
      utm: { ...(req.body.context?.utm || {}), source: "manual_ops" },
    },
  };

  // Allow ops to bypass dedupe
  req.headers["x-dedupe-minutes"] = "0";

  return createLead(req, res);
}

/**
 * GET /leads
 * Super-basic list for an ops screen (filterable).
 * Query params: status, source, phone, limit, skip
 */
export async function listLeads(req, res) {
  try {

    // all filters
    // const {
    //       status,
    //       source,
    //       phone,
    //       q,
    //       assignedTo,
    //       interest,
    //       tag,
    //       preferredTimeType,
    //       followUpFrom,
    //       followUpTo,
    //       createdFrom,
    //       createdTo,
    //       archived,     // "active" | "archived" | "all"
    //       sort,         // see below
    //     } = req.query;

    const {
      q,
      status,
      phone,
      source,
      followUp,
      assignedTo,
      interests,
      archiveMode = "active", // active | archived | all
      sort = "recent",        // recent | followup | activity
    } = req.query;
    const limit = Math.min(Number(req.query.limit || 20), 100);
    const skip = Math.max(Number(req.query.skip || 0), 0);


    const now = new Date();
    const qy = {};
    // -------- Archive mode --------
    if (archiveMode === "active") {
      qy.archivedAt = { $exists: false };
    } else if (archiveMode === "archived") {
      qy.archivedAt = { $exists: true };
    }
    // all → no condition

    // -------- Search (name / phone / email) --------
    if (q) {
      const rx = new RegExp(q.trim(), "i");
      qy.$or = [
        { name: rx },
        { email: rx },
      ];
    }

    if (phone) qy.phone = { $regex: String(phone).replace(/\D/g, "") };

    // -------- Status --------
    if (status) qy["outreach.status"] = status;


    // -------- Source --------
    if (source) qy.source = source;

    // -------- Assigned --------
    if (assignedTo) qy["outreach.assignedTo"] = assignedTo;

    // -------- Interests (Request for) --------
    // supports: interests=NPS  OR interests=NPS,Mutual Funds
    // also supports: interests[]=NPS&interests[]=Mutual Funds (array)
    if (interests) {
      const vals = Array.isArray(interests)
        ? interests
        : String(interests).split(",");

      const cleaned = vals
        .map((s) => String(s).trim())
        .filter(Boolean);

      if (cleaned.length) {
        // match ANY selected interest
        qy.interests = { $in: cleaned };

        // if you ever want "must include all selected":
        // qy.interests = { $all: cleaned };
      }
    }


    // -------- Follow-up buckets --------
    if (followUp === "overdue") {
      qy["outreach.followUpAt"] = { $lt: now };
    }
    if (followUp === "today") {
      const start = new Date(now.setHours(0, 0, 0, 0));
      const end = new Date(now.setHours(23, 59, 59, 999));
      qy["outreach.followUpAt"] = { $gte: start, $lte: end };
    }
    if (followUp === "upcoming") {
      qy["outreach.followUpAt"] = { $gt: now };
    }

    // -------- Sorting --------
    let sortBy = { createdAt: -1 };
    if (sort === "followup") sortBy = { "outreach.followUpAt": 1 };
    if (sort === "activity") sortBy = { "outreach.lastActivityAt": -1 };

    const [items, total] = await Promise.all([
      Lead.find(qy)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .populate("outreach.assignedTo", "name email")
        .lean(),
      Lead.countDocuments(qy),
    ]);

    res.json({ total, items });
  } catch (err) {
    console.error('listLeads error:', err);
    res.status(500).json({ error: 'internal_error' });
  }
}


/**
 * GET /api/leads/:id
 * Full document for details page.
 */
export async function getLead(req, res) {
  try {
    const { id } = req.params;
    const doc = await Lead.findById(id).select('-__v').populate("outreach.assignedTo", "name email").populate("archivedBy", "name email").lean();
    if (!doc) return res.status(404).json({ error: 'not_found' });
    res.json(doc);
  } catch (err) {
    next(err)
  }
}


/**
 * PATCH /leads/:id/outreach
 * Minimal outreach updater (status/note/followUpAt/assignedTo).
 */
export async function updateOutreach(req, res) {
  try {
    const { id } = req.params;
    const now = new Date();

    const before = await Lead.findById(id)
      .select("_id outreach.status outreach.followUpAt outreach.assignedTo outreach.note")
      .populate("outreach.assignedTo", "name email")
      .lean();


    if (!before) return res.status(404).json({ error: "not_found" });

    const beforeStatus = before?.outreach?.status ?? null;
    const beforeFollowUpAt = before?.outreach?.followUpAt ?? null;
    const beforeAssignedTo = before?.outreach?.assignedTo ?? null;
    const beforeNote = (before?.outreach?.note || "").trim();
    const incomingNote = typeof req.body.note === "string" ? req.body.note.trim() : null;
    const noteChanged = incomingNote !== null && incomingNote.length > 0 && incomingNote !== beforeNote;



    // Build $set for outreach fields (status/followUp/assigned)
    const set = {};
    if ('status' in req.body) set['outreach.status'] = req.body.status;
    if ('followUpAt' in req.body) set['outreach.followUpAt'] = req.body.followUpAt;
    if ('assignedTo' in req.body) set['outreach.assignedTo'] = req.body.assignedTo;


    const update = { $set: set };

    if (noteChanged) {
      const body = incomingNote; // already trimmed
      update.$set["outreach.note"] = body;
      update.$push = {
        notes: {
          body,
          by: req.user?._id || undefined,
          at: now,
        },
      };
    }

    // ✅ no_updates check (no hasNote)
    const hasAnyFieldUpdate =
      ("status" in req.body) ||
      ("followUpAt" in req.body) ||
      ("assignedTo" in req.body) ||
      noteChanged;

    if (!hasAnyFieldUpdate) {
      return res.status(400).json({ error: "no_updates" });
    }

    const updated = await Lead.findOneAndUpdate(
      { _id: id },
      update,
      { new: true, runValidators: true, context: "query" }
    )
      .select("_id outreach.status outreach.followUpAt outreach.assignedTo outreach.lastActivityAt notes outreach.note")
      .populate("outreach.assignedTo", "name email")
      .lean();

    if (!updated) return res.status(404).json({ error: "not_found" });

    const afterStatus = updated?.outreach?.status ?? null;
    const afterFollowUpAt = updated?.outreach?.followUpAt ?? null;
    const afterAssignedTo = updated?.outreach?.assignedTo ?? null;

    // ✅ safer comparisons
    const iso = (d) => (d ? new Date(d).toISOString() : null);
    const idOf = (v) =>
      v && typeof v === "object" ? String(v._id || "") : v ? String(v) : null;

    if ("status" in req.body && beforeStatus !== afterStatus) {
      await logLeadActivity({
        req,
        leadId: id,
        action: "status_update",
        field: "outreach.status",
        from: beforeStatus,
        to: afterStatus,
      });
    }

    if ("followUpAt" in req.body && iso(beforeFollowUpAt) !== iso(afterFollowUpAt)) {
      await logLeadActivity({
        req,
        leadId: id,
        action: "followUpAt_update",
        field: "outreach.followUpAt",
        from: beforeFollowUpAt,
        to: afterFollowUpAt,
      });
    }

    if ("assignedTo" in req.body && idOf(beforeAssignedTo) !== idOf(afterAssignedTo)) {
      await logLeadActivity({
        req,
        leadId: id,
        action: "assignedTo_update",
        field: "outreach.assignedTo",
        from: beforeAssignedTo,
        to: afterAssignedTo,
      });
    }

    if (noteChanged) {
      await logLeadActivity({
        req,
        leadId: id,
        action: "note_add",
        field: "outreach.note",
        from: before?.outreach?.note ?? null,
        to: incomingNote,
        meta: { noteLength: incomingNote.length },
      });
    }

    return res.json({
      leadId: updated._id,
      status: updated.outreach?.status,
      followUpAt: updated.outreach?.followUpAt,
      assignedTo: updated.outreach?.assignedTo,
      lastActivityAt: updated.outreach?.lastActivityAt,
      notesCount: Array.isArray(updated.notes) ? updated.notes.length : 0,
      latestNote: updated.outreach?.note || null,
    });
  } catch (err) {
    if (err?.name === 'ValidationError') {
      return res.status(422).json({ error: 'validation_failed', details: err.errors });
    }
    console.error('updateOutreach error:', err);
    res.status(500).json({ error: 'internal_error' });
  }
}

// DELETE /leads/:id  (soft delete)
export async function archiveLead(req, res) {
  try {
    const { id } = req.params;
    const now = new Date();
    const patch = {
      archivedAt: now,
      archivedBy: req.user?._id || undefined, // optional
    };
    const doc = await Lead.findOneAndUpdate(
      { _id: id, archivedAt: { $exists: false } },
      { $set: patch },
      { new: true }
    ).select('_id archivedAt archivedBy').lean();

    if (!doc) return res.status(404).json({ error: 'not_found_or_already_archived' });

    await logLeadActivity({
      req,
      leadId: id,
      action: "lead_archived",
      field: "archivedAt",
      from: null,
      to: now,
    });


    res.json({ leadId: doc._id, archivedAt: doc.archivedAt, archivedBy: doc.archivedBy || null });
  } catch (err) {
    console.error('archiveLead error:', err);
    res.status(500).json({ error: 'internal_error' });
  }
}

// POST /leads/:id/restore
export async function restoreLead(req, res) {
  try {
    const { id } = req.params;
    const doc = await Lead.findOneAndUpdate(
      { _id: id, archivedAt: { $exists: true } },
      { $unset: { archivedAt: 1, archivedBy: 1 } },
      { new: true }
    ).select('_id archivedAt').lean();

    if (!doc) return res.status(404).json({ error: 'not_found_or_not_archived' });

    await logLeadActivity({
      req,
      leadId: id,
      action: "lead_restored",
      field: "archivedAt",
      from: true,
      to: null,
    });


    res.json({ leadId: doc._id, archivedAt: null });
  } catch (err) {
    console.error('restoreLead error:', err);
    res.status(500).json({ error: 'internal_error' });
  }
}



// hard delete 
export async function hardDeleteLead(req, res) {
  try {
    const { id } = req.params;

    const before = await Lead.findById(id).select("_id name phone email source").lean();

    // Ensure lead exists
    const exists = await Lead.exists({ _id: id });
    if (!exists) return res.status(404).json({ error: "not_found" });

    // ✅ Purge everything related
    await Promise.all([
      LeadActivityLog.deleteMany({ leadId: id }), // delete logs
      Lead.deleteOne({ _id: id }),               // delete lead (includes embedded notes/outreach)
    ]);

    await addAudit({
      req,
      action: "LEAD:lead_hard_deleted",
      entity: "lead",
      entityId: String(id),
      before: { name: before.name, source: before.source }, // better to avoid phone/email in audit
      after: null,
      meta: {},
    });


    // 204 No Content keeps it clean; change to 200 with JSON if you prefer.
    return res.status(204).end();
  } catch (err) {
    console.error('hardDeleteLead error:', err);
    return res.status(500).json({ error: 'internal_error' });
  }
}


/*
The below code is not implemented in the frontend and there is no route for it 
*/

// PATCH /leads/:id/notes
export async function addNote(req, res) {
  try {
    const { id } = req.params;
    const body = (req.body?.body || '').trim();
    if (!body) return res.status(400).json({ error: 'note_body_required' });

    const now = new Date();
    const update = {
      $push: { notes: { body, by: req.user?._id || undefined, at: now } },
      $set: { 'outreach.note': body },
    };

    const doc = await Lead.findOneAndUpdate({ _id: id }, update, { new: true, runValidators: true, context: 'query' })
      .select('_id notes outreach.lastActivityAt outreach.note')
      .lean();

    if (!doc) return res.status(404).json({ error: 'not_found' });

    await logLeadActivity({
      req,
      leadId: id,
      action: "note_add",
      field: "notes",
      from: null,
      to: body,
      meta: { noteLength: body.length },
    });


    res.json({
      leadId: doc._id,
      notesCount: doc.notes.length,
      lastActivityAt: doc.outreach.lastActivityAt,
      latestNote: doc.outreach.note,
    });
  } catch (err) {
    console.error('addNote error:', err);
    res.status(500).json({ error: 'internal_error' });
  }
}


export async function updateLead(req, res) {
  try {
    const { id } = req.params;
    const now = new Date();

    const before = await Lead.findById(id)
      .select("name phone email preferredTimeType preferredTimeAt")
      .lean();

    if (!before) return res.status(404).json({ error: "not_found" });

    // ✅ Only fields your UI allows editing
    const allowed = [
      "name",
      "email",
      "preferredTimeType",
      "preferredTimeAt",
      // "phone", // enable ONLY if you want staff/admin to edit phone
    ];

    const set = {};
    for (const k of allowed) {
      if (k in req.body) set[k] = req.body[k];
    }

    if (Object.keys(set).length === 0) {
      return res.status(400).json({ error: "no_updates" });
    }

    set["outreach.lastActivityAt"] = now;

    const updated = await Lead.findOneAndUpdate(
      { _id: id },
      { $set: set },
      { new: true, runValidators: true, context: "query" }
    )
      .select("name phone email preferredTimeType preferredTimeAt outreach")
      .populate("outreach.assignedTo", "name email")
      .lean();

    // ✅ fields changed (exclude activity bump)
    const changedFields = Object.keys(set).filter((k) => k !== "outreach.lastActivityAt");

    // ✅ Lead Activity Log: store only changed fields (UI-friendly)
    const beforeMini = {};
    const afterMini = {};
    for (const f of changedFields) {
      beforeMini[f] = before?.[f] ?? null;
      afterMini[f] = updated?.[f] ?? null;
    }

    await logLeadActivity({
      req,
      leadId: id,
      action: "lead_details_updated",
      field: "lead",
      from: beforeMini,
      to: afterMini,
      meta: { changedFields },
      audit: "skip", // because we are writing addAudit below
    });

    // ✅ Global Audit: safe summaries (no raw message/email/phone)
    const beforeAudit = {};
    const afterAudit = {};

    for (const f of changedFields) {
      if (f === "email") {
        beforeAudit.email = before?.email ? "[updated]" : null;
        afterAudit.email = updated?.email ? "[updated]" : null;
      } else if (f === "phone") {
        const mask = (p) => (p ? `***${String(p).slice(-4)}` : null);
        beforeAudit.phone = mask(before?.phone);
        afterAudit.phone = mask(updated?.phone);
      } else {
        beforeAudit[f] = before?.[f] ?? null;
        afterAudit[f] = updated?.[f] ?? null;
      }
    }

    await addAudit({
      req,
      action: "LEAD:lead_details_updated",
      entity: "lead",
      entityId: String(id),
      before: beforeAudit,
      after: afterAudit,
      meta: { changedFields },
    });

    return res.json({ ok: true, lead: updated });
  } catch (err) {
    if (err?.name === "ValidationError") {
      return res
        .status(422)
        .json({ error: "validation_failed", details: err.errors });
    }
    console.error("updateLead error:", err);
    return res.status(500).json({ error: "internal_error" });
  }
}



// POST /leads/bulk/archive
export async function bulkArchiveLeads(req, res) {
  try {
    const { leadIds } = req.body || {};
    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({ error: "leadIds_required" });
    }

    const now = new Date();
    const archivedBy = req.user?._id || undefined;

    // Only archive those that are not archived yet
    const q = { _id: { $in: leadIds }, archivedAt: { $exists: false } };

    const result = await Lead.updateMany(q, {
      $set: { archivedAt: now, archivedBy },
    });

    // Log activity per lead (lightweight)
    // If you want max performance later, we can do insertMany logs.
    for (const id of leadIds) {
      await logLeadActivity({
        req,
        leadId: id,
        action: "lead_archived",
        field: "archivedAt",
        from: null,
        to: now,
      });
    }

    return res.json({
      ok: true,
      matched: result.matchedCount ?? result.n ?? 0,
      modified: result.modifiedCount ?? result.nModified ?? 0,
      archivedAt: now,
    });
  } catch (err) {
    console.error("bulkArchiveLeads error:", err);
    return res.status(500).json({ error: "internal_error" });
  }
}

export async function bulkRestoreLeads(req, res) {
  try {
    const { leadIds } = req.body || {};
    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({ error: "leadIds_required" });
    }

    const q = { _id: { $in: leadIds }, archivedAt: { $exists: true } };

    const result = await Lead.updateMany(q, {
      $unset: { archivedAt: 1, archivedBy: 1 },
    });

    for (const id of leadIds) {
      await logLeadActivity({
        req,
        leadId: id,
        action: "lead_restored",
        field: "archivedAt",
        from: true,
        to: null,
      });
    }

    return res.json({
      ok: true,
      matched: result.matchedCount ?? result.n ?? 0,
      modified: result.modifiedCount ?? result.nModified ?? 0,
    });
  } catch (err) {
    console.error("bulkRestoreLeads error:", err);
    return res.status(500).json({ error: "internal_error" });
  }
}





export async function bulkTransferLeads(req, res) {
  try {
    const { leadIds, assigneeId } = req.body || {};
    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({ error: "leadIds_required" });
    }
    if (!assigneeId) {
      return res.status(400).json({ error: "assigneeId_required" });
    }

    const now = new Date();

    const result = await Lead.updateMany(
      { _id: { $in: leadIds } },
      {
        $set: {
          "outreach.assignedTo": assigneeId,
        },
      }
    );

    for (const id of leadIds) {
      await logLeadActivity({
        req,
        leadId: id,
        action: "assignedTo_update",
        field: "outreach.assignedTo",
        from: null,
        to: assigneeId,
      });
    }

    return res.json({
      ok: true,
      matched: result.matchedCount ?? result.n ?? 0,
      modified: result.modifiedCount ?? result.nModified ?? 0,
      assignedTo: assigneeId,
    });
  } catch (err) {
    console.error("bulkTransferLeads error:", err);
    return res.status(500).json({ error: "internal_error" });
  }
}




export async function bulkHardDeleteLeads(req, res) {
  try {
    const { leadIds } = req.body || {};
    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({ error: "leadIds_required" });
    }

    // Delete logs + leads
    const [logsRes, leadsRes] = await Promise.all([
      LeadActivityLog.deleteMany({ leadId: { $in: leadIds } }),
      Lead.deleteMany({ _id: { $in: leadIds } }),
    ]);

    await addAudit({
      req,
      action: "LEAD:bulk_hard_delete",
      entity: "lead",
      entityId: null,
      before: { count: leadIds.length },
      after: null,
      meta: {
        deletedLeads: leadsRes?.deletedCount ?? 0,
        deletedLogs: logsRes?.deletedCount ?? 0,
      },
    });

    return res.json({
      ok: true,
      deletedLeads: leadsRes?.deletedCount ?? 0,
      deletedLogs: logsRes?.deletedCount ?? 0,
    });
  } catch (err) {
    console.error("bulkHardDeleteLeads error:", err);
    return res.status(500).json({ error: "internal_error" });
  }
}
