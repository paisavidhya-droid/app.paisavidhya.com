// controllers/profile.controller.js
import Profile from '../models/profile.model.js';
import { addAudit } from '../utils/audit.js';

const getAuthUserId = (req) => {
  return req.auth?.sub || req.user?.sub || req.user?._id;
};

/** GET /api/profiles/me  (auth) */
const getMyProfile = async (req, res, next) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const profile = await Profile.findOne({ userId }).lean();
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json({ profile });
  } catch (err) {
    next(err);
  }
};

/** PUT/PATCH /api/profiles/me  (auth) – create or update own profile */
const upsertMyProfile = async (req, res, next) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const patch = { ...req.body };

    // If primaryPhone.number is changed, reset verified
    if (patch.primaryPhone?.number) {
      patch.primaryPhone.verified = false;
    }

    let profile = await Profile.findOne({ userId });

    if (!profile) {
      profile = new Profile({ userId, ...patch });
    } else {
      Object.assign(profile, patch);
    }

    const before = profile.isNew ? null : await Profile.findOne({ userId }).lean();

    await profile.save();

    await addAudit({
      req,
      action: 'PROFILE_UPSERT_SELF',
      entity: 'Profile',
      entityId: profile._id,
      before,
      after: profile.toObject()
    });

    res.json({ profile });
  } catch (err) {
    next(err);
  }
};

/** GET /api/profiles  (admin) – list profiles with optional search */
const adminListProfiles = async (req, res, next) => {
  try {
    const { q = "", limit = 20, skip = 0 } = req.query || {};
    const filter = {};

    if (q) {
      filter.$or = [
        { 'name.full': { $regex: q, $options: 'i' } },
        { 'primaryPhone.number': { $regex: q, $options: 'i' } },
        { 'kyc.pan': { $regex: q, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      Profile.find(filter)
        .sort({ createdAt: -1 })
        .skip(+skip)
        .limit(+limit)
        .lean(),
      Profile.countDocuments(filter),
    ]);

    res.json({ items, total, limit: +limit, skip: +skip });
  } catch (err) {
    next(err);
  }
};

/** GET /api/profiles/:userId  (admin) – get profile by userId */
const adminGetProfileByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const profile = await Profile.findOne({ userId }).lean();
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    res.json({ profile });
  } catch (err) {
    next(err);
  }
};

/** PATCH /api/profiles/:userId  (admin) – update profile by userId */
const adminUpdateProfileByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const patch = { ...req.body };

    const before = await Profile.findOne({ userId }).lean();
    if (!before) return res.status(404).json({ message: 'Profile not found' });

    const updated = await Profile.findOneAndUpdate(
      { userId },
      { $set: patch },
      { new: true }
    ).lean();

    await addAudit({
      req,
      action: 'PROFILE_UPDATE_ADMIN',
      entity: 'Profile',
      entityId: updated._id,
      before,
      after: updated
    });

    res.json({ profile: updated });
  } catch (err) {
    next(err);
  }
};

export {
  getMyProfile,
  upsertMyProfile,
  adminListProfiles,
  adminGetProfileByUserId,
  adminUpdateProfileByUserId,
};
