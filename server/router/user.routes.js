// routes/users.routes.js
import { Router } from "express";
import {
  listStaff,
  listAssignableUsers,
  adminCreate,
  getAllUsers,
  getById,
  updateById,
  removeById,
} from "../controllers/user.controller.js";
import auth from "../middlewares/authMiddleware.js";
import { requireRole, ROLES } from "../middlewares/roleMiddleware.js";
import { generateCertificate, takePledge } from "../controllers/pledgecertificate.controller.js";

const router = Router();

router.get('/staff', auth, requireRole(ROLES.ADMIN), listStaff);
router.get('/assignable', auth, requireRole(ROLES.ADMIN), listAssignableUsers);

// router.get('/assignable', listAssignableUsers);

// Admin creates users (STAFF/ADMIN/CUSTOMER)
router.post('/', auth, requireRole(ROLES.ADMIN), adminCreate);

// Admin list (optional filters ?role=&q=)
router.get('/', auth, requireRole(ROLES.ADMIN), getAllUsers);


// pledge route
router.post("/pledge", auth, takePledge);
router.get("/certificate", auth, generateCertificate);


// router.get("/certificate/:id", generateCertificate);

// Admin or self
router.get('/:id', auth, getById);
router.patch('/:id', auth, updateById);

// Admin only
router.delete('/:id', auth, requireRole(ROLES.ADMIN), removeById);









export default router;
