const checkLicense = (req, res, next) => {
  const license = global.cachedLicense;

  if (!license) {
    return res.status(403).json({
      success: false,
      message: "License not activated"
    });
  }

  if (license.expiryDate && new Date() > new Date(license.expiryDate)) {
    return res.status(403).json({
      success: false,
      message: "License expired"
    });
  }

  req.license = license;
  next();
};

module.exports = checkLicense;