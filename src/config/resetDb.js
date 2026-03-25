// resetDb.js — Vider la DB pour tests
const mongoose = require("mongoose");
const User = require("./models/User");
const Organization = require("./models/Organization");

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://<user>:<password>@ac-y1t2xq0-shard-00-02.uywhe8u.mongodb.net/ngo-tracker?retryWrites=true&w=majority";

async function resetDb() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("✅ MongoDB connecté");

    // Supprimer tous les documents
    await User.deleteMany({});
    await Organization.deleteMany({});
    console.log("🗑️  Collections vidées");

    // Supprimer tous les index uniques pour repartir propre
    await User.collection.dropIndexes();
    await Organization.collection.dropIndexes();
    console.log("⚡ Index uniques supprimés");

    console.log("🎉 Base réinitialisée avec succès !");
    process.exit(0);
  } catch (err) {
    console.error("Erreur lors de la réinitialisation :", err);
    process.exit(1);
  }
}

resetDb();