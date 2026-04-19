const License = require("../models/License");

// 🔑 Generate License Key
const generateKey = () => {
  const part = () =>
    Math.random().toString(36).substring(2, 6).toUpperCase();

  return `BEANS-${part()}-${part()}-${part()}`;
};

const createLicense = async (req, res) => {
  try {
    const secret = req.headers["x-license-secret"];

    if (!secret || secret !== process.env.LICENSE_SECRET) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { clientName, days } = req.body;

    if (!clientName || !days) {
      return res.status(400).json({ message: "clientName and days required" });
    }

    let licenseKey;
    let attempts = 0;
    const maxAttempts = 10;

    // ensure unique key
    while (attempts < maxAttempts) {
      licenseKey = generateKey();

      const exists = await License.findOne({
        where: { licenseKey }
      });

      if (!exists) break;

      attempts++;
    }

    if (attempts === maxAttempts) {
      return res.status(500).json({
        message: "Failed to generate unique license key"
      });
    }

    const license = await License.create({
      clientName,
      licenseKey,
      days,
      isActive: true,
      isActivated: false,
      expiryDate: null,
      activatedAt: null
    });

    return res.status(201).json({
      message: "License created successfully",
      license: {
        clientName: license.clientName,
        licenseKey: license.licenseKey,
        days: license.days,
        isActivated: license.isActivated
      }
    });

  } catch (err) {
    console.error("License create error:", err);
    return res.status(500).json({ message: "Failed to create license", 
        error: err.message
     });

  }
};

const activateLicense = async (req, res) => {
  try {
    const { licenseKey, deviceId } = req.body;

    if (!licenseKey || !deviceId) {
      return res.status(400).json({ message: "Missing data" });
    }

    const license = await License.findOne({ where: { licenseKey } });

    if (!license) {
      return res.status(404).json({ message: "Invalid license key" });
    }

    if (!license.isActive) {
      return res.status(403).json({ message: "License inactive" });
    }

    let deviceIds = license.deviceIds || [];

    // already used on this device → allow
    if (deviceIds.includes(deviceId)) {
      return res.json({
        message: "Already activated on this device",
        expiryDate: license.expiryDate
      });
    }

    // limit check → max 2 devices
    if (deviceIds.length >= 2) {
      return res.status(403).json({
        message: "License already used on 2 devices"
      });
    }

    // activate new device
    deviceIds.push(deviceId);

    const now = new Date();
    const expiryDate = new Date(now);
    expiryDate.setDate(expiryDate.getDate() + Number(license.days));

    license.deviceIds = deviceIds;
    license.isActivated = true;
    license.activatedAt = license.activatedAt || now;
    license.expiryDate = license.expiryDate || expiryDate;

    await license.save();

    return res.json({
      message: "License activated successfully",
      devicesUsed: deviceIds.length,
      expiryDate
    });

  } catch (err) {
    return res.status(500).json({
      message: "Activation failed",
      error: err.message
    });
  }
};

const validateLicense = async (req, res) => {
  try {
    const deviceId = req.headers["x-device-id"];

    const license = await License.findOne({
      order: [["createdAt", "DESC"]]
    });

    if (!license) {
      return res.status(403).json({ message: "License not found" });
    }

    if (!license.isActivated) {
      return res.status(403).json({ message: "License not activated" });
    }

    if (license.expiryDate && new Date() > license.expiryDate) {
      return res.status(403).json({ message: "License expired" });
    }

    const deviceIds = license.deviceIds || [];

    if (!deviceIds.includes(deviceId)) {
      return res.status(403).json({
        message: "This device is not authorized"
      });
    }

    return res.json({
      message: "License valid",
      devicesUsed: deviceIds.length
    });

  } catch (err) {
    return res.status(500).json({ message: "License check failed" });
  }
};


module.exports = { 
    createLicense,
    activateLicense,
    validateLicense
 };