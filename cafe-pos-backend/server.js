const express = require("express");
const cors = require("cors");
require("dotenv").config();
const sequelize = require("./config/db");

// Import routes
const authRoutes = require("./routes/authRoutes");
const menuRoutes = require("./routes/menuRoutes");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/orderRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes"); // ✅ note the .js is optional
const kotRoutes = require("./routes/kotRoutes");
const checkLicense = require("./middleware/checkLicense");
const User = require("./models/User");
const bcrypt = require("bcryptjs");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));


// Public routes
app.use("/api/auth", authRoutes);
app.use("/api/license", require("./routes/licenseRoutes"));

//Protected Routes
app.use("/api/menu", checkLicense, menuRoutes);
app.use("/api/cart", checkLicense, cartRoutes);
app.use("/api/orders", checkLicense, orderRoutes);
app.use("/api/dashboard", checkLicense, dashboardRoutes); // ✅ this is correct
app.use("/api/kot", checkLicense, kotRoutes);
// Start server
const PORT = process.env.PORT || 8080;

const bcrypt = require("bcryptjs");

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

sequelize.sync({ alter: false }).then(async () => {
  try {
    console.log("DB synced");

    await createDefaultAdmin();

    app.listen(PORT, () => {
      console.log(`Server running on ${PORT}`);
    });

  } catch (err) {
    console.error("Startup error:", err);
  }
});