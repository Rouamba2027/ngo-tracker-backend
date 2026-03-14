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