// server/generators/certificateId.js

import mongoose from "mongoose";

export function generateCertificateId(prefix = "PV-FSP") {
  const year = new Date().getFullYear();

  // 24 hex chars. We'll use last 10 for shortness.
  const short = new mongoose.Types.ObjectId()
    .toString()
    .slice(-10)
    .toUpperCase();

  // Example: PV-FSP-2025-8F3A91C2D0
  return `${prefix}-${year}-${short}`;
}
