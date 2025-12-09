// server/controllers/pledgecertificate.controller.js

import User from "../models/user.model.js";
import { PDFDocument, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------- TAKE PLEDGE ----------------
export const takePledge = async (req, res, next) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthenticated" });
    }

     const updated = await User.findByIdAndUpdate(
      userId,
      {
        pledge: {
          taken: true,
          date: new Date(),
        },
      },
      { new: true } // return updated document
    )
      .select("-password")
      .lean();

    if (!updated) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user: updated });
  } catch (err) {
    next(err);
    console.error("Pledge error:", err);
    // res.status(500).json({ success: false });
  }
};

// ---------------- GENERATE CERTIFICATE ----------------
export const generateCertificate = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);


    if (!user || !user.pledge?.taken) {
      return res.status(403).send("No pledge found");
    }

    // Fix path for template
    const templatePath = path.join(__dirname, "../assets/certificate.png");
    const templateBytes = fs.readFileSync(templatePath);

    const pdf = await PDFDocument.create();
    const page = pdf.addPage([1200, 1700]);

    const img = await pdf.embedPng(templateBytes);
    page.drawImage(img, {
      x: 0,
      y: 0,
      width: 1200,
      height: 1700
    });

    // Draw Name
    page.drawText(user.name || "User", {
      x: 320,
      y: 1050,
      size: 40,
      color: rgb(0, 0, 0),
    });

    // Draw Date
    page.drawText(
      new Date(user.pledge.date).toLocaleDateString("en-IN"),
      {
        x: 320,
        y: 990,
        size: 30,
        color: rgb(0, 0, 0),
      }
    );

    const pdfBytes = await pdf.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="Financial_Pledge_Certificate.pdf"`
    );

    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    next(err);
    console.error("Certificate error:", err);
    // res.status(500).send("Error generating certificate");
  }
};
