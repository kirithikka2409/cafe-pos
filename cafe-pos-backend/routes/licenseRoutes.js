const express = require("express");
const router = express.Router();

const License = require("../models/License"); // ✅ FIXED IMPORT

const {
  createLicense,
  activateLicense,
  validateLicense
} = require("../controllers/licenseController");

// Create license
router.post("/create", createLicense);

// Activate license
router.post("/activate", activateLicense);

// Validate license
router.get("/validate", validateLicense);

// Get license status (frontend startup check)
router.get("/status", async (req, res) => {
  try {
    const license = await License.findOne({
      where: { isActivated: true },
      order: [["createdAt", "DESC"]],
    });

    if (!license) {
      return res.json({
        valid: false,
        message: "NO_LICENSE"
      });
    }

    const isExpired =
      license.expiryDate &&
      new Date() > new Date(license.expiryDate);

    if (isExpired) {
      return res.json({
        valid: false,
        message: "EXPIRED"
      });
    }

    return res.json({
      valid: true,
      message: "ACTIVE",
      license: {
        clientName: license.clientName,
        expiryDate: license.expiryDate
      }
    });

  } catch (err) {
    console.error("License status error:", err);
    return res.status(500).json({
      valid: false,
      message: "SERVER_ERROR"
    });
  }
});

module.exports = router;