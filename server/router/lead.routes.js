// server\router\lead.routes.js
import { Router } from "express";
import {
  createLead,
  listLeads,
  updateOutreach,
  getLead,
  archiveLead,
  hardDeleteLead,
  restoreLead,
  bulkArchiveLeads,
  bulkRestoreLeads,
  bulkTransferLeads,
  bulkHardDeleteLeads,
  updateLead,
  createLeadOps,
} from "../controllers/lead.controller.js";
import { listLeadActivities } from "../controllers/leadActivity.controller.js";
import { requireRole, ROLES } from "../middlewares/roleMiddleware.js";
import auth from "../middlewares/authMiddleware.js";

const router = Router();

// Create + List + Detail
router.post('/', createLead);
router.get('/', listLeads);

router.post(
  "/ops",
  auth,
  requireRole(ROLES.ADMIN, ROLES.STAFF),
  createLeadOps
);

// Bulk operations
router.post(
  "/bulk/archive",
  auth,
  requireRole(ROLES.ADMIN, ROLES.STAFF),
  bulkArchiveLeads
);

router.post(
  "/bulk/restore",
  auth,
  requireRole(ROLES.ADMIN, ROLES.STAFF),
  bulkRestoreLeads
);

router.post(
  "/bulk/transfer",
  auth,
  requireRole(ROLES.ADMIN, ROLES.STAFF),
  bulkTransferLeads
);

router.post(
  "/bulk/hard-delete",
  auth,
  requireRole(ROLES.ADMIN),
  bulkHardDeleteLeads
);





router.get("/:id", auth, requireRole(ROLES.ADMIN, ROLES.STAFF), getLead);
router.patch("/:id", auth, requireRole(ROLES.ADMIN, ROLES.STAFF), updateLead);



// Outreach + Notes
router.patch("/:id/outreach", auth, requireRole(ROLES.ADMIN, ROLES.STAFF), updateOutreach);
// router.patch('/:id/notes', addNote);

router.get("/:leadId/activities", auth, requireRole(ROLES.ADMIN, ROLES.STAFF), listLeadActivities);

// Soft delete (archive) + restore
router.delete("/:id", auth, requireRole(ROLES.ADMIN, ROLES.STAFF), archiveLead);
router.post("/:id/restore", auth, requireRole(ROLES.ADMIN, ROLES.STAFF), restoreLead);
// Hard delete (irreversible)
router.delete("/:id/hard", auth, requireRole(ROLES.ADMIN), hardDeleteLead);



export default router;
