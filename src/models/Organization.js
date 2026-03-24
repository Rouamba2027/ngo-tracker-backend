const mongoose = require("mongoose");

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
 *           example: "60d21b4667d0d8992e610c86"
 *         name:
 *           type: string
 *           example: "Médecins Sans Frontières"
 *         orgCode:
 *           type: string
 *           example: "MSF2024"
 *         receiptNumber:
 *           type: string
 *           example: "REC-2024-00123"
 *         country:
 *           type: string
 *           minLength: 2
 *           maxLength: 2
 *           example: "FR"
 */

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Le nom de l'organisation est requis."], trim: true },
    orgCode: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    receiptNumber: { type: String, required: [true, "Le numéro de récépissé est requis."], unique: true, trim: true },
    country: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      minlength: [2, "Le code pays doit contenir exactement 2 lettres."],
      maxlength: [2, "Le code pays doit contenir exactement 2 lettres."],
    },
  },
  { timestamps: true, versionKey: false }
);

organizationSchema.pre("save", function (next) {
  if (this.orgCode) this.orgCode = this.orgCode.trim().toUpperCase();
  if (this.country) this.country = this.country.trim().toUpperCase();
  next();
});

organizationSchema.set("toJSON", {
  virtuals: true,
  transform(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
  },
});

module.exports = mongoose.model("Organization", organizationSchema);