// server/router/org.routes.js
import { Router } from "express";
import auth from "../middlewares/authMiddleware.js";
import { requireRole, ROLES } from "../middlewares/roleMiddleware.js";
import {
  createOrg,
  listOrgs,
  getOrg,
  updateOrg,
  deactivateOrg,
  getOrgByCodePublic,
  generateOrgPledgeLink,
} from "../controllers/org.controller.js";

const router = Router();

// Admin CRUD
router.post("/", auth, requireRole(ROLES.ADMIN), createOrg);
router.get("/", auth, requireRole(ROLES.ADMIN), listOrgs);
router.get("/:id", auth, requireRole(ROLES.ADMIN), getOrg);
router.patch("/:id", auth, requireRole(ROLES.ADMIN), updateOrg);
router.delete("/:id", auth, requireRole(ROLES.ADMIN), deactivateOrg);

router.post(
  "/:id/generate-link",
  auth,
  requireRole(ROLES.ADMIN),
  generateOrgPledgeLink
);

// Public org lookup by short code (no auth)
// Example: /api/orgs/public/PV-ABCSCH
router.get("/public/code/:code", getOrgByCodePublic);

export default router;
