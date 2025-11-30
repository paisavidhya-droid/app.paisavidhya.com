const fs = require("fs");
const path = require("path");
const axios = require("axios");
// const crypto = require("crypto"); // we'll use later for RSA

const keysDir = path.join(__dirname, "..", "..", "keys");
const bsePublicKeyPath = path.join(keysDir, "bse_public.pem");
const pvPrivateKeyPath = path.join(keysDir, "pv_private.pem");

const BSE_BASE_URL = process.env.BSE_BASE_URL || "";

// Placeholder encryption
const encryptForBse = (plainText) => {
  // TODO: Implement as per BSE SOP using bse_public.pem
  // For now, just return plainText to keep flow working (UAT later)
  return plainText;
};

// Placeholder decryption
const decryptFromBse = (encryptedText) => {
  // TODO: Implement using pv_private.pem as per BSE SOP
  // For now, just return encryptedText
  return encryptedText;
};

const createUCC = async (payload) => {
  try {
    const body = JSON.stringify(payload);
    const encrypted = encryptForBse(body);

    const headers = {
      "Content-Type": "application/json",
      "X-API-ORG-ID": `${process.env.BSE_ORG_CODE}:${process.env.BSE_CHECKSUM}`,
      // add other required headers from SOP here
    };

    const url = `${BSE_BASE_URL}/<ucc-endpoint-from-sop>`; // TODO: replace
    const res = await axios.post(url, { data: encrypted }, { headers });

    const decrypted = decryptFromBse(res.data);
    return decrypted;
  } catch (err) {
    console.error("createUCC error:", err.response?.data || err.message);
    throw err;
  }
};

module.exports = {
  encryptForBse,
  decryptFromBse,
  createUCC,
};
