// src/router/profile.routes.js
import { Router } from 'express';
import auth from '../middlewares/authMiddleware.js';
import { requireRole, ROLES } from '../middlewares/roleMiddleware.js';
import { validate } from '../middlewares/validate.js';
import { upsertProfileBody, adminListQuery } from '../validators/profile.schema.js';
import { getMe, upsertMe, adminList, adminGetByUserId } from '../controllers/profile.controller.js';

const router = Router();

// Me
router.get('/me', auth, getMe);
router.put('/me', auth, validate({ body: upsertProfileBody }), upsertMe);

// Admin/Staff
router.get('/', auth, requireRole(ROLES.ADMIN, ROLES.STAFF), validate({ query: adminListQuery }), adminList);
router.get('/:userId', auth, requireRole(ROLES.ADMIN, ROLES.STAFF), adminGetByUserId);

export default router;
