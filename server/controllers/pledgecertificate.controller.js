// server/controllers/pledgecertificate.controller.js



import User from "../models/user.model.js";
import Certificate from "../models/certificate.model.js";
import Org from "../models/org.model.js";
import { generateCertificateId } from "../generators/certificateId.js";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import QRCode from "qrcode";
import { addAudit } from "../utils/audit.js";



// ---------------- TAKE PLEDGE ----------------

export const takePledge = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthenticated" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const { orgCode } = req.body || {};

    let org = null;
    if (orgCode) {
      // Inactive orgs should NOT issue new partner certificates
      org = await Org.findOne({ shortCode: orgCode, isActive: true }).lean();
    }

    // If already taken
    if (user.pledge?.taken) {
      const existingCert = await Certificate.findOne({
        userId,
        type: "PV-FSP",
      }).lean();

      // Backfill certificateId into user.pledge if missing
      if (existingCert?.certificateId && !user.pledge.certificateId) {
        user.pledge.certificateId = existingCert.certificateId;
      }

      // If this call came with a valid orgCode and user/ cert do not have org yet, link once
      if (org && !user.pledge.org) {
        user.pledge.org = org._id;
        await user.save();

        if (existingCert && !existingCert.org) {
          await Certificate.updateOne(
            { _id: existingCert._id },
            {
              $set: {
                org: org._id,
                orgNameSnapshot: org.name,
                orgCodeSnapshot: org.shortCode,
              },
            }
          );
        }

        await Org.updateOne(
          { _id: org._id },
          {
            $inc: { "stats.totalPledges": 1 },
            $set: { "stats.lastPledgeAt": new Date() },
          }
        );
      } else {
        await user.save();
      }

      const safeUser = await User.findById(userId).select("-password").lean();
      return res.json({
        success: true,
        user: safeUser,
        certificateId: existingCert?.certificateId,
      });
    }

    // New pledge
    const pledgeDate = new Date();

    // Create new certificate
    const certificateId = generateCertificateId("PV-FSP");

    const certPayload = {
      certificateId,
      userId,
      type: "PV-FSP",
      issuedAt: pledgeDate,
      status: "active",
      nameSnapshot: user.name,
    };

    if (org) {
      certPayload.org = org._id;
      certPayload.orgNameSnapshot = org.name;
      certPayload.orgCodeSnapshot = org.shortCode;
    }

    const cert = await Certificate.create(certPayload);

    // Save pledge on user
    user.pledge = {
      taken: true,
      date: pledgeDate,
      certificateId: cert.certificateId,
      ...(org && { org: org._id }),
    };
    await user.save();

    // Update org stats
    if (org) {
      await Org.updateOne(
        { _id: org._id },
        {
          $inc: { "stats.totalPledges": 1 },
          $set: { "stats.lastPledgeAt": pledgeDate },
        }
      );
    }

    const safeUser = await User.findById(userId).select("-password").lean();
    addAudit({
      req,
      action: "PLEDGE_TAKEN",
      entity: "Certificate",
      entityId: cert._id,
      after: {
        userId: String(userId),
        certificateId: cert.certificateId,
        type: cert.type,
        issuedAt: cert.issuedAt,
        orgId: org?._id ? String(org._id) : null,
        orgCode: org?.shortCode || null,
        orgName: org?.name || null,
      },
    });

    return res.json({
      success: true,
      user: safeUser,
      certificateId: cert.certificateId,
    });
  } catch (err) {
    addAudit({
      req,
      action: "PLEDGE_FAILED",
      entity: "Certificate",
      entityId: null,
      after: {
        userId: req.user?._id ? String(req.user._id) : null,
        orgCode: req.body?.orgCode || null,
        message: err?.message || "unknown_error",
        name: err?.name || "Error",
      },
    });
    next(err);
  }
};





