// server/router/admin.routes.js
import { Router } from "express";
import auth from "../middlewares/authMiddleware.js";
import { requireRole, ROLES } from "../middlewares/roleMiddleware.js";
import { getAdminSummary } from "../controllers/adminSummary.controller.js";
import { getVerificationSettings, updateVerificationSettings } from "../controllers/adminSettings.controller.js";

const router = Router();

router.get("/summary", auth, requireRole(ROLES.ADMIN), getAdminSummary);


router.get(
  "/verification-settings",
  auth,
  requireRole(ROLES.ADMIN),
  getVerificationSettings
);

router.patch(
  "/verification-settings",
  auth,
  requireRole(ROLES.ADMIN),
  updateVerificationSettings
);


export default router;
