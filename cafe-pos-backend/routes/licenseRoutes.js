const express = require("express");
const router = express.Router();
const { createLicense, activateLicense, validateLicense } = require("../controllers/licenseController");

// ✅ CREATE LICENSE (controller handles everything)
router.post("/create", createLicense);

// Activation of License
router.post("/activate", activateLicense);

//Validate License
router.get("/validate", validateLicense);
module.exports = router;