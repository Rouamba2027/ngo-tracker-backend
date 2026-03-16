// models/Organization.js

/**
 * @swagger
 * components:
 *   schemas:
 *     Organization:
 *       type: object
 *       required:
 *         - name
 *         - orgCode
 *         - receiptNumber
 *         - country
 *       properties:
 *         id:
 *           type: string
 *           description: ID unique de l'organisation
 *           example: "60d21b4667d0d8992e610c86"
 *         name:
 *           type: string
 *           description: Nom de l'organisation
 *           example: "Médecins Sans Frontières"
 *         orgCode:
 *           type: string
 *           description: Code unique d'invitation (généré automatiquement)
 *           example: "MSF2024"
 *         receiptNumber:
 *           type: string
 *           description: Numéro de récépissé officiel
 *           example: "REC-2024-00123"
 *         country:
 *           type: string
 *           description: Code pays ISO 3166-1 alpha-2 (2 lettres)
 *           minLength: 2
 *           maxLength: 2
 *           example: "FR"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de dernière modification
 *     
 *     OrganizationWithStats:
 *       allOf:
 *         - $ref: '#/components/schemas/Organization'
 *         - type: object
 *           properties:
 *             stats:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: integer
 *                   example: 25
 *                 totalProjects:
 *                   type: integer
 *                   example: 8
 *                 totalExpenses:
 *                   type: number
 *                   example: 15750.50
 *                 totalBudget:
 *                   type: number
 *                   example: 50000.00
 *     
 *     OrganizationInput:
 *       type: object
 *       required:
 *         - name
 *         - receiptNumber
 *         - country
 *       properties:
 *         name:
 *           type: string
 *           example: "Médecins Sans Frontières"
 *         receiptNumber:
 *           type: string
 *           example: "REC-2024-00123"
 *         country:
 *           type: string
 *           minLength: 2
 *           maxLength: 2
 *           example: "FR"
 */

const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Le nom de l'organisation est requis."], trim: true },
    orgCode: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    receiptNumber: { type: String, required: [true, "Le numéro de récépissé est requis."], unique: true, trim: true },
    country: { type: String, required: true, uppercase: true, trim: true, minlength: 2, maxlength: 2 },
  },
  { timestamps: true, versionKey: false }
);

organizationSchema.set("toJSON", {
  virtuals: true,
  transform(doc, ret) { ret.id = ret._id.toString(); delete ret._id; },
});

module.exports = mongoose.model("Organization", organizationSchema);