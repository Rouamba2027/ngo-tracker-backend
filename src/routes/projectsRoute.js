// ============================================================
// routes/projectsRoute.js — /api/projects
// ADMIN : CRUD complet
// MANAGER : lecture seule (projets assignés)
// VIEWER  : lecture seule (tous les projets org)
// ============================================================

const express = require("express");
const router  = express.Router();

const {
  list, get, create, update, remove, projectExpenses,
} = require("../controllers/projectsController");

const { authenticate, authorize } = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Gestion des projets
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       required:
 *         - name
 *         - startDate
 *         - endDate
 *         - budget
 *       properties:
 *         id:
 *           type: string
 *           example: "60d21b4667d0d8992e610c88"
 *         name:
 *           type: string
 *           example: "Construction d'une école"
 *         description:
 *           type: string
 *           example: "Construction d'une école primaire dans la région rurale"
 *         startDate:
 *           type: string
 *           format: date
 *           example: "2024-01-01"
 *         endDate:
 *           type: string
 *           format: date
 *           example: "2024-12-31"
 *         budget:
 *           type: number
 *           format: float
 *           example: 50000.00
 *         status:
 *           type: string
 *           enum: [active, completed, pending, cancelled]
 *           example: "active"
 *         location:
 *           type: string
 *           example: "Dakar, Sénégal"
 *         manager:
 *           type: string
 *           description: "ID du manager responsable"
 *         organization:
 *           type: string
 *         expenses:
 *           type: array
 *           items:
 *             type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     ProjectInput:
 *       type: object
 *       required:
 *         - name
 *         - startDate
 *         - endDate
 *         - budget
 *       properties:
 *         name:
 *           type: string
 *           example: "Construction d'une école"
 *         description:
 *           type: string
 *           example: "Construction d'une école primaire"
 *         startDate:
 *           type: string
 *           format: date
 *           example: "2024-01-01"
 *         endDate:
 *           type: string
 *           format: date
 *           example: "2024-12-31"
 *         budget:
 *           type: number
 *           format: float
 *           example: 50000.00
 *         location:
 *           type: string
 *           example: "Dakar, Sénégal"
 *         manager:
 *           type: string
 *           description: "ID du manager responsable"
 *     
 *     ProjectWithStats:
 *       allOf:
 *         - $ref: '#/components/schemas/Project'
 *         - type: object
 *           properties:
 *             totalExpenses:
 *               type: number
 *               example: 12500.50
 *             remainingBudget:
 *               type: number
 *               example: 37499.50
 *             expenseCount:
 *               type: integer
 *               example: 15
 *             progress:
 *               type: number
 *               format: float
 *               example: 75.5
 *               description: "Pourcentage d'avancement basé sur le budget utilisé"
 *     
 *     ProjectListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         count:
 *           type: integer
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProjectWithStats'
 */

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Liste tous les projets
 *     description: |
 *       Retourne la liste des projets selon les permissions :
 *       - ADMIN : tous les projets
 *       - MANAGER : projets assignés uniquement
 *       - VIEWER : tous les projets (lecture seule)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed, pending, cancelled]
 *         description: Filtrer par statut
 *       - in: query
 *         name: manager
 *         schema:
 *           type: string
 *         description: Filtrer par manager
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Rechercher dans le nom et la description
 *     responses:
 *       200:
 *         description: Liste des projets
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectListResponse'
 */

/**
 * @swagger
 * /projects/{id}:
 *   get:
 *     summary: Récupère un projet par son ID
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Projet trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ProjectWithStats'
 *       404:
 *         description: Projet non trouvé
 */

/**
 * @swagger
 * /projects/{id}/expenses:
 *   get:
 *     summary: Récupère toutes les dépenses d'un projet
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dépenses du projet
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 project:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                 expenses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Expense'
 *                 summary:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     byCategory:
 *                       type: object
 */

/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Crée un nouveau projet
 *     description: Réservé aux administrateurs (ADMIN)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProjectInput'
 *     responses:
 *       201:
 *         description: Projet créé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Project'
 *       400:
 *         description: Données invalides
 *       403:
 *         description: Permission refusée
 */

/**
 * @swagger
 * /projects/{id}:
 *   put:
 *     summary: Met à jour un projet
 *     description: Réservé aux administrateurs (ADMIN)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProjectInput'
 *     responses:
 *       200:
 *         description: Projet mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Project'
 *       403:
 *         description: Permission refusée
 *       404:
 *         description: Projet non trouvé
 */

/**
 * @swagger
 * /projects/{id}:
 *   delete:
 *     summary: Supprime un projet
 *     description: Réservé aux administrateurs (ADMIN). Supprime également toutes les dépenses associées.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Projet supprimé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       403:
 *         description: Permission refusée
 *       404:
 *         description: Projet non trouvé
 */

router.use(authenticate);

router.get("/",            list);
router.get("/:id",         get);
router.get("/:id/expenses", projectExpenses);
router.post("/",           authorize("ADMIN"), create);
router.put("/:id",         authorize("ADMIN"), update);
router.delete("/:id",      authorize("ADMIN"), remove);

module.exports = router;