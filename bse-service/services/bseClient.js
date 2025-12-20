// services/bseClient.js
import axios from "axios";
import crypto from "crypto";
import { BSE_CONFIG } from "../config/bse.config.js";
import { encryptForBse, decryptFromBse, getOrgHeader } from "./bseCrypto.js";
import { getBseAccessToken } from "./bseAuth.js"; // from your Step B

const api = axios.create({
  baseURL: BSE_CONFIG.baseUrl,
  timeout: 20000,
});

function traceId() {
  return crypto.randomUUID();
}

export async function postBse(path, innerDataObj, { encrypt = true } = {}) {
  const isLogin = path === "/api/login";

  // Per doc: every request is { data: {...} } :contentReference[oaicite:8]{index=8}
  const clearRequest = { data: innerDataObj };

  const headers = {
    "X-STARMFv2-Trace-ID": traceId(), // required :contentReference[oaicite:9]{index=9}
  };

  // Other than login, bearer token is mandatory 
  if (!isLogin) {
    const token = await getBseAccessToken();
    headers.Authorization = `Bearer ${token}`;
  }

  let body;

  if (!isLogin && encrypt) {
    headers["Content-Type"] = "application/jose"; // required :contentReference[oaicite:11]{index=11}
    headers["X-API-Org-ID"] = getOrgHeader();     // required :contentReference[oaicite:12]{index=12}

    const encryptedString = await encryptForBse(clearRequest);
    body = { data: encryptedString };
  } else {
    headers["Content-Type"] = "application/json";
    body = clearRequest;
  }

  const res = await api.post(path, body, { headers });

  // If encrypted payload is enabled, response may also be encrypted string. :contentReference[oaicite:13]{index=13}
  if (!isLogin && encrypt && typeof res?.data?.data === "string") {
    return await decryptFromBse(res.data.data);
  }

  return res.data;
}



// // services/bseClient.js
// import axios from 'axios';
// import { BSE_CONFIG } from '../config/bse.config.js';
// import { encryptForBse, getOrgHeader } from './bseCrypto.js';

// const api = axios.create({
//   baseURL: BSE_CONFIG.baseUrl,
//   timeout: 20000,
// });

// /**
//  * Generic POST for BSE v2
//  * `path` example: '/v2/add_ucc'
//  * `payload` is plain JS object; we encrypt inside.
//  */
// export async function postBse(path, payload, { encrypt = true } = {}) {
//   const headers = {
//     'Content-Type': 'application/json',
//     'X-API-Org-ID': getOrgHeader(),
//   };

//   const dataToSend = encrypt ? encryptForBse(payload) : payload;

//   // BSE spec: usually { "data": "<encrypted-string>" }
//   const body = encrypt ? { data: dataToSend } : { data: payload };

//   const res = await api.post(path, body, { headers });

//   // TODO: if BSE returns encrypted data, decrypt here.
//   // For now assume res.data is already plain JSON.
//   return res.data;
// }
