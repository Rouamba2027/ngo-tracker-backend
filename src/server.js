// ============================================================
// server.js — Point d'entrée NGO Tracker API (Mongoose)
// ============================================================

require("dotenv").config();

const express    = require("express");
const cors       = require("cors");
const mongoose   = require("mongoose");
const connectDB  = require("./config/db");

// Swagger
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

// Routes
const authRoute         = require("./routes/authRoute");
const projectsRoute     = require("./routes/projectsRoute");
const expensesRoute     = require("./routes/expensesRoute");
const dashboardRoute    = require("./routes/dashboardRoute");
const reportsRoute      = require("./routes/reportsRoute");
const usersRoute        = require("./routes/usersRoute");
const organizationRoute = require("./routes/organizationRoute");

// Middleware
const logger                     = require("./middleware/loggerMiddleware");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

// App
const app  = express();
const PORT = process.env.PORT || 5000;

// Connexion MongoDB puis démarrage
connectDB().then(() => {
  // Configuration CORS complète
  app.use(cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://thunderous-torrone-7177f8.netlify.app",
      process.env.FRONTEND_URL
    ].filter(Boolean),
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  }));

  // Parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Logger
  app.use(logger);

  // Health check simple
  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "2.0.0",
      db: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
    });
  });

  // Route de statut améliorée
  app.get("/api/status", (req, res) => {
    res.json({
      status: "operational",
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
      version: "2.0.0",
      services: {
        api: "healthy",
        database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
        documentation: {
          url: "https://ngo-tracker-backend.onrender.com/api-docs",
          json: "https://ngo-tracker-backend.onrender.com/api-docs.json"
        }
      },
      frontend: {
        web: "https://thunderous-torrone-7177f8.netlify.app",
        mobile: "APK disponible (50.4 MB)"
      },
      uptime: process.uptime()
    });
  });

  // Configuration Swagger UI avec branding personnalisé
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { 
        color: #2c3e50;
        font-size: 36px;
      }
      .swagger-ui .info .title:after {
        content: "🚀 ${process.env.NODE_ENV === 'production' ? 'Production' : 'Development'}";
        font-size: 14px;
        margin-left: 15px;
        padding: 5px 15px;
        background: ${process.env.NODE_ENV === 'production' ? '#ff6b6b' : '#4ecdc4'};
        color: white;
        border-radius: 20px;
        vertical-align: middle;
      }
      .swagger-ui .btn.authorize {
        background-color: #27ae60;
        color: white;
      }
      .swagger-ui .scheme-container {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 10px;
      }
    `,
    customSiteTitle: "NGO Tracker API Documentation",
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      tryItOutEnabled: true,
      syntaxHighlight: {
        theme: "monokai"
      }
    }
  }));

  // Route pour la documentation JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(swaggerSpec);
  });

  // Routes API
  app.use("/api/auth",         authRoute);
  app.use("/api/projects",     projectsRoute);
  app.use("/api/expenses",     expensesRoute);
  app.use("/api/dashboard",    dashboardRoute);
  app.use("/api/reports",      reportsRoute);
  app.use("/api/users",        usersRoute);
  app.use("/api/organization", organizationRoute);

  // 404 + error handler
  app.use(notFound);
  app.use(errorHandler);

  // Listen
  app.listen(PORT, () => {
    console.log(`\n🌿  NGO Tracker API  →  http://localhost:${PORT}`);
    console.log(`   Environnement : ${process.env.NODE_ENV || "development"}`);
    console.log(`   Base de données : MongoDB (Mongoose)`);
    console.log(`   Health check : http://localhost:${PORT}/health`);
    console.log(`   Documentation Swagger : http://localhost:${PORT}/api-docs`);
    console.log(`   Documentation JSON : http://localhost:${PORT}/api-docs.json`);
    console.log(`   Frontend Web : https://thunderous-torrone-7177f8.netlify.app`);
    console.log(`   Status API : http://localhost:${PORT}/api/status\n`);
  });
});

module.exports = app;