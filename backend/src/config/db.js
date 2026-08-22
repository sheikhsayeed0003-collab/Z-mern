const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let memoryServer;

async function connectDB() {
  const isProd = process.env.NODE_ENV === "production";
  let uri = process.env.MONGODB_URI;
  const forceMemory = process.env.USE_MEMORY_DB === "true";

  if (isProd) {
    if (forceMemory || !uri) {
      throw new Error(
        "Production requires MONGODB_URI and USE_MEMORY_DB=false (persistent database)."
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
