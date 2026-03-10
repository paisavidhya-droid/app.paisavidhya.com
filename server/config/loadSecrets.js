const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");

const client = new SecretManagerServiceClient();

async function loadSecrets() {
  const projectId = "paisavidhya-server";

  const [version] = await client.accessSecretVersion({
    name: `projects/${projectId}/secrets/backend-env/versions/latest`,
  });

  const env = version.payload.data.toString();

  env.split("\n").forEach((line) => {
    const [key, value] = line.split("=");
    if (key) process.env[key.trim()] = value.trim();
  });
}

module.exports = loadSecrets;