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
} from "../controllers/lead.controller.js";

const router = Router();
 
// Create + List + Detail
router.post('/', createLead);
router.get('/', listLeads);


// Hard delete (irreversible)
router.delete('/:id/hard', hardDeleteLead);

router.get('/:id', getLead);

// General update (optional — include only if you implemented it)
// router.patch('/:id', updateLead);

// Outreach + Notes
router.patch('/:id/outreach', updateOutreach);
// router.patch('/:id/notes', addNote);

// Soft delete (archive) + restore
router.delete('/:id', archiveLead);
router.post('/:id/restore', restoreLead);




export default router;
