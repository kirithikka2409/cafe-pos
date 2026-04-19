const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

/* ================= LOGIN USER ================= */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });
    if (!user)
      return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || "supersecretkey",
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
});



/* ================= ADMIN CREATE USER ================= */
router.post("/create-user", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, username, password } = req.body;

    if (!name || !username || !password)
      return res.status(400).json({ message: "All Fields required" });

    const existing = await User.findOne({ where: { username } });
    if (existing)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      username,
      password: hashedPassword,
      role: "counter", // ALWAYS counter
    });

    res.json({
      message: "Counter user created successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        username: newUser.username,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create user" });
  }
});

router.get("/staff", verifyToken, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "username", "role"],
    });

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch staff" });
  }
});

router.delete("/staff/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const id = req.params.id;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.destroy();

    res.json({ message: "Staff deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete staff" });
  }
});

router.put("/staff/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, username, role } = req.body;

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name || user.name;
    user.username = username || user.username;
    user.role = role || user.role;

    await user.save();

    res.json({ message: "Staff updated", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update staff" });
  }
});

/* ================= CREATE ADMIN  ================= */
router.post("/create-admin", async (req, res) => {
  try {
    const { name, username, password } = req.body;

    if (!name || !username || !password)
      return res.status(400).json({ message: "All fields required" });

    const existing = await User.findOne({ where: { username } });
    if (existing)
      return res.status(400).json({ message: "Admin already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name,
      username,
      password: hashedPassword,
      role: "admin",
    });

    res.json({
      message: "Admin created successfully",
      admin,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create admin" });
  }
});

module.exports = router;