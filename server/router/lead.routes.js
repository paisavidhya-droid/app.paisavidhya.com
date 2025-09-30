const router = require('express').Router();
const { createLead, listLeads, updateOutreach, getLead, archiveLead, hardDeleteLead, restoreLead } = require('../controllers/lead.controller');

 
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




module.exports = router;
