const mongoose = require("mongoose");

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
 *         orgId:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         role:
 *           type: string
 *           enum: [ADMIN, MANAGER, VIEWER]
 *           default: "VIEWER"
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 */

const userSchema = new mongoose.Schema(
  {
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    name: { type: String, required: [true, "Le nom est requis."], trim: true },
    email: {
      type: String,
      required: [true, "L'email est requis."],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Format d'email invalide."],
    },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: {
        values: ["ADMIN", "MANAGER", "VIEWER"],
        message: "Rôle invalide. Valeurs acceptées : ADMIN, MANAGER, VIEWER.",
      },
      default: "VIEWER",
      required: [true, "Le rôle est requis."],
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