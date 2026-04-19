const License = require("../models/License");

const checkLicense = async (req, res, next) => {
  try {
    const license = await License.findOne({
      order: [["createdAt", "DESC"]],
    });

    if (!license) {
      return res.status(403).json({ message: "License not found" });
    }

    if (!license.isActivated) {
      return res.status(403).json({ message: "License not activated" });
    }

    if (
      license.expiryDate &&
      new Date() > new Date(license.expiryDate)
    ) {
      return res.status(403).json({ message: "License expired" });
    }

    // attach license
    req.license = license;

    next();
  } catch (err) {
    console.error("License error:", err);
    return res.status(500).json({ message: "License validation failed" });
  }
};

module.exports = checkLicense;