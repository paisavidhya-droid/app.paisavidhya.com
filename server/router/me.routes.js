// server/router/me.routes.js
import { Router } from "express";
import auth from "../middlewares/authMiddleware.js";

const router = Router();
router.post("/me/push-tokens", auth, async (req, res) => {
  const { token, platform = "expo" } = req.body || {};
  if (!token) return res.status(400).json({ error: "token_required" });

  await PushToken.updateOne(
    { token },
    {
      $set: { userId: req.user._id, platform, lastSeenAt: new Date() },
    },
    { upsert: true }
  );

  res.json({ ok: true });
});
