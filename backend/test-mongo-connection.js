require("dotenv").config();
const mongoose = require("mongoose");

async function testConnection() {
  const dbUrl =
    process.env.MONGODB_URL || "mongodb://localhost:27017/defaultdb";
  const user = process.env.MONGODB_APP_USER || "defaultUser";
  const pass = process.env.MONGODB_APP_PASSWORD || "defaultPassword";
  console.log("Testing MongoDB connection with:");
  console.log("URL:", dbUrl);
  console.log("User:", user);
  try {
    await mongoose.connect(dbUrl, { user, pass });
    console.log("✅ Successfully connected to MongoDB");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

testConnection();
