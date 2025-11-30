// services/bseCrypto.js
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { BSE_CONFIG } from '../config/bse.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadKey(relativePath) {
  const absPath = path.resolve(__dirname, '..', relativePath);
  return fs.readFileSync(absPath, 'utf8');
}

const memberPrivateKey = loadKey(BSE_CONFIG.rsaPrivateKeyPath);
const bsePublicKey = loadKey(BSE_CONFIG.bsePublicKeyPath);

/**
 * Encrypt payload for BSE using BSE public key
 */
export function encryptForBse(payloadObj) {
  const buffer = Buffer.from(JSON.stringify(payloadObj), 'utf8');
  const encrypted = crypto.publicEncrypt(
    {
      key: bsePublicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    },
    buffer
  );
  return encrypted.toString('base64');
}

/**
 * Decrypt payload from BSE using your private key
 * (Use when BSE responds with encrypted data)
 */
export function decryptFromBse(base64Payload) {
  const buffer = Buffer.from(base64Payload, 'base64');
  const decrypted = crypto.privateDecrypt(
    {
      key: memberPrivateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    },
    buffer
  );
  return JSON.parse(decrypted.toString('utf8'));
}

/**
 * X-API-Org-ID header value
 */
export function getOrgHeader() {
  return `${BSE_CONFIG.orgCode}:${BSE_CONFIG.orgFingerprint}`;
}
