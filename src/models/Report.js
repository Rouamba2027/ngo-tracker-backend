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