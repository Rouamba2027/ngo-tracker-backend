const mongoose = require("mongoose");

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
      maxlength: [2, "Le code pays doit contenir exactement 2 lettres."]
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
  transform(doc, ret) { ret.id = ret._id.toString(); delete ret._id; },
});

module.exports = mongoose.model("Organization", organizationSchema);
