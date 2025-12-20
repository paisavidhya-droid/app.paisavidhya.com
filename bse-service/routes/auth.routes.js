import { Router } from "express";
import { getBseAccessToken } from "../services/bseAuth.js";

const router = Router();

router.get("/login-test", async (req, res, next) => {
  try {
    const token = await getBseAccessToken();
    res.json({ ok: true, token_preview: token.slice(0, 25) + "..." });
  } catch (err) {
    next(err);
  }
});

export default router;
