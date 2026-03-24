// ============================================================
// routes/authRoute.js — /api/auth
// POST /register  POST /login  GET /me
// ============================================================

const express = require("express");
const router  = express.Router();

const { register, login, me } = require("../controllers/authController");
const { authenticate }        = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Gestion de l'authentification et des comptes
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "60d21b4667d0d8992e610c85"
 *         email:
 *           type: string
 *           format: email
 *           example: "user@example.com"
 *         role:
 *           type: string
 *           enum: [ADMIN, MANAGER, VIEWER]
 *           example: "ADMIN"
 *         organization:
 *           type: string
 *           example: "60d21b4667d0d8992e610c86"
 *         createdAt:
 *           type: string
 *           format: date-time
 *     
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - orgName
 *         - receiptNumber
 *         - country
 *       properties:
 *         name:
 *           type: string
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           example: "contact@ong.org"
 *         password:
 *           type: string
 *           format: password
 *           minLength: 6
 *           example: "secure123"
 *         orgName:
 *           type: string
 *           example: "Médecins Sans Frontières"
 *         receiptNumber:
 *           type: string
 *           example: "REC-2024-001"
 *         country:
 *           type: string
 *           example: "FR"
 *     
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "contact@ong.org"
 *         password:
 *           type: string
 *           format: password
 *           example: "secure123"
 *     
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         token:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         user:
 *           $ref: '#/components/schemas/User'
 *         orgCode:
 *           type: string
 *           description: "Code ONG généré"
 *         managerCode:
 *           type: string
 *           description: "Code Manager généré"
 *         viewerCode:
 *           type: string
 *           description: "Code Viewer généré"
 *     
 *     Error:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Email déjà utilisé"
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Inscription d'une nouvelle ONG
 *     description: Crée une nouvelle organisation et un compte Administrateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: ONG créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Email déjà utilisé
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Connexion utilisateur
 *     description: Authentification avec email et mot de passe (pour ADMIN, MANAGER, VIEWER)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Email ou mot de passe incorrect
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Récupérer le profil de l'utilisateur connecté
 *     description: Restaure la session depuis un token stocké
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil utilisateur récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Non authentifié - Token manquant ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// POST /api/auth/register
// L'inscription crée par défaut une ONG avec un rôle ADMIN
router.post("/register", register);

// POST /api/auth/login
// L'utilisateur se connecte simplement avec email / password
router.post("/login", login);

// GET /api/auth/me  — restaure la session depuis un token stocké
router.get("/me", authenticate, me);

module.exports = router;