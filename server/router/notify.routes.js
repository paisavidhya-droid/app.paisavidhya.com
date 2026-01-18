// server\router\notify.routes.js
import { Router } from "express";
import auth from "../middlewares/authMiddleware.js";
import PushToken from "../models/PushToken.js";

const router = Router();
router.post("/push-tokens", auth, async (req, res) => {
   try {
    const { token, platform = "expo" } = req.body || {};
    if (!token) return res.status(400).json({ error: "token_required" });

    await PushToken.updateOne(
      { token },
      {
        $set: {
          userId: req.user._id,
          platform,
          lastSeenAt: new Date(),
        },
      },
      { upsert: true }
    );

    res.json({ ok: true });
  } catch (err) {
    // console.error("push-token error:", err.message);
    return res.status(500).json({ error: "internal_server_error" });
  }
});

export default router;