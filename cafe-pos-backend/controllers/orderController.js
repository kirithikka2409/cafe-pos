const Order = require("../models/Order");
const Staff = require("../models/User"); 

/* ================= PAY ORDER ================= */
exports.payOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod = "cash" } = req.body;

    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({ message: "Order already paid" });
    }

    await order.update({
      paymentStatus: "paid",
      paymentMethod,
      paidAt: new Date(),
    });

    // 🔥 re-fetch updated order WITH staff
    const updatedOrder = await Order.findByPk(id);

    return res.json({
      success: true,
      message: "Payment successful",
      order: updatedOrder,
    });
  } catch (err) {
    console.error("PAY ERROR:", err);
    res.status(500).json({ message: "Payment failed" });
  }
};
/* ================= CANCEL ORDER ================= */
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = "Cancelled by staff" } = req.body;

    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({ message: "Cannot cancel paid order" });
    }

    await order.update({
      status: "cancelled",
      cancelReason: reason,
    });

    return res.json({
      success: true,
      message: "Order cancelled",
      order,
    });

  } catch (err) {
    console.error("CANCEL ERROR:", err);
    res.status(500).json({ message: "Cancel failed" });
  }
};