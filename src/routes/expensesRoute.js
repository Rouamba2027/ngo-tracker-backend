// ============================================================
// routes/expensesRoute.js — /api/expenses
// ADMIN   : CRUD complet sur toutes les dépenses de l'org
// MANAGER : lecture + créer/modifier/supprimer ses propres dépenses
// VIEWER  : lecture seule
// ============================================================

const express = require("express");
const router  = express.Router();

const { list, get, create, update, remove } = require("../controllers/expensesController");
const { authenticate, authorize }           = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Expenses
 *   description: Gestion des dépenses
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Expense:
 *       type: object
 *       required:
 *         - description
 *         - amount
 *         - date
 *         - category
 *       properties:
 *         id:
 *           type: string
 *           example: "60d21b4667d0d8992e610c90"
 *         description:
 *           type: string
 *           example: "Achat de fournitures de bureau"
 *         amount:
 *           type: number
 *           format: float
 *           example: 150.75
 *         date:
 *           type: string
 *           format: date
 *           example: "2024-03-15"
 *         category:
 *           type: string
 *           enum: [supplies, equipment, travel, food, utilities, other]
 *           example: "supplies"
 *         project:
 *           type: string
 *           description: "ID du projet associé (optionnel)"
 *           example: "60d21b4667d0d8992e610c88"
 *         createdBy:
 *           type: string
 *           description: "ID de l'utilisateur qui a créé la dépense"
 *         organization:
 *           type: string
 *           description: "ID de l'organisation"
 *         receipt:
 *           type: string
 *           description: "URL du justificatif (optionnel)"
 *         notes:
 *           type: string
 *           example: "Facture #INV-2024-015"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     ExpenseInput:
 *       type: object
 *       required:
 *         - description
 *         - amount
 *         - date
 *         - category
 *       properties:
 *         description:
 *           type: string
 *           example: "Achat de fournitures de bureau"
 *         amount:
 *           type: number
 *           format: float
 *           example: 150.75
 *         date:
 *           type: string
 *           format: date
 *           example: "2024-03-15"
 *         category:
 *           type: string
 *           enum: [supplies, equipment, travel, food, utilities, other]
 *           example: "supplies"
 *         project:
 *           type: string
 *           description: "ID du projet associé"
 *           example: "60d21b4667d0d8992e610c88"
 *         receipt:
 *           type: string
 *           format: binary
 *           description: "Fichier justificatif"
 *         notes:
 *           type: string
 *           example: "Facture #INV-2024-015"
 *     
 *     ExpenseListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         count:
 *           type: integer
 *           example: 25
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Expense'
 *         pagination:
 *           type: object
 *           properties:
 *             page:
 *               type: integer
 *             limit:
 *               type: integer
 *             total:
 *               type: integer
 *             pages:
 *               type: integer
 *     
 *     ExpenseResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Expense'
 */

/**
 * @swagger
 * /expenses:
 *   get:
 *     summary: Liste toutes les dépenses
 *     description: |
 *       Retourne la liste des dépenses selon les permissions :
 *       - ADMIN : toutes les dépenses de l'organisation
 *       - MANAGER : ses propres dépenses + celles des projets qu'il gère
 *       - VIEWER : toutes les dépenses de l'organisation (lecture seule)
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Nombre d'éléments par page
 *       - in: query
 *         name: project
 *         schema:
 *           type: string
 *         description: Filtrer par projet
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [supplies, equipment, travel, food, utilities, other]
 *         description: Filtrer par catégorie
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de début (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de fin (YYYY-MM-DD)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [date, -date, amount, -amount]
 *           default: -date
 *         description: Tri des résultats
 *     responses:
 *       200:
 *         description: Liste des dépenses récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExpenseListResponse'
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /expenses/{id}:
 *   get:
 *     summary: Récupère une dépense par son ID
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la dépense
 *     responses:
 *       200:
 *         description: Dépense trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExpenseResponse'
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès non autorisé à cette dépense
 *       404:
 *         description: Dépense non trouvée
 */

/**
 * @swagger
 * /expenses:
 *   post:
 *     summary: Crée une nouvelle dépense
 *     description: Accessible aux ADMIN et MANAGER
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ExpenseInput'
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/ExpenseInput'
 *     responses:
 *       201:
 *         description: Dépense créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExpenseResponse'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Permission refusée
 */

/**
 * @swagger
 * /expenses/{id}:
 *   put:
 *     summary: Met à jour une dépense
 *     description: |
 *       - ADMIN : peut modifier toutes les dépenses
 *       - MANAGER : peut modifier uniquement ses propres dépenses
 *     tags: [Expenses]
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
 *             $ref: '#/components/schemas/ExpenseInput'
 *     responses:
 *       200:
 *         description: Dépense mise à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExpenseResponse'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Permission refusée
 *       404:
 *         description: Dépense non trouvée
 */

/**
 * @swagger
 * /expenses/{id}:
 *   delete:
 *     summary: Supprime une dépense
 *     description: |
 *       - ADMIN : peut supprimer toutes les dépenses
 *       - MANAGER : peut supprimer uniquement ses propres dépenses
 *     tags: [Expenses]
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
 *         description: Dépense supprimée avec succès
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
 *                   example: "Dépense supprimée avec succès"
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Permission refusée
 *       404:
 *         description: Dépense non trouvée
 */

router.use(authenticate);

router.get("/",       list);
router.get("/:id",    get);
router.post("/",      authorize("ADMIN", "MANAGER"), create);
router.put("/:id",    authorize("ADMIN", "MANAGER"), update);
router.delete("/:id", authorize("ADMIN", "MANAGER"), remove);

module.exports = router;