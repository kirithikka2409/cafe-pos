const express = require("express");
const cors = require("cors");
require("dotenv").config();
const sequelize = require("./config/db");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const License = require("./models/License");

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

// middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/license", require("./routes/licenseRoutes"));

app.use("/api/menu", checkLicense, menuRoutes);
app.use("/api/cart", checkLicense, cartRoutes);
app.use("/api/orders", checkLicense, orderRoutes);
app.use("/api/dashboard", checkLicense, dashboardRoutes);
app.use("/api/kot", checkLicense, kotRoutes);

// admin
async function createDefaultAdmin() {
  const admin = await User.findOne({ where: { username: "admin" } });

  if (!admin) {
    const hashedPassword = await bcrypt.hash("admin123", 10);

    await User.create({
      name: "Admin",
      username: "admin",
      password: hashedPassword,
      role: "admin",
    });

    console.log("✅ Default admin created");
  }
}

// license cache
async function loadLicense() {
  try {
    global.cachedLicense = await License.findOne({
      where: { isActivated: true },
      order: [["createdAt", "DESC"]],
    });

    console.log("🔑 License loaded");
  } catch (err) {
    console.error("❌ License load error:", err);
    global.cachedLicense = null;
  }
}

// startup
(async () => {
  try {
    console.log("CAFE POS STARTING...");

    if (FORCE_RESET && process.env.NODE_ENV === "production") {
      throw new Error("INSTALL MODE BLOCKED");
    }

    await sequelize.sync({
      force: FORCE_RESET && process.env.INSTALL_MODE === "true",
    });

    await loadLicense();
    await createDefaultAdmin();

    // optional refresh
    setInterval(loadLicense, 5 * 60 * 1000);

    app.listen(PORT, () => {
      console.log(`🚀 Running on ${PORT}`);
    });

  } catch (err) {
    console.error("SERVER ERROR:", err);
  }
})();