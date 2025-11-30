// routes/ucc.routes.js
import { Router } from 'express';
import { createUcc, getUccByUser } from '../controllers/ucc.controller.js';

const router = Router();

// Later: secure this with internal auth, IP allowlist, or shared secret.
router.post('/:userId', createUcc);
router.get('/:userId', getUccByUser);

export default router;
