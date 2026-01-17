import fs from "fs/promises";
import path from "path";
import Handlebars from "handlebars";

const templatesRoot = path.join(process.cwd(), "emails", "templates");

async function load(relPath) {
  const fullPath = path.join(templatesRoot, relPath);
  return fs.readFile(fullPath, "utf8");
}

export async function renderTemplate(relPath, data = {}) {
  const raw = await load(relPath);
  const tpl = Handlebars.compile(raw, { noEscape: true });
  return tpl(data);
}

export async function renderWithLayout({ layoutPath, bodyPath, data }) {
  const [layoutRaw, bodyRaw] = await Promise.all([load(layoutPath), load(bodyPath)]);

  const layoutTpl = Handlebars.compile(layoutRaw, { noEscape: true });
  const bodyTpl = Handlebars.compile(bodyRaw, { noEscape: true });

    // ✅ Global defaults injected once (no redundancy in every email)
  const defaults = {
    appName: process.env.APP_NAME || "Paisavidhya",
    supportEmail: process.env.SUPPORT_EMAIL || "contact@paisavidhya.com",
    logoUrl: process.env.MAIL_LOGO_URL || "", // your env name
    year: new Date().getFullYear(),
  };

    // allow per-email overrides if ever needed
  const finalData = { ...defaults, ...data };

  const body = bodyTpl(finalData);
  return layoutTpl({ ...finalData, body });
}
