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