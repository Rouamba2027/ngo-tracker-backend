// ============================================================
// controllers/organizationController.js
// GET /api/organization — PUT /api/organization
// ============================================================

const Organization = require("../models/Organization");
const User         = require("../models/User");

// ── GET /api/organization ─────────────────────────────────────
async function get(req, res) {
  try {
    const org = await Organization.findById(req.user.orgId);
    if (!org) return res.status(404).json({ error: "Organisation introuvable." });

    const memberCount = await User.countDocuments({ orgId: org._id });
    return res.json({ organization: { ...org.toJSON(), memberCount } });
  } catch (err) {
    return res.status(500).json({ error: "Erreur serveur." });
  }
}

// ── PUT /api/organization ─────────────────────────────────────
async function update(req, res) {
  try {
    const allowed = ["name", "country"];
    const updates = {};
    allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const org = await Organization.findByIdAndUpdate(
      req.user.orgId,
      updates,
      { new: true, runValidators: true }
    );
    if (!org) return res.status(404).json({ error: "Organisation introuvable." });

    return res.json({ message: "Organisation mise à jour.", organization: org });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: Object.values(err.errors).map((e) => e.message).join(" ") });
    }
    return res.status(500).json({ error: "Erreur serveur." });
  }
}

module.exports = { get, update };
