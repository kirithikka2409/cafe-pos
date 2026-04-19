const jwt = require("jsonwebtoken");
const User = require("../models/User");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecretkey");
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

const verifyAdmin = (req, res, next) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
  next();
};

const softAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    req.user = null; // guest
    return next();
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecretkey");
    req.user = decoded;
  } catch {
    req.user = null; // invalid token = treat as guest
  }
  next();
};

const verifyStaff = (req, res, next) => {
  if (!["admin", "counter"].includes(req.user.role)) {
    return res.status(403).json({message: "Forbidden"});
  }
  next();
};

const verifyUser = (req, res, next) => {
  if (req.user.role !== "user") return res.status(403).json({ message: "Forbidden" });
  next();
}

module.exports = { verifyToken, verifyAdmin, verifyUser, verifyStaff, softAuth };
