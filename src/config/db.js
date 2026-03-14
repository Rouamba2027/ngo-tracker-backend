const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/ngo_tracker";
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log(`✅  MongoDB connecté → ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (err) {
    console.error("❌  Échec de connexion MongoDB :", err.message);
    process.exit(1);
  }
  mongoose.connection.on("disconnected", () => console.warn("⚠️  MongoDB déconnecté"));
  mongoose.connection.on("reconnected",  () => console.log("♻️  MongoDB reconnecté"));
}

module.exports = connectDB;