const express = require("express");
const Stripe = require("stripe");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { protect, adminOnly } = require("../middleware/auth");
const { decrementStock } = require("../utils/stock");
const { markOrderPaid } = require("../utils/payments");

const router = express.Router();

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

function unitPrice(product) {
  if (product.isFlashSale && product.flashSalePrice != null) {
    return product.flashSalePrice;
  }
  return product.price;
}

async function buildOrderItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Cart is empty");
  }
  const orderItems = [];
  let total = 0;
  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) throw new Error(`Product not found: ${item.productId}`);
    const qty = Number(item.qty) || 1;
    if (product.stock < qty) {
      throw new Error(`Insufficient stock for ${product.name}`);
    }
    const price = unitPrice(product);
    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.image,
      price,
      qty,
    });
    total += price * qty;
  }
  return { orderItems, total };
}

function normalizeName(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function normalizePhone(phone) {
  return String(phone || "").replace(/\D/g, "");
}

async function findDuplicateProductOrder(fullName, phone, orderItems) {
  const nameKey = normalizeName(fullName);
  const phoneKey = normalizePhone(phone);
  if (!nameKey || !phoneKey) return null;

  const previous = await Order.find({
    orderStatus: { $ne: "cancelled" },
  }).select("shippingAddress items");

  for (const order of previous) {
    if (normalizeName(order.shippingAddress?.fullName) !== nameKey) continue;
    if (normalizePhone(order.shippingAddress?.phone) !== phoneKey) continue;

    for (const newItem of orderItems) {
      const matched = order.items.find(
        (oldItem) =>
          String(oldItem.product) === String(newItem.product) &&
          Number(oldItem.qty) === Number(newItem.qty)
      );
      if (matched) {
        return matched.name || newItem.name;
      }
    }
  }
  return null;
}

const DUPLICATE_ORDER_MESSAGE =
  "You already ordered this product. Please choose a different product or number of units.";


router.get("/mine", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/", protect, adminOnly, async (_req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "firstName lastName email phone")
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/checkout", protect, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod = "cod" } = req.body;
    if (!shippingAddress?.fullName || !shippingAddress?.phone || !shippingAddress?.addressLine) {
      return res.status(400).json({ message: "Shipping address is required" });
    }
    const { orderItems, total } = await buildOrderItems(items);

    const duplicateName = await findDuplicateProductOrder(
      shippingAddress.fullName,
      shippingAddress.phone,
      orderItems
    );
    if (duplicateName) {
      return res.status(400).json({ message: DUPLICATE_ORDER_MESSAGE });
    }

    if (paymentMethod === "stripe") {
      const stripe = getStripe();
      if (!stripe) {
        return res.status(400).json({
          message: "Stripe is not configured. Use COD or set STRIPE_SECRET_KEY.",
        });
      }
      const order = await Order.create({
        user: req.user._id,
        items: orderItems,
        shippingAddress,
        paymentMethod: "stripe",
        paymentStatus: "pending",
        orderStatus: "pending",
        totalAmount: total,
      });

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: orderItems.map((item) => ({
          quantity: item.qty,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(item.price * 100),
            product_data: {
              name: item.name,
              images: item.image ? [item.image] : [],
            },
          },
        })),
        metadata: { orderId: order._id.toString() },
        success_url: `${process.env.CLIENT_URL}/checkout/success?orderId=${order._id}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/checkout/cancel?orderId=${order._id}`,
      });

      order.stripeSessionId = session.id;
      await order.save();
      return res.json({ order, checkoutUrl: session.url });
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod: "cod",
      paymentStatus: "pending",
      orderStatus: "pending",
      totalAmount: total,
    });
    await decrementStock(orderItems);
    res.status(201).json({ order });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Fallback when webhook is delayed/unavailable: verify Stripe session and mark paid
router.post("/:id/confirm-stripe", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }
    if (order.paymentStatus === "paid") {
      return res.json({ order, alreadyPaid: true });
    }
    if (order.paymentMethod !== "stripe" || !order.stripeSessionId) {
      return res.status(400).json({ message: "Not a Stripe order" });
    }

    const stripe = getStripe();
    if (!stripe) {
      return res.status(400).json({ message: "Stripe is not configured" });
    }

    const sessionId = req.body.sessionId || order.stripeSessionId;
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return res.status(400).json({
        message: "Payment not completed yet",
        payment_status: session.payment_status,
      });
    }

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;
    await markOrderPaid(order, paymentIntentId);
    res.json({ order, confirmed: true });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }
    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch("/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const allowed = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!allowed.includes(orderStatus)) {
      return res.status(400).json({ message: "Invalid order status" });
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus },
      { new: true }
    ).populate("user", "firstName lastName email phone");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
