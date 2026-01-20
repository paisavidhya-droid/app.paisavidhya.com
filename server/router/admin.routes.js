// server/router/admin.routes.js
import { Router } from "express";
import auth from "../middlewares/authMiddleware.js";
import { requireRole, ROLES } from "../middlewares/roleMiddleware.js";
import { getAdminSummary } from "../controllers/adminSummary.controller.js";

const router = Router();

router.get("/summary", auth, requireRole(ROLES.ADMIN), getAdminSummary);

export default router;
