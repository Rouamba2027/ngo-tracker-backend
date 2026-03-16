// ============================================================
// routes/usersRoute.js — /api/users
// ADMIN   : liste, consulter, modifier rôle, supprimer
// MANAGER / VIEWER : modifier uniquement son propre profil
// ============================================================

const express = require("express");
const router  = express.Router();

const { list, get, update, remove } = require("../controllers/usersController");
const { authenticate, authorize }   = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestion des utilisateurs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "60d21b4667d0d8992e610c85"
 *         email:
 *           type: string
 *           format: email
 *           example: "user@example.com"
 *         name:
 *           type: string
 *           example: "John Doe"
 *         role:
 *           type: string
 *           enum: [ADMIN, MANAGER, VIEWER]
 *           example: "MANAGER"
 *         organization:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *         lastLogin:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         isActive:
 *           type: boolean
 *           example: true
 *     
 *     UserProfileInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "John Doe Updated"
 *         email:
 *           type: string
 *           format: email
 *           example: "john.doe@example.com"
 *         password:
 *           type: string
 *           format: password
 *           minLength: 6
 *           description: "Nouveau mot de passe (optionnel)"
 *         currentPassword:
 *           type: string
 *           format: password
 *           description: "Mot de passe actuel requis pour changer le mot de passe"
 *     
 *     UserAdminUpdateInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         role:
 *           type: string
 *           enum: [ADMIN, MANAGER, VIEWER]
 *         isActive:
 *           type: boolean
 *     
 *     UserListResponse:
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
 *             $ref: '#/components/schemas/UserProfile'
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
 *     UserResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/UserProfile'
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Liste tous les utilisateurs de l'organisation
 *     description: Réservé aux administrateurs (ADMIN)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [ADMIN, MANAGER, VIEWER]
 *         description: Filtrer par rôle
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Rechercher par nom ou email
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
 *           maximum: 100
 *         description: Nombre d'éléments par page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [name, -name, createdAt, -createdAt, email]
 *           default: name
 *         description: Tri des résultats
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserListResponse'
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Permission refusée (réservé ADMIN)
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Récupère les détails d'un utilisateur
 *     description: |
 *       - ADMIN : peut voir tous les utilisateurs
 *       - MANAGER/VIEWER : peut voir uniquement son propre profil
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur (ou "me" pour l'utilisateur connecté)
 *         example: "60d21b4667d0d8992e610c85"
 *     responses:
 *       200:
 *         description: Détails de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès non autorisé à cet utilisateur
 *       404:
 *         description: Utilisateur non trouvé
 */

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Met à jour un utilisateur
 *     description: |
 *       - ADMIN : peut mettre à jour tous les utilisateurs (rôle, statut, etc.)
 *       - MANAGER/VIEWER : peut mettre à jour uniquement son propre profil (nom, email, mot de passe)
 *       
 *       Pour changer le mot de passe, l'utilisateur doit fournir son mot de passe actuel.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur (ou "me" pour l'utilisateur connecté)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/UserProfileInput'
 *               - $ref: '#/components/schemas/UserAdminUpdateInput'
 *           examples:
 *             SelfUpdate:
 *               summary: Mise à jour de son propre profil
 *               value:
 *                 name: "John Doe Updated"
 *                 email: "john.doe@example.com"
 *                 currentPassword: "oldPassword123"
 *                 password: "newPassword123"
 *             AdminUpdate:
 *               summary: Mise à jour par un ADMIN
 *               value:
 *                 name: "John Doe"
 *                 role: "MANAGER"
 *                 isActive: true
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: |
 *           Données invalides ou mot de passe actuel incorrect
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Permission refusée
 *       404:
 *         description: Utilisateur non trouvé
 *       409:
 *         description: Email déjà utilisé par un autre utilisateur
 */

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Supprime un utilisateur
 *     description: |
 *       Réservé aux administrateurs (ADMIN).
 *       La suppression d'un utilisateur est irréversible.
 *       Les dépenses créées par l'utilisateur seront réassignées à un ADMIN par défaut.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur à supprimer
 *     responses:
 *       200:
 *         description: Utilisateur supprimé avec succès
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
 *                   example: "Utilisateur supprimé avec succès"
 *       400:
 *         description: Impossible de supprimer le dernier ADMIN
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Permission refusée (réservé ADMIN)
 *       404:
 *         description: Utilisateur non trouvé
 */

/**
 * @swagger
 * /users/{id}/reset-password:
 *   post:
 *     summary: Réinitialise le mot de passe d'un utilisateur
 *     description: |
 *       Réservé aux administrateurs (ADMIN).
 *       Envoie un email à l'utilisateur avec un lien de réinitialisation.
 *     tags: [Users]
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
 *         description: Email de réinitialisation envoyé
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
 *                   example: "Email de réinitialisation envoyé"
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Permission refusée
 *       404:
 *         description: Utilisateur non trouvé
 */

router.use(authenticate);

router.get("/",       authorize("ADMIN"), list);
router.get("/:id",    authorize("ADMIN"), get);
router.put("/:id",    update);                        // self ou admin
router.delete("/:id", authorize("ADMIN"), remove);

module.exports = router;