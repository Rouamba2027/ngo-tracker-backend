// models/Expense.js

/**
 * @swagger
 * components:
 *   schemas:
 *     Expense:
 *       type: object
 *       required:
 *         - projectId
 *         - orgId
 *         - createdBy
 *         - amount
 *         - category
 *       properties:
 *         id:
 *           type: string
 *           description: ID unique de la dépense
 *           example: "60d21b4667d0d8992e610c90"
 *         projectId:
 *           type: string
 *           description: ID du projet associé
 *           example: "60d21b4667d0d8992e610c88"
 *         orgId:
 *           type: string
 *           description: ID de l'organisation
 *           example: "60d21b4667d0d8992e610c86"
 *         createdBy:
 *           type: string
 *           description: ID de l'utilisateur ayant créé la dépense
 *           example: "60d21b4667d0d8992e610c85"
 *         amount:
 *           type: number
 *           description: Montant de la dépense
 *           minimum: 1
 *           example: 150.75
 *         category:
 *           type: string
 *           enum: [material, transport, staff, other]
 *           description: |
 *             Catégorie de dépense :
 *             - material : Matériel et fournitures
 *             - transport : Transport et logistique
 *             - staff : Personnel et ressources humaines
 *             - other : Autre
 *           example: "material"
 *         description:
 *           type: string
 *           description: Description de la dépense
 *           default: ""
 *           example: "Achat de fournitures de bureau"
 *         date:
 *           type: string
 *           format: date
 *           description: Date de la dépense (format YYYY-MM-DD)
 *           example: "2024-03-15"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création de l'enregistrement
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de dernière modification
 *     
 *     ExpenseWithDetails:
 *       allOf:
 *         - $ref: '#/components/schemas/Expense'
 *         - type: object
 *           properties:
 *             project:
 *               $ref: '#/components/schemas/Project'
 *             organization:
 *               $ref: '#/components/schemas/Organization'
 *             creator:
 *               $ref: '#/components/schemas/User'
 *     
 *     ExpenseInput:
 *       type: object
 *       required:
 *         - projectId
 *         - amount
 *         - category
 *       properties:
 *         projectId:
 *           type: string
 *           example: "60d21b4667d0d8992e610c88"
 *         amount:
 *           type: number
 *           minimum: 1
 *           example: 150.75
 *         category:
 *           type: string
 *           enum: [material, transport, staff, other]
 *           example: "material"
 *         description:
 *           type: string
 *           example: "Achat de fournitures de bureau"
 *         date:
 *           type: string
 *           format: date
 *           example: "2024-03-15"
 *     
 *     ExpenseUpdate:
 *       type: object
 *       properties:
 *         amount:
 *           type: number
 *           minimum: 1
 *         category:
 *           type: string
 *           enum: [material, transport, staff, other]
 *         description:
 *           type: string
 *         date:
 *           type: string
 *           format: date
 *     
 *     ExpenseSummary:
 *       type: object
 *       properties:
 *         total:
 *           type: number
 *           example: 12500.50
 *         count:
 *           type: integer
 *           example: 42
 *         byCategory:
 *           type: object
 *           properties:
 *             material:
 *               type: number
 *             transport:
 *               type: number
 *             staff:
 *               type: number
 *             other:
 *               type: number
 *         byProject:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               projectId:
 *                 type: string
 *               projectName:
 *                 type: string
 *               total:
 *                 type: number
 *         byMonth:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               month:
 *                 type: string
 *                 example: "2024-01"
 *               total:
 *                 type: number
 */

const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: [true, "Le montant est requis."], min: [1, "Le montant doit être positif."] },
    category: { type: String, enum: ["material", "transport", "staff", "other"], required: [true, "La catégorie est requise."] },
    description: { type: String, trim: true, default: "" },
    date: { type: String, default: () => new Date().toISOString().slice(0, 10) },
  },
  { timestamps: true, versionKey: false }
);

expenseSchema.index({ projectId: 1, date: 1 });
expenseSchema.index({ orgId: 1, category: 1 });

expenseSchema.set("toJSON", {
  virtuals: true,
  transform(doc, ret) {
    ret.id = ret._id.toString();
    ret.projectId = ret.projectId?.toString?.() ?? ret.projectId;
    ret.orgId = ret.orgId?.toString?.() ?? ret.orgId;
    ret.createdBy = ret.createdBy?.toString?.() ?? ret.createdBy;
    delete ret._id;
  },
});

module.exports = mongoose.model("Expense", expenseSchema);