import AppSettings from "../models/appSettings.model.js";

async function getOrCreateSettings() {
  let settings = await AppSettings.findOne({ key: "global" });

  if (!settings) {
    settings = await AppSettings.create({
      key: "global",
      verification: {
        otpBypassEnabled: false,
      },
    });
  }

  return settings;
}

export const getVerificationSettings = async (req, res, next) => {
  try {
    const settings = await getOrCreateSettings();

    return res.json({
      ok: true,
      settings: {
        otpBypassEnabled: !!settings?.verification?.otpBypassEnabled,
        updatedAt: settings.updatedAt || null,
        updatedBy: settings.updatedBy || null,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateVerificationSettings = async (req, res, next) => {
  try {
    const { otpBypassEnabled } = req.body;

    const settings = await getOrCreateSettings();

    if (typeof otpBypassEnabled === "boolean") {
      settings.verification.otpBypassEnabled = otpBypassEnabled;
    }

    settings.updatedBy = req.user?._id || null;
    await settings.save();

    return res.json({
      ok: true,
      settings: {
        otpBypassEnabled: !!settings?.verification?.otpBypassEnabled,
        updatedAt: settings.updatedAt || null,
        updatedBy: settings.updatedBy || null,
      },
    });
  } catch (err) {
    next(err);
  }
};