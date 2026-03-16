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
 *           example: "MANAGER"
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
 *         - email
 *         - password
 *         - name
 *         - type
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "john.doe@example.com"
 *         password:
 *           type: string
 *           format: password
 *           minLength: 6
 *           example: "password123"
 *         name:
 *           type: string
 *           example: "John Doe"
 *         type:
 *           type: string
 *           enum: [ONG, MANAGER, VIEWER]
 *           description: "ONG → crée org + ADMIN, MANAGER/VIEWER → rejoindre org existante"
 *         orgCode:
 *           type: string
 *           description: "Code d'invitation (requis pour MANAGER/VIEWER)"
 *           example: "ABC123XYZ"
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
 *           example: "user@example.com"
 *         password:
 *           type: string
 *           format: password
 *           example: "password123"
 *         role:
 *           type: string
 *           enum: [ADMIN, MANAGER, VIEWER]
 *           description: "Rôle pour la session"
 *         orgCode:
 *           type: string
 *           description: "Requis pour les ADMIN"
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
 *           description: "Code d'invitation de l'organisation (retourné uniquement pour inscription ONG)"
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
 *     summary: Inscription d'un nouvel utilisateur
 *     description: |
 *       - Type="ONG" → Crée une nouvelle organisation + compte ADMIN, génère un orgCode
 *       - Type="MANAGER" ou "VIEWER" → Rejoint une organisation existante via orgCode
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           examples:
 *             OngRegistration:
 *               summary: Inscription d'une ONG
 *               value:
 *                 email: "contact@ong.org"
 *                 password: "secure123"
 *                 name: "Médecins Sans Frontières"
 *                 type: "ONG"
 *             ManagerRegistration:
 *               summary: Inscription d'un manager
 *               value:
 *                 email: "manager@example.com"
 *                 password: "secure123"
 *                 name: "Jane Smith"
 *                 type: "MANAGER"
 *                 orgCode: "ABC123XYZ"
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             examples:
 *               OngResponse:
 *                 value:
 *                   success: true
 *                   token: "eyJhbGciOiJIUzI1NiIs..."
 *                   user:
 *                     id: "60d21b4667d0d8992e610c85"
 *                     email: "contact@ong.org"
 *                     role: "ADMIN"
 *                     organization: "60d21b4667d0d8992e610c86"
 *                   orgCode: "ABC123XYZ"
 *               MemberResponse:
 *                 value:
 *                   success: true
 *                   token: "eyJhbGciOiJIUzI1NiIs..."
 *                   user:
 *                     id: "60d21b4667d0d8992e610c87"
 *                     email: "manager@example.com"
 *                     role: "MANAGER"
 *                     organization: "60d21b4667d0d8992e610c86"
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Email déjà utilisé
 *       404:
 *         description: Code d'organisation invalide
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Connexion utilisateur
 *     description: Authentification avec email et mot de passe
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           examples:
 *             AdminLogin:
 *               value:
 *                 email: "admin@ong.org"
 *                 password: "admin123"
 *                 role: "ADMIN"
 *                 orgCode: "ABC123XYZ"
 *             UserLogin:
 *               value:
 *                 email: "user@example.com"
 *                 password: "user123"
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
 *       403:
 *         description: Rôle non autorisé pour cette organisation
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
// type="ONG"     → crée org + compte ADMIN, renvoie orgCode généré
// type="MANAGER" | "VIEWER" → rejoint une org existante via orgCode
router.post("/register", register);

// POST /api/auth/login
// Body: { email, password, role, orgCode? }   orgCode requis pour ADMIN
router.post("/login", login);

// GET /api/auth/me  — restaure la session depuis un token stocké
router.get("/me", authenticate, me);

module.exports = router;