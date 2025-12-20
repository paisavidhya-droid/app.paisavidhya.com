// routes/index.js
import { Router } from 'express';
import uccRoutes from './ucc.routes.js';
import webhookRoutes from './webhook.routes.js';
import authRoutes from './auth.routes.js';
// order & mandate routes later

const router = Router();

// All routes under /api/bse
router.use('/ucc', uccRoutes);
router.use('/webhook', webhookRoutes);
router.use("/auth", authRoutes);

export default router;
