// ============================================================
// routes/reportsRoute.js — /api/reports
// ADMIN   : lecture + générer + supprimer
// MANAGER : lecture + générer (pas de suppression)
// VIEWER  : lecture seule
// ============================================================

const express = require("express");
const router  = express.Router();

const { list, get, generate, remove } = require("../controllers/reportsController");
const { authenticate, authorize }     = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Génération et gestion des rapports
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Report:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "60d21b4667d0d8992e610c95"
 *         title:
 *           type: string
 *           example: "Rapport financier Q1 2024"
 *         type:
 *           type: string
 *           enum: [financial, project, expense, organization, custom]
 *           example: "financial"
 *         format:
 *           type: string
 *           enum: [pdf, excel, csv, json]
 *           example: "pdf"
 *         parameters:
 *           type: object
 *           properties:
 *             startDate:
 *               type: string
 *               format: date
 *               example: "2024-01-01"
 *             endDate:
 *               type: string
 *               format: date
 *               example: "2024-03-31"
 *             projects:
 *               type: array
 *               items:
 *                 type: string
 *             includeCharts:
 *               type: boolean
 *               example: true
 *         url:
 *           type: string
 *           example: "/reports/60d21b4667d0d8992e610c95.pdf"
 *         size:
 *           type: integer
 *           description: "Taille du fichier en bytes"
 *         createdBy:
 *           type: string
 *           description: "ID de l'utilisateur ayant généré le rapport"
 *         organization:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: "Date d'expiration du rapport (30 jours par défaut)"
 *     
 *     ReportInput:
 *       type: object
 *       required:
 *         - type
 *         - format
 *         - parameters
 *       properties:
 *         title:
 *           type: string
 *           example: "Rapport financier Q1 2024"
 *         type:
 *           type: string
 *           enum: [financial, project, expense, organization, custom]
 *           example: "financial"
 *         format:
 *           type: string
 *           enum: [pdf, excel, csv, json]
 *           example: "pdf"
 *         parameters:
 *           type: object
 *           required:
 *             - startDate
 *             - endDate
 *           properties:
 *             startDate:
 *               type: string
 *               format: date
 *               example: "2024-01-01"
 *             endDate:
 *               type: string
 *               format: date
 *               example: "2024-03-31"
 *             projects:
 *               type: array
 *               items:
 *                 type: string
 *               description: "IDs des projets à inclure (vide = tous)"
 *             categories:
 *               type: array
 *               items:
 *                 type: string
 *                 enum: [supplies, equipment, travel, food, utilities, other]
 *             groupBy:
 *               type: string
 *               enum: [month, project, category]
 *               example: "month"
 *             includeCharts:
 *               type: boolean
 *               default: true
 *             detailed:
 *               type: boolean
 *               default: false
 *     
 *     ReportListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         count:
 *           type: integer
 *           example: 15
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Report'
 *     
 *     ReportResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Report'
 *     
 *     ReportGenerationResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Rapport généré avec succès"
 *         data:
 *           $ref: '#/components/schemas/Report'
 *         downloadUrl:
 *           type: string
 *           example: "/api/reports/60d21b4667d0d8992e610c95/download"
 */

/**
 * @swagger
 * /reports:
 *   get:
 *     summary: Liste tous les rapports générés
 *     description: |
 *       Retourne la liste des rapports selon les permissions :
 *       - ADMIN : tous les rapports de l'organisation
 *       - MANAGER/VIEWER : uniquement ses propres rapports
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [financial, project, expense, organization, custom]
 *         description: Filtrer par type de rapport
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [pdf, excel, csv, json]
 *         description: Filtrer par format
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de début de création
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de fin de création
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: Liste des rapports
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReportListResponse'
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /reports/{id}:
 *   get:
 *     summary: Récupère les détails d'un rapport
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du rapport
 *     responses:
 *       200:
 *         description: Détails du rapport
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReportResponse'
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès non autorisé à ce rapport
 *       404:
 *         description: Rapport non trouvé
 */

/**
 * @swagger
 * /reports/generate:
 *   post:
 *     summary: Génère un nouveau rapport
 *     description: |
 *       Accessible aux ADMIN et MANAGER.
 *       La génération peut prendre quelques secondes selon la quantité de données.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReportInput'
 *           examples:
 *             FinancialReport:
 *               summary: Rapport financier trimestriel
 *               value:
 *                 title: "Rapport financier Q1 2024"
 *                 type: "financial"
 *                 format: "pdf"
 *                 parameters:
 *                   startDate: "2024-01-01"
 *                   endDate: "2024-03-31"
 *                   groupBy: "month"
 *                   includeCharts: true
 *             ProjectReport:
 *               summary: Rapport détaillé par projet
 *               value:
 *                 title: "Analyse des projets actifs"
 *                 type: "project"
 *                 format: "excel"
 *                 parameters:
 *                   startDate: "2024-01-01"
 *                   endDate: "2024-12-31"
 *                   projects: ["proj1_id", "proj2_id"]
 *                   detailed: true
 *     responses:
 *       202:
 *         description: Rapport en cours de génération
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReportGenerationResponse'
 *       400:
 *         description: Paramètres invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Permission refusée (nécessite ADMIN ou MANAGER)
 *       429:
 *         description: Trop de requêtes, veuillez patienter
 */

/**
 * @swagger
 * /reports/{id}:
 *   delete:
 *     summary: Supprime un rapport
 *     description: |
 *       - ADMIN : peut supprimer tous les rapports
 *       - MANAGER : peut supprimer uniquement ses propres rapports
 *       - VIEWER : pas de suppression
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du rapport à supprimer
 *     responses:
 *       200:
 *         description: Rapport supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Rapport supprimé avec succès"
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Permission refusée
 *       404:
 *         description: Rapport non trouvé
 */

/**
 * @swagger
 * /reports/{id}/download:
 *   get:
 *     summary: Télécharge un rapport
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du rapport à télécharger
 *     responses:
 *       200:
 *         description: Fichier du rapport
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès non autorisé
 *       404:
 *         description: Rapport ou fichier non trouvé
 *       410:
 *         description: Rapport expiré
 */

router.use(authenticate);

router.get("/",          list);
router.get("/:id",       get);
router.post("/generate", authorize("ADMIN", "MANAGER"), generate);
router.delete("/:id",    authorize("ADMIN"), remove);

module.exports = router;