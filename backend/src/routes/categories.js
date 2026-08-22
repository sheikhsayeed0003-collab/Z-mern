const express = require("express");
const Category = require("../models/Category");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

router.get("/", async (_req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json({ category });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { name, image } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });
    const category = await Category.create({
      name,
      slug: slugify(name),
      image: image || "",
    });
    res.status(201).json({ category });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    if (req.body.name) {
      category.name = req.body.name;
      category.slug = slugify(req.body.name);
    }
    if (req.body.image !== undefined) category.image = req.body.image;
    await category.save();
    res.json({ category });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
