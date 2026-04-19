const express = require("express");
const router = express.Router();
const {
  getFullDashboard
} = require("../controllers/dashboardController");

// Full dashboard route
router.get("/full", async (req, res) => {
  try {
    const { month, date } = req.query;
    const dashboardData = await getFullDashboard(month, date);
    res.json(dashboardData);
  } catch (err) {
    console.error("Dashboard route error:", err);
    res.status(500).json({ message: "Failed to load dashboard" });
  }
});

// Specific Date Range
router.get("/range", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Missing dates" });
    }

    const { Op } = require("sequelize");
    const Order = require("../models/Order");

    const orders = await Order.findAll({
      where: {
        createdAt: {
          [Op.between]: [
            new Date(startDate + "T00:00:00"),
            new Date(endDate + "T23:59:59")
          ]
        }
      }
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);

    res.json({
      totalOrders,
      totalRevenue
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Range export failed" });
  }
});

module.exports = router;