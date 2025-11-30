// services/bseClient.js
import axios from 'axios';
import { BSE_CONFIG } from '../config/bse.config.js';
import { encryptForBse, getOrgHeader } from './bseCrypto.js';

const api = axios.create({
  baseURL: BSE_CONFIG.baseUrl,
  timeout: 20000,
});

/**
 * Generic POST for BSE v2
 * `path` example: '/v2/add_ucc'
 * `payload` is plain JS object; we encrypt inside.
 */
export async function postBse(path, payload, { encrypt = true } = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'X-API-Org-ID': getOrgHeader(),
  };

  const dataToSend = encrypt ? encryptForBse(payload) : payload;

  // BSE spec: usually { "data": "<encrypted-string>" }
  const body = encrypt ? { data: dataToSend } : { data: payload };

  const res = await api.post(path, body, { headers });

  // TODO: if BSE returns encrypted data, decrypt here.
  // For now assume res.data is already plain JSON.
  return res.data;
}
