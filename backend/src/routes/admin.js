const express = require("express");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Category = require("../models/Category");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.use(protect, adminOnly);

router.get("/stats", async (_req, res) => {
  try {
    const [users, products, orders, categories, revenue] = await Promise.all([
      User.countDocuments({ role: "user" }),
      Product.countDocuments(),
      Order.countDocuments(),
      Category.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: { $in: ["paid", "pending"] } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
    ]);
    res.json({
      stats: {
        users,
        products,
        orders,
        categories,
        revenue: revenue[0]?.total || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/users", async (_req, res) => {
  try {
    const users = await User.find({ role: "user" })
      .select("-password")
      .sort({ createdAt: -1 });
    res.json({
      users: users.map((u) => u.toSafeJSON()),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
