// ============================================================
// routes/dashboardRoute.js — /api/dashboard
// GET /  — Vue d'ensemble pour tous les utilisateurs authentifiés
// ============================================================

const express = require("express");
const router  = express.Router();

const { overview }     = require("../controllers/dashboardController");
const { authenticate } = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Tableau de bord et statistiques
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     DashboardStats:
 *       type: object
 *       properties:
 *         totalProjects:
 *           type: integer
 *           example: 12
 *         activeProjects:
 *           type: integer
 *           example: 8
 *         totalExpenses:
 *           type: number
 *           format: float
 *           example: 15750.50
 *         monthlyExpenses:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               month:
 *                 type: string
 *                 example: "2024-01"
 *               amount:
 *                 type: number
 *                 example: 3250.75
 *         recentProjects:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProjectSummary'
 *         recentExpenses:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ExpenseSummary'
 *     
 *     ProjectSummary:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         status:
 *           type: string
 *           enum: [active, completed, pending]
 *         budget:
 *           type: number
 *     
 *     ExpenseSummary:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         description:
 *           type: string
 *         amount:
 *           type: number
 *         date:
 *           type: string
 *           format: date
 */

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Obtenir la vue d'ensemble du tableau de bord
 *     description: Statistiques globales et données récentes pour l'utilisateur connecté
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Données du tableau de bord récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/DashboardStats'
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

router.get("/", authenticate, overview);

module.exports = router;