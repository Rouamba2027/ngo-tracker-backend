require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const Organization = require("../models/Organization");
const User = require("../models/User");

async function seed() {
  await connectDB();
  console.log("\n🌱  Seeding MongoDB...\n");

  await Promise.all([
    Organization.deleteMany({}),
    User.deleteMany({})
  ]);
  console.log("✅  Collections vidées");

  // ✅ DONNÉES ORGANISATION AVEC CODES
  const orgData = {
    name: "Croix Rouge Burkina",
    orgCode: "NGO-BF-2026-0001",
    receiptNumber: "2024-ONG-00142",
    country: "BF",
  };

  console.log("DATA ENVOYÉE :", orgData);

  const org = await Organization.create(orgData);
  console.log("✅  Organisation créée :", org.name);

  const SALT = 10;

  const admin = await User.create({
    orgId: org._id,
    name: "Dr. Rémi Admin",
    email: "admin@croixrouge.bf",
    passwordHash: await bcrypt.hash("Admin1234!", SALT),
    role: "ADMIN",
  });

  console.log("✅  ADMIN créé :", admin.email);

  console.log("\n🎉 Seeding terminé !");
  console.log("ADMIN LOGIN → admin@croixrouge.bf / Admin1234!");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Erreur seed :", err);
  process.exit(1);
});