const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function buildCertificatePdf({ name, issuedAt, certificateId, orgName }) {
  // const templatePath = path.join(
  //   __dirname,
  //   "../assets/financial-pledge-certificate.png"
  // );
  // const templateBytes = fs.readFileSync(templatePath);

  const templateFile = orgName
    ? "financial-pledge-certificate-with-org.png"
    : "financial-pledge-certificate.png";

  const templatePath = path.join(__dirname, "../assets", templateFile);
  const templateBytes = fs.readFileSync(templatePath);

  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);

  const fontPath = path.join(__dirname, "../assets/fonts/AlexBrush-Regular.ttf");
  const fontBytes = fs.readFileSync(fontPath);
  const alexBrushFont = await pdf.embedFont(fontBytes);

  const bg = await pdf.embedPng(templateBytes);
  const page = pdf.addPage([bg.width, bg.height]);

  page.drawImage(bg, { x: 0, y: 0, width: bg.width, height: bg.height });

  const serif = await pdf.embedFont(StandardFonts.TimesRoman);
  const italic = await pdf.embedFont(StandardFonts.TimesRomanItalic);
  const boldItalic = await pdf.embedFont(StandardFonts.TimesRomanBoldItalic);

  const safeName = (name || "User").trim();
  const dateStr = new Date(issuedAt).toLocaleDateString("en-IN");

  // ---- NAME ----
  drawCenteredText(
    page,
    safeName,
    770,
    115,
    alexBrushFont,
    rgb(0.15, 0.15, 0.15)
  );

  // ---- ORG LINE BELOW NAME (only for org pledges) ----
  // ---- ORG LINE BELOW NAME (centered, emphasized) ----
  if (orgName) {
    const label = "In association with ";
    const size = 45; // slightly larger than before (26 → 30)

    const labelWidth = italic.widthOfTextAtSize(label, size);
    const orgWidth = boldItalic.widthOfTextAtSize(orgName, size);
    const totalWidth = labelWidth + orgWidth;

    const { width } = page.getSize();
    const startX = (width - totalWidth) / 2;
    const y = 700; // same vertical position

    // label
    page.drawText(label, {
      x: startX,
      y,
      size,
      font: italic,
      color: rgb(0.25, 0.25, 0.25),
    });

    // org name (bold emphasis)
    page.drawText(orgName, {
      x: startX + labelWidth,
      y,
      size,
      font: boldItalic, // 👈 emphasis
      color: rgb(0.15, 0.15, 0.15),
    });
  }



  // ---- DATE ----
  page.drawText(dateStr, {
    x: bg.width - 520,
    y: 220,
    size: 26,
    font: serif,
    color: rgb(0.2, 0.2, 0.2),
  });

  // ---- QR ----
  const verifyUrl = `${APP_BASE_URL}/verify/${encodeURIComponent(
    certificateId
  )}`;

  const qrPngBuffer = await QRCode.toBuffer(verifyUrl, {
    type: "png",
    width: 220,
    margin: 1,
  });

  const qrImg = await pdf.embedPng(qrPngBuffer);

  const qrX = 200;
  const qrY = 150;
  const qrSize = 170;

  page.drawImage(qrImg, { x: qrX, y: qrY, width: qrSize, height: qrSize });

  // ---- CERT DETAILS ----
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

  // // ---- PARTNER LINE (only for org pledges) ---- only italic font 
  // if (orgName) {
  //   page.drawText(`In association with: ${orgName}`, {
  //     x: infoX,
  //     y: line1Y - 106,
  //     size: 26,
  //     font: italic,
  //     color: rgb(0.15, 0.15, 0.15),
  //   });
  // }

  // ---- PARTNER LINE (only for org pledges) ----
  if (orgName) {
    const assocLabel = "In association with: ";
    const assocSize = 26;
    const assocLabelWidth = serif.widthOfTextAtSize(assocLabel, assocSize);

    // 1) draw label (normal or italic, your choice)
    page.drawText(assocLabel, {
      x: infoX,
      y: line1Y - 106,
      size: assocSize,
      font: serif, // or italic if you want the label slightly styled
      color: rgb(0.15, 0.15, 0.15),
    });

    // 2) draw org name (bold + italic)
    page.drawText(orgName, {
      x: infoX + assocLabelWidth,
      y: line1Y - 106,
      size: assocSize,
      font: boldItalic,
      color: rgb(0.15, 0.15, 0.15),
    });
  }


  return pdf.save();
}


// ---------------- GENERATE CERTIFICATE ----------------
// Authenticated: logged-in user gets own certificate
export const generateCertificate = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const user = await User.findById(userId);
    if (!user || !user.pledge?.taken)
      return res.status(403).send("No pledge found");

    const cert = await Certificate.findOne({ userId, type: "PV-FSP" }).lean();
    if (!cert) return res.status(404).send("Certificate record not found");

    let orgName = null;
    if (cert.orgNameSnapshot) {
      orgName = cert.orgNameSnapshot;
    }

    const pdfBytes = await buildCertificatePdf({
      name: cert.nameSnapshot || user.name,
      issuedAt: cert.issuedAt,
      certificateId: cert.certificateId,
      orgName,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${cert.certificateId}.pdf"`
    );
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

    let orgName = null;
    if (cert.orgNameSnapshot) {
      orgName = cert.orgNameSnapshot;
    }

    const pdfBytes = await buildCertificatePdf({
      name: cert.nameSnapshot || user?.name || "User",
      issuedAt: cert.issuedAt,
      certificateId: cert.certificateId,
      orgName,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${cert.certificateId}.pdf"`
    );
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    next(err);
  }
};
