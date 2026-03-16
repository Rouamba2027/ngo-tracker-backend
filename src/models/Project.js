// models/Project.js

/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       required:
 *         - orgId
 *         - name
 *         - domain
 *         - budgetAllocated
 *         - createdBy
 *       properties:
 *         id:
 *           type: string
 *           description: ID unique du projet
 *           example: "60d21b4667d0d8992e610c88"
 *         orgId:
 *           type: string
 *           description: ID de l'organisation propriétaire
 *           example: "60d21b4667d0d8992e610c86"
 *         name:
 *           type: string
 *           description: Nom du projet
 *           example: "Construction école primaire"
 *         domain:
 *           type: string
 *           enum: [health, education, water, other]
 *           description: |
 *             Domaine d'activité :
 *             - health : Santé
 *             - education : Éducation
 *             - water : Eau et assainissement
 *             - other : Autre
 *           example: "education"
 *         status:
 *           type: string
 *           enum: [active, pending, done, exceeded]
 *           description: |
 *             Statut du projet :
 *             - active : En cours
 *             - pending : En attente
 *             - done : Terminé
 *             - exceeded : Budget dépassé
 *           default: "active"
 *           example: "active"
 *         budgetAllocated:
 *           type: number
 *           description: Budget total alloué
 *           minimum: 1
 *           example: 50000.00
 *         budgetSpent:
 *           type: number
 *           description: Budget déjà dépensé
 *           minimum: 0
 *           default: 0
 *           example: 12500.50
 *         budgetPct:
 *           type: integer
 *           description: Pourcentage du budget dépensé (calculé)
 *           example: 25
 *         startDate:
 *           type: string
 *           format: date
 *           description: Date de début du projet
 *           example: "2024-01-01"
 *         endDate:
 *           type: string
 *           format: date
 *           description: Date de fin prévue (null si non définie)
 *           nullable: true
 *           example: "2024-12-31"
 *         assignedManagers:
 *           type: array
 *           description: Liste des IDs des managers assignés
 *           items:
 *             type: string
 *           example: ["60d21b4667d0d8992e610c85", "60d21b4667d0d8992e610c87"]
 *         createdBy:
 *           type: string
 *           description: ID de l'utilisateur qui a créé le projet
 *           example: "60d21b4667d0d8992e610c85"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     ProjectWithDetails:
 *       allOf:
 *         - $ref: '#/components/schemas/Project'
 *         - type: object
 *           properties:
 *             organization:
 *               $ref: '#/components/schemas/Organization'
 *             managers:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *             creator:
 *               $ref: '#/components/schemas/User'
 *             expenses:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Expense'
 *     
 *     ProjectInput:
 *       type: object
 *       required:
 *         - name
 *         - domain
 *         - budgetAllocated
 *       properties:
 *         name:
 *           type: string
 *           example: "Construction école primaire"
 *         domain:
 *           type: string
 *           enum: [health, education, water, other]
 *           example: "education"
 *         budgetAllocated:
 *           type: number
 *           minimum: 1
 *           example: 50000.00
 *         startDate:
 *           type: string
 *           format: date
 *           example: "2024-01-01"
 *         endDate:
 *           type: string
 *           format: date
 *           example: "2024-12-31"
 *         assignedManagers:
 *           type: array
 *           items:
 *             type: string
 *     
 *     ProjectUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         domain:
 *           type: string
 *           enum: [health, education, water, other]
 *         status:
 *           type: string
 *           enum: [active, pending, done, exceeded]
 *         budgetAllocated:
 *           type: number
 *           minimum: 1
 *         startDate:
 *           type: string
 *           format: date
 *         endDate:
 *           type: string
 *           format: date
 *         assignedManagers:
 *           type: array
 *           items:
 *             type: string
 */

const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    name: { type: String, required: [true, "Le nom du projet est requis."], trim: true },
    domain: { type: String, enum: ["health", "education", "water", "other"], required: [true, "Le domaine est requis."] },
    status: { type: String, enum: ["active", "pending", "done", "exceeded"], default: "active" },
    budgetAllocated: { type: Number, required: [true, "Le budget alloué est requis."], min: [1, "Le budget doit être positif."] },
    budgetSpent: { type: Number, default: 0, min: 0 },
    startDate: { type: String },
    endDate: { type: String, default: null },
    assignedManagers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true, versionKey: false }
);

projectSchema.index({ orgId: 1, status: 1 });
projectSchema.index({ orgId: 1, domain: 1 });

projectSchema.virtual("budgetPct").get(function () {
  if (!this.budgetAllocated) return 0;
  return Math.round((this.budgetSpent / this.budgetAllocated) * 100);
});

projectSchema.set("toJSON", {
  virtuals: true,
  transform(doc, ret) {
    ret.id = ret._id.toString();
    ret.orgId = ret.orgId?.toString?.() ?? ret.orgId;
    ret.createdBy = ret.createdBy?.toString?.() ?? ret.createdBy;
    ret.assignedManagers = (ret.assignedManagers || []).map((m) => m?.toString?.() ?? m);
    delete ret._id;
  },
});

module.exports = mongoose.model("Project", projectSchema);