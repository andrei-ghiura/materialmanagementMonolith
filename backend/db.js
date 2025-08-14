const mongoose = require("mongoose");
require("dotenv").config();

async function connectToDatabase() {
  const dbUrl =
    process.env.MONGODB_URL || "mongodb://localhost:27017/materialmanager_db";
  console.log("Connecting to MongoDB:" + dbUrl);
  try {
    await mongoose.connect(dbUrl, {
      user: process.env.MONGODB_USER || "mongo_app_user",
      pass: process.env.MONGODB_PASSWORD || "mongo_app_password",
    });
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}

module.exports = connectToDatabase;
