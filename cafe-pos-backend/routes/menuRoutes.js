const express = require("express");
const router = express.Router();
const MenuItem = require("../models/MenuItem");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 📁 Multer Storage Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ✅ GET ALL MENU
router.get("/", async (req, res) => {
  try {
    const items = await MenuItem.findAll({
     
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch menu" });
  }
});

// ✅ ADD NEW ITEM
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, price, category, discount, foodType } = req.body;

    const newItem = await MenuItem.create({
      name,
      price,
      category,
      image: req.file ? req.file.filename : null,
      discount: discount? parseFloat(discount): null,
      foodType: foodType || "Veg",
    });

    res.status(201).json(newItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add item" });
  }
});

// ✅ UPDATE ITEM (WITH IMAGE REPLACE)
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const item = await MenuItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const { name, price, category, discount, foodType } = req.body;

    // 🗑 Delete old image if new one uploaded
    if (req.file && item.image) {
      fs.unlink(`uploads/${item.image}`, (err) => {
        if (err) console.log("Old image delete error:", err);
      });
    }

    await item.update({
      name,
      price,
      category,
      image: req.file ? req.file.filename : item.image,
      discount: discount? parseFloat(discount): item.discount,
      foodType: foodType || item.foodType,
    });

    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update item" });
  }
});

// ✅ DELETE ITEM (DELETE IMAGE ALSO)
router.delete("/:id", async (req, res) => {
  try {
    const item = await MenuItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.image) {
      fs.unlink(`uploads/${item.image}`, (err) => {
        if (err) console.log("Image delete error:", err);
      });
    }

    await item.destroy();
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete item" });
  }
});

module.exports = router;
