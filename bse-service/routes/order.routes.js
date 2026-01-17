// import { Router } from "express";
// import { postBse } from "../services/bseClient.js";

// const router = Router();

// /**
//  * POST /api/bse/orders/list
//  * Read-only BSE API (no encryption, no fingerprint)
//  */
// router.post("/list", async (req, res, next) => {
//   try {
//     const payload = req.body?.data ?? req.body ?? {};

//     const response = await postBse(
//       "/s2/order_list",
//       payload,
//       { encrypt: false } // IMPORTANT
//     );

//     res.json(response);
//   } catch (err) {
//     next(err);
//   }
// });

// export default router;

import { Router } from "express";
import { postBse } from "../services/bseClient.js";

const router = Router();

/**
 * POST /api/bse/orders/list
 * BSE secured API (JOSE + X-API-Org-ID required)
 */
router.post("/list", async (req, res, next) => {
  try {
    // Frontend sends { data: {...} }
    const inner = req.body?.data ?? req.body ?? {};

    // IMPORTANT: encrypt must be TRUE (default), so do not pass encrypt:false
    const response = await postBse("/s2/order_list", inner);

    res.json(response);
  } catch (err) {
    next(err);
  }
});

export default router;
