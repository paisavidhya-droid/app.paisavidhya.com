// server/controllers/pledgecertificate.controller.js



import User from "../models/user.model.js";
import Certificate from "../models/certificate.model.js";
import { generateCertificateId } from "../generators/certificateId.js";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import QRCode from "qrcode";


// ---------------- TAKE PLEDGE ----------------
export const takePledge = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthenticated" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // If already taken: return existing cert + backfill pledge.certificateId if missing
    if (user.pledge?.taken) {
      const existingCert = await Certificate.findOne({ userId, type: "PV-FSP" }).lean();

      if (existingCert?.certificateId && !user.pledge?.certificateId) {
        user.pledge.certificateId = existingCert.certificateId;
        await user.save();
      }

      const safeUser = await User.findById(userId).select("-password").lean();
      return res.json({
        success: true,
        user: safeUser,
        certificateId: existingCert?.certificateId,
      });
    }

    // Use one pledgeDate consistently
    const pledgeDate = new Date();

    // Find or create certificate
    let cert = await Certificate.findOne({ userId, type: "PV-FSP" });

    if (!cert) {
      const certificateId = generateCertificateId("PV-FSP"); // MongoId-based (sync)
      cert = await Certificate.create({
        certificateId,
        userId,
        type: "PV-FSP",
        issuedAt: pledgeDate,
        status: "active",
        nameSnapshot: user.name,
      });
    }

    // Save pledge + certificateId in ONE save (clean + UI-friendly)
    user.pledge = {
      taken: true,
      date: pledgeDate,
      certificateId: cert.certificateId,
    };
    await user.save();

    const safeUser = await User.findById(userId).select("-password").lean();
    return res.json({ success: true, user: safeUser, certificateId: cert.certificateId });
  } catch (err) {
    next(err);
  }
};






const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// const APP_BASE_URL = process.env.APP_URL || "https://app.paisavidhya.com";

const APP_BASE_URL = process.env.APP_URL;

function drawCenteredText(page, text, y, size, font, color) {
  const { width } = page.getSize();
  const textWidth = font.widthOfTextAtSize(text, size);
  page.drawText(text, {
    x: (width - textWidth) / 2,
    y,
    size,
    font,
    color,
  });
}

async function buildCertificatePdf({ name, issuedAt, certificateId }) {
  const templatePath = path.join(
    __dirname,
    "../assets/financial-pledge-certificate.png"
  );
  const templateBytes = fs.readFileSync(templatePath);

  const pdf = await PDFDocument.create();

  // REQUIRED for custom fonts
  pdf.registerFontkit(fontkit);

  // Embed Alex Brush
  const fontPath = path.join(__dirname, "../assets/fonts/AlexBrush-Regular.ttf");
  const fontBytes = fs.readFileSync(fontPath);
  const alexBrushFont = await pdf.embedFont(fontBytes);


  // Embed template first so we can match exact dimensions (landscape)
  const bg = await pdf.embedPng(templateBytes);

  // Create page exactly same size as template image
  const page = pdf.addPage([bg.width, bg.height]);

  // Draw background
  page.drawImage(bg, { x: 0, y: 0, width: bg.width, height: bg.height });

  // Fonts (closest built-ins; if you want exact script font, we can embed a .ttf)
  const serif = await pdf.embedFont(StandardFonts.TimesRoman);
  const italic = await pdf.embedFont(StandardFonts.TimesRomanItalic);

  // Normalize values
  const safeName = (name || "User").trim();
  const dateStr = new Date(issuedAt).toLocaleDateString("en-IN"); // dd/mm/yyyy

  // ---- NAME (centered under PRESENTED TO) ----
  // Tuned for your new layout (landscape template)
  drawCenteredText(
    page,
    safeName,
    770, // Y position for name (matches the layout under PRESENTED TO)
    115,
    alexBrushFont,
    rgb(0.15, 0.15, 0.15)
  );

  // ---- AWARDED ON (date near bottom-right "AWARDED ON") ----
  // Place date just above/near the printed "AWARDED ON" label
  page.drawText(dateStr, {
    x: bg.width - 520, // adjust if you want more left/right
    y: 220,
    size: 26,
    font: serif,
    color: rgb(0.2, 0.2, 0.2),
  });

  // ---- QR (bottom-left) ----
  const verifyUrl = `${APP_BASE_URL}/verify/${encodeURIComponent(
    certificateId
  )}`;

  const qrPngBuffer = await QRCode.toBuffer(verifyUrl, {
    type: "png",
    width: 220,
    margin: 1,
  });

  const qrImg = await pdf.embedPng(qrPngBuffer);

  // QR position (inside bottom-left box)
  const qrX = 200;
  const qrY = 150;
  const qrSize = 170;

  page.drawImage(qrImg, { x: qrX, y: qrY, width: qrSize, height: qrSize });

  // ---- CERT DETAILS (to the right of QR) ----
  const infoX = qrX + qrSize + 20;
  const line1Y = qrY + 120;

  page.drawText(`Certificate ID: ${certificateId}`, {
    x: infoX,
    y: line1Y,
    size: 26,
    font: serif,
    color: rgb(0.15, 0.15, 0.15),
  });

  page.drawText(`Digitally pledged by: ${safeName}`, {
    x: infoX,
    y: line1Y - 34,
    size: 26,
    font: serif,
    color: rgb(0.15, 0.15, 0.15),
  });

  page.drawText(`Issued by: Paisavidhya`, {
    x: infoX,
    y: line1Y - 70,
    size: 28,
    font: serif,
    color: rgb(0.15, 0.15, 0.15),
  });

  return pdf.save();
}


// ---------------- GENERATE CERTIFICATE ----------------
// Authenticated: logged-in user gets own certificate
export const generateCertificate = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId);
    if (!user || !user.pledge?.taken) return res.status(403).send("No pledge found");

    const cert = await Certificate.findOne({ userId, type: "PV-FSP" }).lean();
    if (!cert) return res.status(404).send("Certificate record not found");

    const pdfBytes = await buildCertificatePdf({
      name: cert.nameSnapshot || user.name,
      issuedAt: cert.issuedAt,
      certificateId: cert.certificateId,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${cert.certificateId}.pdf"`);
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    next(err);
  }
};

// Public: by certificateId (for verify page’s “view/download”)
export const generateCertificateById = async (req, res, next) => {
  try {
    const { certificateId } = req.params;

    const cert = await Certificate.findOne({ certificateId }).lean();
    if (!cert) return res.status(404).send("Certificate not found");

    const user = await User.findById(cert.userId).select("name").lean();

    const pdfBytes = await buildCertificatePdf({
      name: cert.nameSnapshot || user?.name || "User",
      issuedAt: cert.issuedAt,
      certificateId: cert.certificateId,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${cert.certificateId}.pdf"`);
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    next(err);
  }
};
