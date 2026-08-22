const express = require("express");
const Product = require("../models/Product");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.flash === "true") filter.isFlashSale = true;
    if (req.query.popular === "true") filter.isPopular = true;
    if (req.query.q) {
      filter.$or = [
        { name: { $regex: req.query.q, $options: "i" } },
        { description: { $regex: req.query.q, $options: "i" } },
      ];
    }
    const products = await Product.find(filter)
      .populate("category", "name slug")
      .sort({ createdAt: -1 });
    res.json({ products });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category",
      "name slug"
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    const populated = await product.populate("category", "name slug");
    res.status(201).json({ product: populated });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("category", "name slug");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ product });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.patch("/:id/stock", protect, adminOnly, async (req, res) => {
  try {
    const { stock } = req.body;
    if (stock === undefined || Number(stock) < 0) {
      return res.status(400).json({ message: "Valid stock is required" });
    }
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stock: Number(stock) },
      { new: true }
    ).populate("category", "name slug");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
