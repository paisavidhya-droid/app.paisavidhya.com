import Certificate from "../models/certificate.model.js";
import User from "../models/user.model.js";

export const verifyCertificate = async (req, res, next) => {
  try {
    const { certificateId } = req.params;

    const cert = await Certificate.findOne({ certificateId }).lean();
    if (!cert) return res.status(404).json({ success: false, message: "Certificate not found" });

    const user = await User.findById(cert.userId).select("name").lean();

    return res.json({
      success: true,
      certificate: {
        certificateId: cert.certificateId,
        status: cert.status,
        issuedAt: cert.issuedAt,
        type: cert.type,
        pledgeTitle: cert.pledgeTitle,
        name: cert.nameSnapshot || user?.name || "User",
        issuedBy: "Paisavidhya",
      },
    });
  } catch (err) {
    next(err);
  }
};
