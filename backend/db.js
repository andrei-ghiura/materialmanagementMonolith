const mongoose = require("mongoose");
require("dotenv").config();

async function connectToDatabase() {
  console.log("Connecting to MongoDB:" + process.env.MONGODB_URL);
  const dbUrl = process.env.MONGODB_URL;
  try {
    await mongoose.connect(dbUrl, {
      user: process.env.MONGODB_APP_USER,
      pass: process.env.MONGODB_APP_PASSWORD,
    });
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}

module.exports = connectToDatabase;
