// models/User.js

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - orgId
 *         - name
 *         - email
 *         - passwordHash
 *       properties:
 *         id:
 *           type: string
 *           description: ID unique de l'utilisateur
 *           example: "60d21b4667d0d8992e610c85"
 *         orgId:
 *           type: string
 *           description: ID de l'organisation (référence vers Organization)
 *           example: "60d21b4667d0d8992e610c86"
 *         name:
 *           type: string
 *           description: Nom complet de l'utilisateur
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           description: Email unique de l'utilisateur
 *           example: "john.doe@example.com"
 *         role:
 *           type: string
 *           enum: [ADMIN, MANAGER, VIEWER]
 *           description: |
 *             Rôle dans l'organisation :
 *             - ADMIN : Accès complet (CRUD sur tout)
 *             - MANAGER : Gestion des dépenses, lecture projets
 *             - VIEWER : Lecture seule
 *           default: "VIEWER"
 *           example: "MANAGER"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de dernière modification
 *     
 *     UserWithOrganization:
 *       allOf:
 *         - $ref: '#/components/schemas/User'
 *         - type: object
 *           properties:
 *             organization:
 *               $ref: '#/components/schemas/Organization'
 *     
 *     UserInput:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - role
 *       properties:
 *         name:
 *           type: string
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           example: "john.doe@example.com"
 *         password:
 *           type: string
 *           format: password
 *           minLength: 6
 *           example: "password123"
 *         role:
 *           type: string
 *           enum: [ADMIN, MANAGER, VIEWER]
 *           example: "MANAGER"
 *     
 *     UserUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "John Doe Updated"
 *         email:
 *           type: string
 *           format: email
 *           example: "john.doe@example.com"
 *         role:
 *           type: string
 *           enum: [ADMIN, MANAGER, VIEWER]
 *     
 *     UserLogin:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "john.doe@example.com"
 *         password:
 *           type: string
 *           format: password
 *           example: "password123"
 */

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    name: { type: String, required: [true, "Le nom est requis."], trim: true },
    email: { type: String, required: [true, "L'email est requis."], unique: true, lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, "Format d'email invalide."] },
    passwordHash: { type: String, required: true, select: false },
    // ✅ FIX : role explicitement requis avec message d'erreur clair
    role: {
      type: String,
      enum: {
        values: ["ADMIN", "MANAGER", "VIEWER"],
        message: "Rôle invalide. Valeurs acceptées : ADMIN, MANAGER, VIEWER."
      },
      default: "VIEWER",
      required: [true, "Le rôle est requis."]
    },
  },
  { timestamps: true, versionKey: false }
);

userSchema.index({ orgId: 1, email: 1 });

userSchema.set("toJSON", {
  virtuals: true,
  transform(doc, ret) {
    ret.id = ret._id.toString();
    ret.orgId = ret.orgId?.toString ? ret.orgId.toString() : ret.orgId;
    delete ret._id;
    delete ret.passwordHash;
  },
});

module.exports = mongoose.model("User", userSchema);