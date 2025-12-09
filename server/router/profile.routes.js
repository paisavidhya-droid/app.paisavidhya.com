// router/profile.routes.js
import { Router } from 'express';
import auth from '../middlewares/authMiddleware.js';
import { requireRole, ROLES } from '../middlewares/roleMiddleware.js';
import {
  getMyProfile,
  upsertMyProfile,
  adminListProfiles,
  adminGetProfileByUserId,
  adminUpdateProfileByUserId,
} from '../controllers/profile.controller.js';

const router = Router();

// Logged-in user endpoints
router.get('/me', auth, getMyProfile);
router.put('/me', auth, upsertMyProfile);
router.patch('/me', auth, upsertMyProfile);

// Admin endpoints
router.get('/', auth, requireRole(ROLES.ADMIN), adminListProfiles);
router.get('/:userId', auth, requireRole(ROLES.ADMIN), adminGetProfileByUserId);
router.patch('/:userId', auth, requireRole(ROLES.ADMIN), adminUpdateProfileByUserId);

export default router;
