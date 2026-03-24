// config/swagger.js
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "NGO Tracker API",
      version: "1.0.0",
      description: "API documentation for NGO Tracker system",
    },
    servers: [
      { url: "http://localhost:5000" }, // pour dev
      // { url: "https://ton-backend.onrender.com" } // pour prod
    ],
  },
  apis: [
  "./routes/*.js",
  "./config/usersSwagger.js" // <- ajoute cette ligne
],
};

// Génération de la doc swagger
const specs = swaggerJsdoc(swaggerOptions);

function setupSwagger(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
}

module.exports = setupSwagger;