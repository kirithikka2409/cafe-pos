const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const { Op } = require("sequelize");
const { verifyToken, verifyStaff } = require("../middleware/authMiddleware");

/* ================= KOT - KITCHEN ORDERS ================= */
router.get("/", verifyToken, verifyStaff, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: {
        status: {
          [Op.in]: ["pending", "preparing"]
        }
      },
      order: [["createdAt", "ASC"]],
    });

    res.json(orders);
  } catch (err) {
    console.error("KOT error:", err);
    res.status(500).json({ message: "Failed to fetch KOT" });
  }
});

module.exports = router;