require("dotenv").config({
  // Always load backend/.env when present; never override real platform env (Vercel).
  path: require("path").join(__dirname, "../.env"),
  override: false,
});
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
    "https://z-mern.vercel.app",
    "https://z-mern-sayeed8.vercel.app",
    "https://z-mern-five.vercel.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ].filter(Boolean);
  const extra = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (process.env.VERCEL_URL) {
    list.push(`https://${process.env.VERCEL_URL}`);
  }
  return [...new Set([...list, ...extra])];
}

function isAllowedOrigin(origin) {
  if (!origin) return true;
  const allowed = corsOrigins();
  if (allowed.includes(origin)) return true;
  // Vercel preview / alias URLs for this app
  try {
    const host = new URL(origin).hostname;
    if (
      host === "z-mern.vercel.app" ||
      (host.endsWith(".vercel.app") && host.includes("z-mern"))
    ) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

const isVercel = Boolean(process.env.VERCEL);
let dbReady = null;
function ensureDb() {
  if (!dbReady) {
    dbReady = connectDB()
      .then(() => seedIfEmpty())
      .catch((err) => {
        dbReady = null;
        throw err;
      });
  }
  return dbReady;
}

app.use(async (req, res, next) => {
  try {
    await ensureDb();
    next();
  } catch (err) {
    next(err);
  }
});

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
  const mongoConfigured = Boolean(
    (process.env.MONGODB_URI || process.env.MONGO_URI || "").trim()
  );
  res.json({
    status: "ok",
    ok: true,
    mongoConfigured,
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

// Vercel loads this file as a serverless function — export the app.
module.exports = app;

if (!isVercel) {
  ensureDb()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`API running on http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error("Failed to connect DB", err);
      process.exit(1);
    });
}
