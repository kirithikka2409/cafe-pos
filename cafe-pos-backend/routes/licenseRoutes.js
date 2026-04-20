const express = require("express");
const router = express.Router();
const License = require("../models/License");
const {
  createLicense,
  activateLicense,
  validateLicense
} = require("../controllers/licenseController");

// CREATE
router.post("/create", createLicense);

// ACTIVATE
router.post("/activate", activateLicense);

// VALIDATE
router.get("/validate", validateLicense);

// ✅ STATUS (FIXED)
router.get("/status", async (req, res) => {
  try {
    const license = await License.findOne({
      where: { isActivated: true },
      order: [["createdAt", "DESC"]]
    });

    if (!license) {
      return res.json({ valid: false, message: "NO_LICENSE" });
    }

    const expired =
      license.expiryDate &&
      new Date() > new Date(license.expiryDate);

    if (expired) {
      return res.json({ valid: false, message: "EXPIRED" });
    }

    return res.json({
      valid: true,
      message: "ACTIVE",
      license
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      valid: false,
      message: "SERVER_ERROR"
    });
  }
});

module.exports = router;