require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const Stripe = require("stripe");
const connectDB = require("./config/db");
const Order = require("./models/Order");
const { markOrderPaid } = require("./utils/payments");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const categoryRoutes = require("./routes/categories");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const adminRoutes = require("./routes/admin");
const seedIfEmpty = require("./utils/seedIfEmpty");

const app = express();

function corsOrigins() {
  const list = [
    process.env.CLIENT_URL,
    process.env.CLIENT_URL_WWW,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ].filter(Boolean);
  const extra = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return [...new Set([...list, ...extra])];
}

app.use(
  cors({
    origin(origin, callback) {
      const allowed = corsOrigins();
      // Allow non-browser / same-origin / Stripe tools with no Origin
      if (!origin || allowed.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.post(
  "/api/webhooks/stripe",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const stripe = process.env.STRIPE_SECRET_KEY
      ? new Stripe(process.env.STRIPE_SECRET_KEY)
      : null;
    if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
      console.error("Stripe webhook not configured");
      return res.status(400).send("Stripe webhook not configured");
    }
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        req.headers["stripe-signature"],
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const orderId = session.metadata?.orderId;
        if (orderId) {
          const order = await Order.findById(orderId);
          if (order) {
            const paymentIntentId =
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : session.payment_intent?.id;
            await markOrderPaid(order, paymentIntentId);
            console.log(`Order ${orderId} marked paid via webhook`);
          }
        }
      }
      res.json({ received: true });
    } catch (err) {
      console.error("Webhook handler error:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    stripe: Boolean(process.env.STRIPE_SECRET_KEY),
    webhook: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(async () => {
    await seedIfEmpty();
    app.listen(PORT, () => {
      console.log(`API running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect DB", err);
    process.exit(1);
  });
