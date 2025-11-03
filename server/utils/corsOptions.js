// utils/corsOptions.js
import cors from "cors";

const parseList = (v) =>
  (v || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

// You can keep simple strings or regex-like patterns
const ALLOWED = parseList(process.env.FRONTEND_ORIGINS);
// e.g. FRONTEND_ORIGINS="https://app.paisavidhya.com,https://staging.app.paisavidhya.com,http://localhost:5173"

export const corsOptions = {
  origin(origin, cb) {
    // Allow non-browser tools (no origin) like curl/Postman/health checks
    if (!origin) return cb(null, true);

    const allowed = ALLOWED.some((o) => {
      if (o.startsWith("/") && o.endsWith("/")) {
        // regex support: "/^https:\/\/.*\.paisavidhya\.com$/"
        const re = new RegExp(o.slice(1, -1));
        return re.test(origin);
      }
      return o === origin;
    });

    return allowed ? cb(null, true) : cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,                   // allow cookies / auth headers
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Set-Cookie"],
  optionsSuccessStatus: 204,           // some old browsers choke on 200 for OPTIONS
};
