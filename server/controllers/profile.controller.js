// src/controllers/profile.controller.js
import Profile from '../models/profile.model.js';

/** Resolve auth userId safely (supports req.user or req.auth) */
function getAuthUserId(req) {
  return req?.user?.sub || req?.user?._id || req?.user?.id || req?.auth?.sub;
}

/** GET /api/profile/me */
export const getMe = async (req, res, next) => {
  try {
    const userId = getAuthUserId(req);
    const doc = await Profile.findOne({ userId }).lean();
    return res.json({ ok: true, data: doc || null });
  } catch (e) { next(e); }
};

/** PUT /api/profile/me  (upsert) */
export const upsertMe = async (req, res, next) => {
  try {
    const userId = getAuthUserId(req);
    const payload = req.body || {};

    const allowed = {};
    if (payload.name) allowed['name'] = payload.name;
    if (payload.dob) allowed['dob'] = payload.dob;
    if (payload.gender) allowed['gender'] = payload.gender;
    if (payload.primaryPhone) allowed['primaryPhone'] = payload.primaryPhone;
    if (payload.photoUrl) allowed['photoUrl'] = payload.photoUrl;
    if (payload.prefs) allowed['prefs'] = payload.prefs;

    const doc = await Profile.findOneAndUpdate(
      { userId },
      { $set: allowed, $setOnInsert: { userId } },
      { new: true, upsert: true }
    ).lean();

    return res.json({ ok: true, data: doc });
  } catch (e) { next(e); }
};

/** GET /api/profile (admin/staff list) */
export const adminList = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, gender, q } = req.query;
    const filter = {};
    if (gender) filter.gender = gender;
    if (q) {
      filter.$or = [
        { 'name.full': new RegExp(q, 'i') },
        { 'primaryPhone.number': new RegExp(q, 'i') }
      ];
    }
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Profile.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Profile.countDocuments(filter),
    ]);

    return res.json({ ok: true, data: { items, total, page, limit } });
  } catch (e) { next(e); }
};

/** GET /api/profile/:userId (admin/staff) */
export const adminGetByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const doc = await Profile.findOne({ userId }).lean();
    return res.json({ ok: true, data: doc || null });
  } catch (e) { next(e); }
};
