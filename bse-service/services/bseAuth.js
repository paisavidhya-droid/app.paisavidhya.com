// services/bseAuth.js
import axios from "axios";
import { BSE_CONFIG } from "../config/bse.config.js";

let cached = {
  token: null,
  expiresAtMs: 0,
};

function nowMs() {
  return Date.now();
}

function safetyBufferMs() {
  const sec = Number(process.env.BSE_TOKEN_SAFETY_BUFFER_SEC || 60);
  return Math.max(0, sec) * 1000;
}

export async function loginToBse() {
 const baseURL = BSE_CONFIG.baseUrl;
  const username = process.env.BSE_USERNAME;
  const password = process.env.BSE_PASSWORD;

  if (!baseURL || !username || !password) {
    throw new Error("Missing BSE_BASE_URL / BSE_USERNAME / BSE_PASSWORD in env");
  }

  // Per doc: POST /api/login with { data: { username, password } } :contentReference[oaicite:2]{index=2}
  const res = await axios.post(
    `${baseURL}/api/login`,
    { data: { username, password } },
    { timeout: 20000 }
  );

  if (res?.data?.status !== "success") {
    throw new Error(`BSE login failed: ${JSON.stringify(res.data)}`);
  }

  const token = res.data?.data?.access_token;
  if (!token) throw new Error("BSE login success but access_token missing");

  // NOTE: Doc says token has expiry decided by platform, but may not return exp.
  // We'll decode JWT exp if present; else set a short TTL and refresh frequently.
  let expiresAtMs = nowMs() + 10 * 60 * 1000; // default 10 min fallback

  try {
    const payloadB64 = token.split(".")[1];
    if (payloadB64) {
      const payloadJson = JSON.parse(
        Buffer.from(payloadB64, "base64").toString("utf8")
      );
      if (payloadJson?.exp) {
        expiresAtMs = payloadJson.exp * 1000;
      }
    }
  } catch {
    // ignore decode errors
  }

  cached = { token, expiresAtMs };
  return token;
}

export async function getBseAccessToken() {
  const buffer = safetyBufferMs();
  const valid = cached.token && (cached.expiresAtMs - buffer) > nowMs();

  if (valid) return cached.token;

  return await loginToBse();
}
