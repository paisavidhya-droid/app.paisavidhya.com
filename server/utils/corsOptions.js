// utils/corsOptions.js
import cors from "cors";

const defaultAllowed = [
  "http://localhost:5173",          // vite dev
  "http://localhost:3000",          // next / react default
  "https://app.paisavidhya.com",    // prod
  "https://paisavidhya-staging.netlify.app", // staging
];

// merge .env list with defaults
const extra = (process.env.FRONTEND_ORIGINS || "")
  .split(",")
  .map((x) => x.trim())
  .filter(Boolean);

const ALLOWED = [...new Set([...defaultAllowed, ...extra])];

export const corsOptions = {
  origin(origin, cb) {
    // no Origin (Postman, curl, internal calls)
    if (!origin) return cb(null, true);

    // allow if matches any allowed host, or subdomain of paisavidhya.com
    const ok =
      ALLOWED.includes(origin) ||
      /^https:\/\/.*\.paisavidhya\.com$/.test(origin);

    cb(ok ? null : new Error(`CORS not allowed: ${origin}`), ok);
  },
  credentials: true,
};
