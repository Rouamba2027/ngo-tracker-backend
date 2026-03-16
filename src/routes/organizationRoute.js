// ============================================================
// routes/organizationRoute.js — /api/organization
// GET /  — lecture pour tous
// PUT /  — modification nom/pays (ADMIN uniquement)
// ============================================================

const express = require("express");
const router  = express.Router();

const { get, update }           = require("../controllers/organizationController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Organization
 *   description: Gestion des organisations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Organization:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "60d21b4667d0d8992e610c86"
 *         name:
 *           type: string
 *           example: "Médecins Sans Frontières"
 *         country:
 *           type: string
 *           example: "France"
 *         orgCode:
 *           type: string
 *           example: "MSF2024"
 *           description: "Code d'invitation unique pour rejoindre l'organisation"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         members:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [ADMIN, MANAGER, VIEWER]
 *         stats:
 *           type: object
 *           properties:
 *             totalMembers:
 *               type: integer
 *             totalProjects:
 *               type: integer
 *             totalExpenses:
 *               type: number
 *     
 *     OrganizationInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Médecins Sans Frontières - France"
 *         country:
 *           type: string
 *           example: "France"
 *     
 *     OrganizationResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Organization'
 */

/**
 * @swagger
 * /organization:
 *   get:
 *     summary: Récupère les informations de l'organisation
 *     description: Accessible à tous les membres authentifiés de l'organisation
 *     tags: [Organization]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Informations de l'organisation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrganizationResponse'
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Organisation non trouvée
 */

/**
 * @swagger
 * /organization:
 *   put:
 *     summary: Met à jour les informations de l'organisation
 *     description: Réservé aux administrateurs (ADMIN)
 *     tags: [Organization]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrganizationInput'
 *           example:
 *             name: "Médecins Sans Frontières - France"
 *             country: "France"
 *     responses:
 *       200:
 *         description: Organisation mise à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrganizationResponse'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Permission refusée (réservé ADMIN)
 *       404:
 *         description: Organisation non trouvée
 */

router.use(authenticate);

router.get("/",  get);
router.put("/",  authorize("ADMIN"), update);

module.exports = router;