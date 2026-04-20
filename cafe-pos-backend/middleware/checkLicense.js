const License = require("../models/License");

const checkLicense = async (req, res, next) => {
  try {
    const license = await License.findOne({
      where: { isActivated: true }
    });

    if (!license) {
      return res.status(403).json({
        success: false,
        message: "License not activated"
      });
    }

    if (!license.isActivated) {
      return res.status(403).json({
        success: false,
        message: "License not activated"
      });
    }

    if (license.expiryDate) {
      const now = new Date();
      const expiry = new Date(license.expiryDate);

      if (now > expiry) {
        return res.status(403).json({
          success: false,
          message: "License expired"
        });
      }
    }

    req.license = license;
    next();

  } catch (err) {
    console.error("License error:", err);

    return res.status(500).json({
      success: false,
      message: "License validation failed"
    });
  }
};

module.exports = checkLicense;