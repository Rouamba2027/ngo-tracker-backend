require("dotenv").config();

const mongoose     = require("mongoose");
const bcrypt       = require("bcryptjs");
const connectDB    = require("../config/db");
const Organization = require("../models/Organization");
const User         = require("../models/User");
const Project      = require("../models/Project");
const Expense      = require("../models/Expense");
const Report       = require("../models/Report");

async function seed() {
  await connectDB();
  console.log("\n🌱  Seeding MongoDB...\n");

  await Promise.all([
    Organization.deleteMany({}),
    User.deleteMany({}),
    Project.deleteMany({}),
    Expense.deleteMany({}),
    Report.deleteMany({}),
  ]);
  console.log("✅  Collections vidées");

  const org = await Organization.create({
    name:          "Croix Rouge Burkina",
    orgCode:       "NGO-BF-2025-0042",
    receiptNumber: "2024-ONG-00142",
    country:       "BF",
  });
  console.log("✅  Organisation créée :", org.name);

  const SALT = 10;
  const [admin, manager] = await User.create([
    {
      orgId:        org._id,
      name:         "Dr. Rémi Admin",
      email:        "admin@croixrouge.bf",
      passwordHash: await bcrypt.hash("Admin1234!", SALT),
      role:         "ADMIN",
    },
    {
      orgId:        org._id,
      name:         "Marie Traoré",
      email:        "manager@croixrouge.bf",
      passwordHash: await bcrypt.hash("Manager1234!", SALT),
      role:         "MANAGER",
    },
    {
      orgId:        org._id,
      name:         "Paul Donateur",
      email:        "viewer@croixrouge.bf",
      passwordHash: await bcrypt.hash("Viewer1234!", SALT),
      role:         "VIEWER",
    },
  ]);
  console.log("✅  3 utilisateurs créés");

  const [p1, p2, p3, p4, p5] = await Project.create([
    {
      orgId: org._id, name: "Forage villages Sahel", domain: "water",
      status: "exceeded", budgetAllocated: 8000000, budgetSpent: 9200000,
      startDate: "2024-01-01", endDate: "2024-12-31",
      assignedManagers: [manager._id], createdBy: admin._id,
    },
    {
      orgId: org._id, name: "Vaccination Zone Nord", domain: "health",
      status: "pending", budgetAllocated: 12500000, budgetSpent: 8200000,
      startDate: "2024-03-01", endDate: "2025-02-28",
      assignedManagers: [manager._id], createdBy: admin._id,
    },
    {
      orgId: org._id, name: "Nutrition enfants Ouaga", domain: "health",
      status: "active", budgetAllocated: 7000000, budgetSpent: 2100000,
      startDate: "2024-06-01", endDate: "2025-05-31",
      assignedManagers: [], createdBy: admin._id,
    },
    {
      orgId: org._id, name: "Alphabetisation femmes rurales", domain: "education",
      status: "active", budgetAllocated: 4500000, budgetSpent: 1800000,
      startDate: "2024-09-01", endDate: "2025-08-31",
      assignedManagers: [], createdBy: admin._id,
    },
    {
      orgId: org._id, name: "Distribution kits scolaires", domain: "education",
      status: "done", budgetAllocated: 3200000, budgetSpent: 3100000,
      startDate: "2023-09-01", endDate: "2023-12-31",
      assignedManagers: [manager._id], createdBy: admin._id,
    },
  ]);
  console.log("✅  5 projets créés");

  await Expense.create([
    { projectId: p1._id, orgId: org._id, createdBy: manager._id, amount: 3500000, category: "material",  description: "Achat equipements de forage",      date: "2024-02-15" },
    { projectId: p1._id, orgId: org._id, createdBy: manager._id, amount: 2800000, category: "staff",     description: "Salaires equipe terrain Q1",       date: "2024-03-31" },
    { projectId: p1._id, orgId: org._id, createdBy: manager._id, amount: 2900000, category: "transport", description: "Logistique et carburant",           date: "2024-05-10" },
    { projectId: p2._id, orgId: org._id, createdBy: manager._id, amount: 5000000, category: "material",  description: "Vaccins et materiel medical",       date: "2024-04-01" },
    { projectId: p2._id, orgId: org._id, createdBy: manager._id, amount: 3200000, category: "staff",     description: "Agents de sante communautaires",   date: "2024-06-30" },
    { projectId: p3._id, orgId: org._id, createdBy: admin._id,   amount: 1200000, category: "material",  description: "Aliments therapeutiques",           date: "2024-07-01" },
    { projectId: p3._id, orgId: org._id, createdBy: admin._id,   amount:  900000, category: "staff",     description: "Nutritionnistes benevoles",        date: "2024-08-31" },
    { projectId: p4._id, orgId: org._id, createdBy: admin._id,   amount: 1800000, category: "material",  description: "Manuels et fournitures scolaires",  date: "2024-10-15" },
    { projectId: p5._id, orgId: org._id, createdBy: manager._id, amount: 3100000, category: "material",  description: "Kits scolaires complets",          date: "2023-11-01" },
  ]);
  console.log("✅  9 depenses creees");

  await Report.create([
    { orgId: org._id, projectId: p1._id, title: "Rapport trimestriel Q1 Forage Sahel",  type: "quarterly", generatedBy: admin._id, generatedAt: new Date("2024-04-05") },
    { orgId: org._id, projectId: p2._id, title: "Rapport semestriel Vaccination Nord",  type: "semester",  generatedBy: admin._id, generatedAt: new Date("2024-07-01") },
    { orgId: org._id, projectId: null,   title: "Rapport annuel ONG 2023",              type: "annual",    generatedBy: admin._id, generatedAt: new Date("2024-01-20") },
  ]);
  console.log("✅  3 rapports créés");

  console.log("\n  Seeding terminé !");
  console.log("  ADMIN   admin@croixrouge.bf    Admin1234!    code: NGO-BF-2025-0042");
  console.log("  MANAGER manager@croixrouge.bf  Manager1234!");
  console.log("  VIEWER  viewer@croixrouge.bf   Viewer1234!\n");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Erreur seed :", err);
  process.exit(1);
});