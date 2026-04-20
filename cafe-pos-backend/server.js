const express = require("express");
const cors = require("cors");
require("dotenv").config();
const sequelize = require("./config/db");
const User = require("./models/User");
const bcrypt = require("bcryptjs");

// Routes
const authRoutes = require("./routes/authRoutes");
const menuRoutes = require("./routes/menuRoutes");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/orderRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const kotRoutes = require("./routes/kotRoutes");
const checkLicense = require("./middleware/checkLicense");

const app = express();
const PORT = process.env.PORT || 8080;

const FORCE_RESET = process.env.FORCE_RESET === "true";

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Public
app.use("/api/auth", authRoutes);
app.use("/api/license", require("./routes/licenseRoutes"));

// Protected
app.use("/api/menu", checkLicense, menuRoutes);
app.use("/api/cart", checkLicense, cartRoutes);
app.use("/api/orders", checkLicense, orderRoutes);
app.use("/api/dashboard", checkLicense, dashboardRoutes);
app.use("/api/kot", checkLicense, kotRoutes);

// ---------------- ADMIN SETUP ----------------
async function createDefaultAdmin() {
  try {
    const admin = await User.findOne({ where: { username: "admin" } });

    if (!admin) {
      const hashedPassword = await bcrypt.hash("admin123", 10);

      await User.create({
        name: "Admin",
        username: "admin",
        password: hashedPassword,
        role: "admin",
      });

      console.log("✅ Default admin created (admin / admin123)");
    } else {
      console.log("ℹ️ Admin already exists");
    }
  } catch (err) {
    console.error("❌ Admin creation error:", err);
  }
}

// ---------------- STARTUP ----------------
(async () => {
  try {
    console.log("=================================");
    console.log(" CAFE POS BACKEND STARTING ");
    console.log(" FORCE_RESET:", FORCE_RESET);
    console.log("=================================");

    // SAFETY CHECK (VERY IMPORTANT)
    if (FORCE_RESET && process.env.NODE_ENV === "production") {
      throw new Error("❌ INSTALL MODE BLOCKED IN PRODUCTION");
    }

    await sequelize.sync({ force: FORCE_RESET });

    if (FORCE_RESET) {
      console.log("⚠️ INSTALL MODE: DATABASE RESET DONE");
    }

    await createDefaultAdmin();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on ${PORT}`);
    });

  } catch (err) {
    console.error("❌ Server startup error:", err);
  }
})();