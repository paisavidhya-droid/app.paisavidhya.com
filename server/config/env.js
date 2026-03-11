// server\config\env.js



// server/config/env.js

// server/config/env.js
import dotenv from "dotenv";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

function applyEnvString(envString) {
  const lines = envString.split("\n");

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) continue;

    const eqIndex = line.indexOf("=");
    if (eqIndex === -1) continue;

    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();

    // remove wrapping quotes if present
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

export async function loadEnv() {
  const isProduction =
    process.env.NODE_ENV === "production" || process.env.GAE_ENV;

  if (!isProduction) {
    dotenv.config({
      path:
        process.env.NODE_ENV === "production"
          ? ".env.production"
          : ".env.development",
    });
    console.log("Loaded local env file");
    return;
  }

  const secretName = process.env.ENV_SECRET_NAME || "backend-env";
  const projectId =
    process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT;

  if (!projectId) {
    throw new Error("GOOGLE_CLOUD_PROJECT is missing");
  }

  const client = new SecretManagerServiceClient();

  const [version] = await client.accessSecretVersion({
    name: `projects/${projectId}/secrets/${secretName}/versions/latest`,
  });

  const payload = version.payload?.data?.toString();

  if (!payload) {
    throw new Error(`Secret ${secretName} has empty payload`);
  }

  applyEnvString(payload);

  console.log(`Loaded env vars from Secret Manager: ${secretName}`);
}






// import dotenv from "dotenv";

// dotenv.config({
//     path: process.env.NODE_ENV === "production"
//         ? ".env.production"
//         : ".env.development",
//     quiet: true
// });

// console.log("Loaded ENV:", process.env.NODE_ENV);