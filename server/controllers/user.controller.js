// controllers/user.controller.js
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const { addAudit } = require('../utils/audit');
const { shouldAuditLoginSuccess } = require('../utils/authAuditPolicy');

/** POST /api/auth/register  (public → creates CUSTOMER) */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phoneNumber } = req.body;
    if (!name || !email || !password || !phoneNumber) {
      return res.status(400).json({ message: 'name, email, password, phoneNumber are required' });
    }
     // check duplicates for BOTH email & phone
    const [emailExists, phoneExists] = await Promise.all([
      User.exists({ email }),
      User.exists({ phoneNumber }),
    ]);
    if (emailExists) return res.status(409).json({ message: 'Email already registered' });
    if (phoneExists) return res.status(409).json({ message: 'Phone already registered' });

    const user = await User.create({ name, email, password, phoneNumber, role: 'CUSTOMER' });
    const token = user.generateAuthToken();
    const safe = await User.findById(user._id).select('-password').lean();

    // AUDIT
    await addAudit({
      req,
      action: 'AUTH_REGISTER',
      entity: 'User',
      entityId: user._id,
      after: { id: user._id, name: user.name, email: user.email, role: user.role, status: user.status }
    });

    res.status(201).json({ user: safe, token });
  } catch (err) {
    next(err);
    // res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

/** POST /api/auth/login  (public) */
exports.login = async (req, res, next) => {
  try {
    const { email, phoneNumber, password } = req.body || {};


    if ((!email && !phoneNumber) || !password) {
      return res.status(400).json({ message: "Email/phone and password are required" });
    }

    // Find user by email OR phoneNumber
    const query = email
      ? { email: email.toLowerCase() }
      : { phoneNumber };

    const user = await User.findOne(query).select('+password');
    if (!user) {
      // AUDIT (fail - no user)
      return res.status(401).json({ message: 'User not found' });
    }


    const ok = await user.comparePassword(password || '');
    if (!ok) {
      // AUDIT (fail - bad password)

      return res.status(401).json({ message: 'Invalid password' });
    }

    if (user.status === 'SUSPENDED') {
      // AUDIT (fail - suspended)
      await addAudit({
        req,
        action: 'AUTH_LOGIN_FAIL',
        entity: 'User',
        entityId: user._id,
        before: null,
        after: { email: user.email, reason: 'SUSPENDED' }
      });
      return res.status(403).json({ message: 'Account is suspended' });
    }

    const isCustomer = user.role === 'CUSTOMER';
    const newIp = user.lastLoginIp && user.lastLoginIp !== ip;
    const newUa = user.lastLoginUa && user.lastLoginUa !== ua;

    const token = user.generateAuthToken();
    const safe = await User.findById(user._id).select('-password').lean();

    // AUDIT (success)
    if (shouldAuditLoginSuccess({ role: user.role, isCustomer, newIp, newUa })) {
      await addAudit({
        req, action: 'AUTH_LOGIN_SUCCESS', entity: 'User', entityId: user._id,
        after: { id: user._id, email: user.email, role: user.role, newIp: !!newIp, newDevice: !!newUa }
      });
    }


    res.json({ user: safe, token });
  } catch (err) {
    next(err);
    // res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

/** GET /api/auth/me  (auth) */
exports.me = async (req, res, next) => {
  try {
    const me = await User.findById(req.auth.sub).select("-password").lean();
    if (!me) return res.status(404).json({ message: "User not found" });
    return res.json({ user: me });
  } catch (err) {
    next(err);
  }
};

/** POST /api/users  (admin) – create STAFF or ADMIN or CUSTOMER */
exports.adminCreate = async (req, res, next) => {
  try {
    const { name, email, password, phoneNumber, role = 'STAFF' } = req.body || {};
    if (!name || !email || !password || !phoneNumber) {
      return res.status(400).json({ message: 'name, email, password, phoneNumber are required' });
    }
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: 'Email already exists' });

    const user = await User.create({ name, email, password, phoneNumber, role });
    const safe = await User.findById(user._id).select('-password').lean();

    // AUDIT
    await addAudit({
      req,
      action: 'USER_CREATE',
      entity: 'User',
      entityId: user._id,
      after: { id: user._id, name: user.name, email: user.email, role: user.role, status: user.status }
    });

    res.status(201).json(safe);
  } catch (err) {
    next(err);
    // res.status(500).json({ message: 'Create user failed', error: err.message });
  }
};

/** GET /api/users  (admin) – optional filters: ?role=STAFF&q=search */
exports.adminList = async (req, res, next) => {
  try {
    const { role, q } = req.query || {};
    const filter = {};
    if (role) filter.role = role;
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phoneNumber: { $regex: q, $options: 'i' } },
      ];
    }
    const items = await User.find(filter).select('-password').sort({ createdAt: -1 }).lean();
    res.json({ items });
  } catch (err) {
    next(err);
    // res.status(500).json({ message: 'List users failed', error: err.message });
  }
};

