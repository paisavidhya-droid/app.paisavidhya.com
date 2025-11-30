const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.warn("MONGO_URI not set, skipping DB connection");
      return;
    }
    await mongoose.connect(uri);
    console.log("MongoDB connected (bse-service)");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    // you can exit if DB is mandatory:
    // process.exit(1);
  }
};

module.exports = { connectDB };
