const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart"); // make sure your Cart model uses CommonJS
const { softAuth } = require("../middleware/authMiddleware");

// GET /cart
router.get("/", softAuth, async (req, res) => { // ✅ async added
  try {
    if (req.user) {
      // Logged-in user
      let cart = await Cart.findOne({ where: {userId: req.user.id} });
      if (!cart) {
        cart = await Cart.create({ userId: req.user.id, items: [] });
      }
      return res.json({ items: cart.items });
    } else {
      // Guest
      return res.json({ items: [] }); // frontend handles localStorage
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch cart" });
  }
});

// POST /cart
router.post("/", softAuth, async (req, res) => {
  const { items } = req.body;
  console.log("POST /cart items:", items);
  console.log("User:", req.user);

  try {
    if (req.user && req.user.id) {
      // Logged-in user
      const userId = req.user.id; // keep as string
      let cart = await Cart.findOne({where:{ userId } });

      if (!cart) {
        cart = new Cart({ user: userId, items });
      } else {
        cart.items = items;
      }

      await cart.save();
      return res.json({ success: true, cart });
    } else {
      // Guest user: frontend handles localStorage
      return res.json({ success: true });
    }
  } catch (err) {
    console.error("Cart save error:", err);
    res.status(500).json({ message: "Failed to save cart" });
  }
});

// DELETE /cart
router.delete("/", softAuth, async (req, res) => { // ✅ async added
  try {
    if (req.user) {
      await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to clear cart" });
  }
});

module.exports = router;