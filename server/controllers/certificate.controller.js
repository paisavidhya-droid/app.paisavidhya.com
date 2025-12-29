import Certificate from "../models/certificate.model.js";
import User from "../models/user.model.js";
import Org from "../models/org.model.js";




// ---------------- VERIFY CERTIFICATE ----------------
// with organization details
export const verifyCertificate = async (req, res, next) => {
  try {
    const { certificateId } = req.params;

    const cert = await Certificate.findOne({ certificateId }).lean();
    if (!cert) {
      return res
        .status(404)
        .json({ success: false, message: "Certificate not found" });
    }

    const user = await User.findById(cert.userId).select("name").lean();

    // Resolve org name (snapshot > live > fallback)
    let orgName = null;
    let orgCode = null;

    if (cert.org) {
      const org = await Org.findById(cert.org)
        .select("name shortCode")
        .lean();
      orgName = cert.orgNameSnapshot || org?.name || null;
      orgCode = cert.orgCodeSnapshot || org?.shortCode || null;
    } else if (cert.orgNameSnapshot) {
      orgName = cert.orgNameSnapshot;
    }

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
        ...(orgName && {
          partnerOrg: {
            name: orgName,
            code: orgCode || null,
          },
        }),
      },
    });
  } catch (err) {
    next(err);
  }
};




// without organization details

// export const verifyCertificate = async (req, res, next) => {
//   try {
//     const { certificateId } = req.params;

//     const cert = await Certificate.findOne({ certificateId }).lean();
//     if (!cert) return res.status(404).json({ success: false, message: "Certificate not found" });

//     const user = await User.findById(cert.userId).select("name").lean();

//     return res.json({
//       success: true,
//       certificate: {
//         certificateId: cert.certificateId,
//         status: cert.status,
//         issuedAt: cert.issuedAt,
//         type: cert.type,
//         pledgeTitle: cert.pledgeTitle,
//         name: cert.nameSnapshot || user?.name || "User",
//         issuedBy: "Paisavidhya",
//       },
//     });
//   } catch (err) {
//     next(err);
//   }
// };
