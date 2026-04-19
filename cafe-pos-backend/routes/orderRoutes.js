const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const { verifyToken, verifyStaff, softAuth } = require("../middleware/authMiddleware");
const orderController = require("../controllers/orderController");

/* ================= CREATE ORDER ================= */
router.post("/", softAuth, async (req, res) => {
  try {
    console.log("ORDER REQUEST:", req.body);

    const {
      items = [],
      discount = 0,
      paymentMethod = "cash",
      staffId
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const itemsWithVat = items.map((item) => {
      const price = Number(item.price);
      const qty = Number(item.qty);

      const vat = +(price * qty * 0.05).toFixed(3);
      const amount = +(price * qty + vat).toFixed(3);

      return { ...item, price, qty, vat, amount };
    });

    const subtotal = itemsWithVat.reduce((sum, i) => sum + i.price * i.qty, 0);
    const totalVat = itemsWithVat.reduce((sum, i) => sum + i.vat, 0);

    const discountValue = (subtotal * discount) / 100;
    const total = +(subtotal - discountValue + totalVat).toFixed(3);

    const order = await Order.create({
      userId: req.user ? req.user.id : null,
      staffId: staffId,
      items: itemsWithVat,
      subtotal,
      discount,
      vat: totalVat,
      total,
      status: "pending",
      paymentStatus: "unpaid",
      paymentMethod,   // ✅ NOW IT EXISTS
      
    });

    return res.json({
      success: true,
      order
    });

  } catch (err) {
    console.error("ORDER CREATE ERROR:", err);
    return res.status(500).json({
      message: "Failed to place order",
      error: err.message
    });
  }
});

/* ================= GET ORDERS ================= */
router.get("/", async (req, res) => {
  try {
    const orders = await Order.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.json(orders);
  } catch (err) {
    console.error("GET ORDERS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch orders",
      error: err.message,
     });
  }
});

/* ================= GET ONE ================= */
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);

    if (!order) return res.status(404).json({ message: "Not found" });

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Failed" });
  }
});

/* ================= STATUS UPDATE ================= */
router.put("/:id/status",  async (req, res) => {
  try {
    const { status } = req.body;

    const allowed = ["pending", "preparing", "ready", "delivered", "cancelled"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findByPk(req.params.id);

    if (!order) return res.status(404).json({ message: "Not found" });

    order.status = status;
    await order.save();

    res.json({ success: true, order });

  } catch (err) {
    res.status(500).json({ message: "Failed" });
  }
});

/* ================= PAY ================= */
router.put("/:id/pay", orderController.payOrder);

/* ================= CANCEL ================= */
router.put("/:id/cancel", orderController.cancelOrder);

module.exports = router;