// models/Report.js

/**
 * @swagger
 * components:
 *   schemas:
 *     Report:
 *       type: object
 *       required:
 *         - orgId
 *         - title
 *         - type
 *         - generatedBy
 *       properties:
 *         id:
 *           type: string
 *           description: ID unique du rapport
 *           example: "60d21b4667d0d8992e610c95"
 *         orgId:
 *           type: string
 *           description: ID de l'organisation
 *           example: "60d21b4667d0d8992e610c86"
 *         projectId:
 *           type: string
 *           description: ID du projet (null si rapport global)
 *           nullable: true
 *           example: "60d21b4667d0d8992e610c88"
 *         title:
 *           type: string
 *           description: Titre du rapport
 *           example: "Rapport trimestriel Q1 2024"
 *         type:
 *           type: string
 *           enum: [quarterly, semester, annual]
 *           description: |
 *             Type de rapport :
 *             - quarterly : Trimestriel
 *             - semester : Semestriel
 *             - annual : Annuel
 *           example: "quarterly"
 *         generatedBy:
 *           type: string
 *           description: ID de l'utilisateur ayant généré le rapport
 *           example: "60d21b4667d0d8992e610c85"
 *         generatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de génération
 *           example: "2024-04-01T10:30:00Z"
 *         fileUrl:
 *           type: string
 *           description: URL du fichier généré (PDF/Excel)
 *           nullable: true
 *           example: "/reports/60d21b4667d0d8992e610c95.pdf"
 *         data:
 *           type: object
 *           description: Données structurées du rapport
 *           example:
 *             summary:
 *               totalExpenses: 15750.50
 *               totalProjects: 8
 *             byCategory:
 *               material: 5000
 *               transport: 3250
 *               staff: 6250
 *               other: 1250.50
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     ReportWithDetails:
 *       allOf:
 *         - $ref: '#/components/schemas/Report'
 *         - type: object
 *           properties:
 *             organization:
 *               $ref: '#/components/schemas/Organization'
 *             project:
 *               $ref: '#/components/schemas/Project'
 *             generator:
 *               $ref: '#/components/schemas/User'
 *     
 *     ReportInput:
 *       type: object
 *       required:
 *         - title
 *         - type
 *       properties:
 *         projectId:
 *           type: string
 *           description: ID du projet (optionnel, pour rapport spécifique)
 *           example: "60d21b4667d0d8992e610c88"
 *         title:
 *           type: string
 *           example: "Rapport trimestriel Q1 2024"
 *         type:
 *           type: string
 *           enum: [quarterly, semester, annual]
 *           example: "quarterly"
 *         dateRange:
 *           type: object
 *           properties:
 *             start:
 *               type: string
 *               format: date
 *               example: "2024-01-01"
 *             end:
 *               type: string
 *               format: date
 *               example: "2024-03-31"
 *     
 *     ReportListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         count:
 *           type: integer
 *           example: 15
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Report'
 */

const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null },
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ["quarterly", "semester", "annual"], required: true },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    generatedAt: { type: Date, default: Date.now },
    fileUrl: { type: String, default: null },
    data: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true, versionKey: false }
);

reportSchema.set("toJSON", {
  virtuals: true,
  transform(doc, ret) {
    ret.id = ret._id.toString();
    ret.orgId = ret.orgId?.toString?.() ?? ret.orgId;
    ret.projectId = ret.projectId?.toString?.() ?? null;
    ret.generatedBy = ret.generatedBy?.toString?.() ?? ret.generatedBy;
    delete ret._id;
  },
});

module.exports = mongoose.model("Report", reportSchema);