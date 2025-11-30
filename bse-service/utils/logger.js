const fs = require("fs");
const path = require("path");

const logsDir = path.join(__dirname, "..", "..", "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const webhookLogFile = path.join(logsDir, "bse-webhooks.log");

const logWebhook = (data) => {
  const line =
    `[${new Date().toISOString()}] ` + JSON.stringify(data) + "\n";
  fs.appendFile(webhookLogFile, line, (err) => {
    if (err) console.error("Failed to write webhook log:", err);
  });
};

module.exports = { logWebhook };
