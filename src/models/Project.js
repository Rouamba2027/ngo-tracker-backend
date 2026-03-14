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