/** GET /api/users/:id  (admin or self) */
exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const u = await User.findById(id).select('-password').lean();
    if (!u) return res.status(404).json({ message: 'User not found' });

    const isSelf = String(req.user.sub) === String(id);
    if (req.user.role !== 'ADMIN' && !isSelf) return res.status(403).json({ message: 'Forbidden' });

    res.json(u);
  } catch (err) {
    next(err);
    // res.status(500).json({ message: 'Fetch user failed', error: err.message });
  }
};

/** PATCH /api/users/:id  (admin or self). Non-admin cannot change role/status */
exports.updateById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const patch = { ...req.body };

    const isSelf = String(req.user.sub) === String(id);
    if (req.user.role !== 'ADMIN' && !isSelf) return res.status(403).json({ message: 'Forbidden' });

    if (req.user.role !== 'ADMIN') {
      delete patch.role;
      delete patch.status;
    }

    // Grab BEFORE snapshot (no password)
    const before = await User.findById(id).select('-password').lean();
    if (!before) return res.status(404).json({ message: 'User not found' });

    // If password is present, hash it (findByIdAndUpdate won't trigger pre-save)
    if (patch.password) {
      const salt = await bcrypt.genSalt(10);
      patch.password = await bcrypt.hash(patch.password, salt);
    }

    const updated = await User.findByIdAndUpdate(id, patch, { new: true }).select('-password').lean();
    if (!updated) return res.status(404).json({ message: 'User not found' });

    // AUDIT — specialize for role/status changes
    if (before.status !== updated.status) {
      await addAudit({
        req,
        action: 'USER_STATUS_CHANGE',
        entity: 'User',
        entityId: id,
        before: { id, status: before.status },
        after: { id, status: updated.status }
      });
    }
    if (before.role !== updated.role) {
      await addAudit({
        req,
        action: 'USER_ROLE_CHANGE',
        entity: 'User',
        entityId: id,
        before: { id, role: before.role },
        after: { id, role: updated.role }
      });
    }
    // Generic update (name/phone etc.)
    await addAudit({
      req,
      action: 'USER_UPDATE',
      entity: 'User',
      entityId: id,
      before,
      after: updated
    });

    res.json(updated);
  } catch (err) {
    next(err);
    // res.status(500).json({ message: 'Update failed', error: err.message });
  }
};

/** DELETE /api/users/:id  (admin) */
exports.removeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' });

    const removed = await User.findByIdAndDelete(id).select('-password').lean();
    if (!removed) return res.status(404).json({ message: 'User not found' });

    // AUDIT
    await addAudit({
      req,
      action: 'USER_DELETE',
      entity: 'User',
      entityId: id,
      before: removed
    });

    res.json({ message: 'User deleted', id: removed._id });
  } catch (err) {
    next(err);
    // res.status(500).json({ message: 'Delete failed', error: err.message });
  }
};




//with login attempts count and last login details
/*
// controllers/user.controller.js (only the login part shown)
const { addAudit } = require('../utils/audit');
const { shouldAuditLoginSuccess } = require('../utils/authAuditPolicy');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const ua = req.get('user-agent') || '';
    const ip = req.ip;

    const user = await User.findOne({ email: (email || '').toLowerCase() }).select('+password');
    if (!user) {
      await addAudit({
        req, action: 'AUTH_LOGIN_FAIL', entity: 'User', entityId: null,
        after: { email: (email || '').toLowerCase(), reason: 'NOT_FOUND' }
      });
      return res.status(404).json({ message: 'User not found' });
    }

    const ok = await user.comparePassword(password || '');
    if (!ok) {
      // (optional) increment failed counters
      await User.updateOne({ _id: user._id }, { $inc: { failedLoginCount: 1 }, $set: { lastFailedAt: new Date() } });
      await addAudit({
        req, action: 'AUTH_LOGIN_FAIL', entity: 'User', entityId: user._id,
        after: { email: user.email, reason: 'INVALID_PASSWORD' }
      });
      return res.status(401).json({ message: 'Invalid password' });
    }

    if (user.status === 'SUSPENDED') {
      await addAudit({
        req, action: 'AUTH_LOGIN_FAIL', entity: 'User', entityId: user._id,
        after: { email: user.email, reason: 'SUSPENDED' }
      });
      return res.status(403).json({ message: 'Account is suspended' });
    }

    // compute “new ip/device” (without schema changes we just compare to what we have)
    const isCustomer = user.role === 'CUSTOMER';
    const newIp = user.lastLoginIp && user.lastLoginIp !== ip;
    const newUa = user.lastLoginUa && user.lastLoginUa !== ua;

    // issue token
    const token = user.generateAuthToken();
    const safe = await User.findById(user._id).select('-password').lean();

    // audit success – conditional based on policy
    if (shouldAuditLoginSuccess({ role: user.role, isCustomer, newIp, newUa })) {
      await addAudit({
        req, action: 'AUTH_LOGIN_SUCCESS', entity: 'User', entityId: user._id,
        after: { id: user._id, email: user.email, role: user.role, newIp: !!newIp, newDevice: !!newUa }
      });
    }

    // (optional) reset failed counters & update last login fingerprints
    await User.updateOne(
      { _id: user._id },
      { $set: { lastLoginAt: new Date(), lastLoginIp: ip, lastLoginUa: ua, failedLoginCount: 0 } }
    );

    res.json({ user: safe, token });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};
*/