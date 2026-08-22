const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let memoryServer;

async function connectDB() {
  // Prefer Atlas URI whenever it exists (Vercel injects this at runtime).
  let uri = (
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    process.env.DATABASE_URL ||
    ""
  ).trim();
  const forceMemory = process.env.USE_MEMORY_DB === "true";
  const onVercel = Boolean(process.env.VERCEL);
  const isProd = process.env.NODE_ENV === "production" || onVercel;

  if (isProd) {
    if (!uri) {
      console.error("DB env check", {
        hasMongoUri: Boolean(process.env.MONGODB_URI),
        nodeEnv: process.env.NODE_ENV,
        vercel: process.env.VERCEL || null,
      });
      throw new Error(
        "Missing MONGODB_URI on this deployment. Add it in Vercel → Project → Settings → Environment Variables (Production + Preview), then Redeploy."
      );
    }
    if (forceMemory) {
      console.warn(
        "USE_MEMORY_DB=true is ignored in production; using MONGODB_URI instead."
      );
    }
    await mongoose.connect(uri);
    console.log("MongoDB connected (production)");
    return;
  }

  if (forceMemory || !uri) {
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri("amer-ecommerce");
    console.log("Using in-memory MongoDB");
  }

  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (err) {
    console.warn("MongoDB connect failed, falling back to in-memory:", err.message);
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri("amer-ecommerce");
    await mongoose.connect(uri);
    console.log("MongoDB connected (in-memory fallback)");
  }
}

module.exports = connectDB;
