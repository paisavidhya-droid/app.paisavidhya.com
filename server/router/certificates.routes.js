import { Router } from "express";
import { verifyCertificate } from "../controllers/certificate.controller.js";
import { generateCertificateById } from "../controllers/pledgecertificate.controller.js"; // we’ll add below

const router = Router();

router.get("/:certificateId", verifyCertificate);                 // public verify JSON
router.get("/:certificateId/pdf", generateCertificateById);       // public pdf (optional)

export default router;
