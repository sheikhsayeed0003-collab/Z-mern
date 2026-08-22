const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let memoryServer;

async function connectDB() {
  const isProd = process.env.NODE_ENV === "production";
  let uri = (process.env.MONGODB_URI || "").trim();
  const forceMemory = process.env.USE_MEMORY_DB === "true";

  // Production always needs Atlas (or any persistent URI). Memory DB cannot run on Vercel.
  if (isProd) {
    if (!uri) {
      throw new Error(
        "Missing MONGODB_URI. In Vercel → Settings → Environment Variables, set MONGODB_URI (mongodb+srv://...) and USE_MEMORY_DB=false for Production + Preview, then Redeploy."
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
