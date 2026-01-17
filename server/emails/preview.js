import fs from "fs/promises";
import path from "path";
import { renderWithLayout } from "./renderTemplate.js";

async function main() {
  const name = process.argv[2] || "verify-email";

  const appName = "Paisavidhya";
  const html = await renderWithLayout({
    layoutPath: "layouts/no-reply-base.html.hbs",
    bodyPath: `auth/${name}.body.hbs`,
    data: {
      appName,
      supportEmail: "contact@paisavidhya.com",
      logoUrl: "https://app.paisavidhya.com/logo.png", // optional
      year: new Date().getFullYear(),
      title: `Preview • ${appName}`,
      preheader: "This is a preview email.",
      safeName: "User",
      verifyUrl: "https://paisavidhya.com/verify?token=abc123",
      expiresMinutes: 30,
    },
  });

  const outDir = path.join(process.cwd(), "emails", "_previews");
  await fs.mkdir(outDir, { recursive: true });

  const outFile = path.join(outDir, `${name}.html`);
  await fs.writeFile(outFile, html, "utf8");

  console.log("Preview generated:", outFile);
  console.log("Open it in your browser.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
