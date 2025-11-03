// controllers/leads.controller.js
import Lead from '../models/leadModel.js';
import { LEAD_SOURCES } from '../models/_enums.js';

/**
 * deriveSource:
 * - if body.source is valid (in enum) -> use it
 * - else try UTM source
 * - else fallback to 'Website'
 * - if still unknown, store raw in context.utm.source and set source='Other'
 */
function deriveSource({ body, headers }) {
  const valid = v => v && LEAD_SOURCES.includes(v);

  const provided = body?.source;
  if (valid(provided)) return { source: provided, raw: null };

  const utmSrc = body?.context?.utm?.source;
  if (valid(utmSrc)) return { source: utmSrc, raw: null };

  const xsrc = headers['x-source'];
  if (valid(xsrc)) return { source: xsrc, raw: null };

  // Unknown → mark as Other and preserve raw
  const raw = provided || utmSrc || xsrc || null;
  return { source: 'Other', raw };
}


/**
 * POST /leads
 * Creates a lead with dedupe by phone within the last X minutes (default 10).
 */
export async function createLead(req, res) {
  try {
    const { source, raw } = deriveSource({ body: req.body, headers: req.headers });
    const { name, phone } = req.body || {};
    if (!name || !phone) {
      return res.status(400).json({ error: 'name and phone are required' });
    }

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
      preferredTimeType: req.body.preferredTimeType || 'ASAP',
      preferredTimeAt: req.body.preferredTimeAt || undefined,
      notes: Array.isArray(req.body.notes) ? req.body.notes : [],
    };

    // If we had an unknown raw source, persist it in context.utm.source
    if (raw) {
      payload.context.utm = { ...(payload.context.utm || {}), source: String(raw) };
    }

    const lead = await Lead.create(payload);

    return res.status(201).json({
      leadId: lead._id,
      deduped: false,
      status: lead.outreach?.status || 'New',
      preferredTimeType: lead.preferredTimeType,
      preferredTimeAt: lead.preferredTimeAt,
    });
  } catch (err) {
    // Mongoose validation errors
    if (err?.name === 'ValidationError') {
      return res.status(422).json({ error: 'validation_failed', details: err.errors });
    }
    console.error('createLead error:', err);
    return res.status(500).json({ error: 'internal_error' });
  }
}

/**
 * GET /leads
 * Super-basic list for an ops screen (filterable).
 * Query params: status, source, phone, limit, skip
 */
export async function listLeads(req, res) {
  try {
    const { status, source, phone } = req.query;
    const limit = Math.min(Number(req.query.limit || 20), 100);
    const skip = Math.max(Number(req.query.skip || 0), 0);

    const incArchived = String(req.query.includeArchived || '').toLowerCase();
    const includeArchived = incArchived === '1' || incArchived === 'true' || incArchived === 'yes';

    const q = {};
    if (!includeArchived) q.archivedAt = { $exists: false };
    if (status) q['outreach.status'] = status;
    if (source) q.source = source;
    if (phone) q.phone = phone;

    const [items, total] = await Promise.all([
      Lead.find(q).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Lead.countDocuments(q),
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
    const doc = await Lead.findById(id).select('-__v').lean();
    if (!doc) return res.status(404).json({ error: 'not_found' });
    res.json(doc);
  } catch (err) {
    console.error('getLead error:', err);
    res.status(500).json({ error: 'internal_error' });
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

    // Build $set for outreach fields (status/followUp/assigned)
    const set = { 'outreach.lastActivityAt': now };
    if ('status' in req.body) set['outreach.status'] = req.body.status;
    if ('followUpAt' in req.body) set['outreach.followUpAt'] = req.body.followUpAt;
    if ('assignedTo' in req.body) set['outreach.assignedTo'] = req.body.assignedTo;

    // If note present, set latest note preview AND push to notes history
    const update = { $set: set };
    const hasNote = typeof req.body.note === 'string' && req.body.note.trim().length > 0;
    if (hasNote) {
      const body = req.body.note.trim();
      update.$set['outreach.note'] = body; // keep latest visible
      update.$push = {
        notes: {
          body,
          by: req.user?._id || undefined, // if you have auth, otherwise omit
          at: now,
        },
      };
    }

    if (!hasNote && Object.keys(set).length === 1 && !('status' in req.body) && !('followUpAt' in req.body) && !('assignedTo' in req.body)) {
      return res.status(400).json({ error: 'no_updates' });
    }

    const updated = await Lead.findOneAndUpdate(
      { _id: id },
      update,
      { new: true, runValidators: true, context: 'query' }
    )
      .select('_id outreach.status outreach.followUpAt outreach.assignedTo outreach.lastActivityAt notes')
      .lean();

    if (!updated) return res.status(404).json({ error: 'not_found' });

    res.json({
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

    const result = await Lead.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'not_found' });
    }
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
      $set: { 'outreach.note': body, 'outreach.lastActivityAt': now },
    };

    const doc = await Lead.findOneAndUpdate({ _id: id }, update, { new: true, runValidators: true, context: 'query' })
      .select('_id notes outreach.lastActivityAt outreach.note')
      .lean();

    if (!doc) return res.status(404).json({ error: 'not_found' });
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
