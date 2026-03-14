// ============================================================
// server.js — Point d'entrée NGO Tracker API (Mongoose)
//
// Démarrage :
//   npm start       →  node src/server.js        (production)
//   npm run dev     →  nodemon src/server.js      (développement)
//   npm run seed    →  node src/utils/seed.js     (données démo)
//
// Variables d'environnement (.env) :
//   PORT         — port d'écoute           défaut : 5000
//   MONGODB_URI  — URI MongoDB             défaut : localhost/ngo_tracker
//   JWT_SECRET   — clé de signature JWT   défaut : dev_secret
//   JWT_EXPIRES_IN — durée du token       défaut : 7d
//   FRONTEND_URL — origine CORS autorisée défaut : *
//   NODE_ENV     — development | production
// ============================================================

require("dotenv").config();

const express    = require("express");
const cors       = require("cors");
const connectDB  = require("./config/db");

// ── Routes ───────────────────────────────────────────────────
const authRoute         = require("./routes/authRoute");
const projectsRoute     = require("./routes/projectsRoute");
const expensesRoute     = require("./routes/expensesRoute");
const dashboardRoute    = require("./routes/dashboardRoute");
const reportsRoute      = require("./routes/reportsRoute");
const usersRoute        = require("./routes/usersRoute");
const organizationRoute = require("./routes/organizationRoute");

// ── Middleware ───────────────────────────────────────────────
const logger                     = require("./middleware/loggerMiddleware");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

// ── App ───────────────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 5000;

// ── Connexion MongoDB puis démarrage ─────────────────────────
connectDB().then(() => {
  // CORS
  app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:3000", process.env.FRONTEND_URL].filter(Boolean),
    methods:        ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }));

  // Parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Logger
  app.use(logger);

  // ── Health check ─────────────────────────────────────────
  app.get("/health", (_req, res) => {
    res.json({
      status:    "ok",
      timestamp: new Date().toISOString(),
      version:   "2.0.0",
      db:        "mongodb",
    });
  });

  // ── Routes API ───────────────────────────────────────────
  app.use("/api/auth",         authRoute);
  app.use("/api/projects",     projectsRoute);
  app.use("/api/expenses",     expensesRoute);
  app.use("/api/dashboard",    dashboardRoute);
  app.use("/api/reports",      reportsRoute);
  app.use("/api/users",        usersRoute);
  app.use("/api/organization", organizationRoute);

  // ── 404 + error handler ──────────────────────────────────
  app.use(notFound);
  app.use(errorHandler);

  // ── Listen ───────────────────────────────────────────────
  app.listen(PORT, () => {
    console.log(`\n🌿  NGO Tracker API  →  http://localhost:${PORT}`);
    console.log(`   Environnement : ${process.env.NODE_ENV || "development"}`);
    console.log(`   Base de données : MongoDB (Mongoose)`);
    console.log(`   Health check : http://localhost:${PORT}/health`);
    console.log("\n   Routes disponibles :");
    console.log("     POST   /api/auth/register");
    console.log("     POST   /api/auth/login");
    console.log("     GET    /api/auth/me");
    console.log("     GET    /api/dashboard");
    console.log("     GET|POST             /api/projects");
    console.log("     GET|PUT|DELETE       /api/projects/:id");
    console.log("     GET                  /api/projects/:id/expenses");
    console.log("     GET|POST             /api/expenses");
    console.log("     GET|PUT|DELETE       /api/expenses/:id");
    console.log("     GET                  /api/reports");
    console.log("     POST                 /api/reports/generate");
    console.log("     GET|DELETE           /api/reports/:id");
    console.log("     GET                  /api/users");
    console.log("     GET|PUT|DELETE       /api/users/:id");
    console.log("     GET|PUT              /api/organization\n");
  });
});

module.exports = app;
