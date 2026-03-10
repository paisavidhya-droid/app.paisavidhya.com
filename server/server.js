import express from "express";
import cors from "cors";
import { loadEnv } from "./config/env.js";
import connectDb from "./db/conn.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";

import authRoutes from "./router/auth.routes.js";
import userRoutes from "./router/user.routes.js";
import leadRoutes from "./router/lead.routes.js";
import auditRoutes from "./router/audit.routes.js";
import profileRoutes from "./router/profile.routes.js";
import certificatesRouter from "./router/certificates.routes.js";
import publicRoutes from "./router/public.routes.js";
import orgRoutes from "./router/org.routes.js";
import notifyRoutes from "./router/notify.routes.js";
import adminRoutes from "./router/admin.routes.js";

await loadEnv(); // <-- required

const app = express();
const PORT = process.env.PORT || 5000;

app.set("trust proxy", 1);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // allow non-browser tools / curl / health checks
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  optionsSuccessStatus: 204,
  maxAge: 86400,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    now: new Date().toISOString(),
    uptimeSec: Math.floor(process.uptime()),
    node: process.version,
    region: process.env.REGION || process.env.AWS_REGION || "unknown",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/certificates", certificatesRouter);
app.use("/api/public", publicRoutes);
app.use("/api/orgs", orgRoutes);
app.use("/api/notifications", notifyRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorMiddleware);

await connectDb();

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`
  );
});