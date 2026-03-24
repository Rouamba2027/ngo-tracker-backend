require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const Organization = require("../models/Organization");
const User = require("../models/User");

async function seed() {
  await connectDB();
  console.log("\n🌱  Seeding MongoDB...\n");

  await Promise.all([Organization.deleteMany({}), User.deleteMany({})]);
  console.log("✅  Collections vidées");

  const org = await Organization.create({
    name: "Croix Rouge Burkina",
    orgCode: "NGO-BF-2026-0001",
    receiptNumber: "2024-ONG-00142",
    country: "BF",
  });
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

  console.log("\n  Seeding terminé !");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Erreur seed :", err);
  process.exit(1);
});