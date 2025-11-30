// routes/webhook.routes.js
import { Router } from 'express';
import { handleWebhook } from '../controllers/webhook.controller.js';

const router = Router();

// BSE will POST here
router.post('/', handleWebhook);

export default router;
