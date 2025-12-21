import { Router } from "express";
import { pledgeStats } from "../controllers/publicPledge.controller.js";

const router = Router();

router.get("/pledge/stats", pledgeStats);

export default router;
