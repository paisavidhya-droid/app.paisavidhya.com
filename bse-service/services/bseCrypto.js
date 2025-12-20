// services/bseCrypto.js
import fs from "fs";
import path from "path";
import {
  importPKCS8,
  importSPKI,
  CompactEncrypt,
  compactDecrypt,
  CompactSign,
  compactVerify,
} from "jose";

let keyCache = null;

async function loadKeysOnce() {
  if (keyCache) return keyCache;

  const privPath = process.env.BSE_OWN_PRIVATE_KEY_PATH;
  const pubRemotePath = process.env.BSE_REMOTE_PUBLIC_KEY_PATH;

  if (!privPath || !pubRemotePath) {
    throw new Error("Missing key paths in env (BSE_OWN_PRIVATE_KEY_PATH / BSE_REMOTE_PUBLIC_KEY_PATH)");
  }

  const privatePem = fs.readFileSync(path.resolve(privPath), "utf8");
  const remotePublicPem = fs.readFileSync(path.resolve(pubRemotePath), "utf8");

  // RSA private key for signing (RS256) and decrypting JWE
  const ownPrivateKey = await importPKCS8(privatePem, "RS256");

  // Remote public key for encrypting JWE and verifying JWS
  const remotePublicKey = await importSPKI(remotePublicPem, "RS256");

  keyCache = { ownPrivateKey, remotePublicKey };
  return keyCache;
}

// payloadObj is the normal JSON request body like { data: {...} }
export async function encryptAndSign(payloadObj) {
  const { ownPrivateKey, remotePublicKey } = await loadKeysOnce();

  // 1) JWE encrypt the JSON (RSA-OAEP-256 + A256GCM)
  const plaintext = Buffer.from(JSON.stringify(payloadObj), "utf8");

  const jweCompact = await new CompactEncrypt(plaintext)
    .setProtectedHeader({
      alg: "RSA-OAEP-256",
      enc: "A256GCM",
      cty: "application/json",
    })
    .encrypt(remotePublicKey);

  // 2) JWS sign the JWE compact (RS256) with header version 1.0
  const jwsCompact = await new CompactSign(Buffer.from(jweCompact, "utf8"))
    .setProtectedHeader({ alg: "RS256", typ: "JWS", version: "1.0" })
    .sign(ownPrivateKey);

  return jwsCompact;
}

// encPayload is the JWS compact string
export async function verifyAndDecrypt(encPayload) {
  const { ownPrivateKey, remotePublicKey } = await loadKeysOnce();

  // 1) Verify JWS with remote public key -> yields JWE compact as bytes
  const { payload: jweBytes } = await compactVerify(encPayload, remotePublicKey);
  const jweCompact = Buffer.from(jweBytes).toString("utf8");

  // 2) Decrypt JWE with our private key -> yields JSON bytes
  const { plaintext } = await compactDecrypt(jweCompact, ownPrivateKey);
  const jsonStr = Buffer.from(plaintext).toString("utf8");

  return JSON.parse(jsonStr);
}


// ---- aliases so bseClient.js works without changes ----
export const encryptForBse = encryptAndSign;
export const decryptFromBse = verifyAndDecrypt;

export function getOrgHeader() {
  return `${process.env.BSE_ORG_CODE}:${process.env.BSE_ORG_FINGERPRINT}`;
}
