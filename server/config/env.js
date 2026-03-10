// server\config\env.js



import dotenv from "dotenv";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

const client = new SecretManagerServiceClient();

async function loadProdSecrets() {
  try {
    const projectId = "paisavidhya-server";

    const [version] = await client.accessSecretVersion({
      name: `projects/${projectId}/secrets/backend-env/versions/latest`,
    });

    const secretPayload = version.payload.data.toString("utf8");
    const parsed = dotenv.parse(secretPayload);

    for (const [key, value] of Object.entries(parsed)) {
      process.env[key] = value;
    }

    console.log("✓ Production secrets loaded from Secret Manager");
  } catch (error) {
    console.error("❌ Failed to load secrets:", error);
  }
}

function loadLocalEnv() {
  dotenv.config({
    path: ".env.development",
    quiet: true,
  });

  console.log("✓ Local env loaded from .env.development");
}

if (process.env.NODE_ENV === "production") {
  await loadProdSecrets();
} else {
  loadLocalEnv();
}






// import dotenv from "dotenv";

// dotenv.config({
//     path: process.env.NODE_ENV === "production"
//         ? ".env.production"
//         : ".env.development",
//     quiet: true
// });

// console.log("Loaded ENV:", process.env.NODE_ENV);