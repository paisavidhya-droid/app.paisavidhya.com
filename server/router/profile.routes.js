// routes/profile.routes.js
import { Router } from 'express';
import auth from '../middlewares/authMiddleware.js';
import { requireRole, ROLES } from '../middlewares/roleMiddleware.js';
import {
  getMyProfile,
  upsertMyProfile,
  listProfiles,
  getProfileByUserId,
  updateProfileByUserId,
  deleteProfileByUserId,
} from '../controllers/profile.controller.js';

const router = Router();

// Self routes
router.get('/me', auth, getMyProfile);
router.patch('/me', auth, upsertMyProfile);

// Admin routes
router.get('/', auth, requireRole(ROLES.ADMIN), listProfiles);
router.get('/:userId', auth, getProfileByUserId);        // internal guard handles admin/self
router.patch('/:userId', auth, updateProfileByUserId);   // internal guard handles admin/self
router.delete('/:userId', auth, requireRole(ROLES.ADMIN), deleteProfileByUserId);

export default router;
