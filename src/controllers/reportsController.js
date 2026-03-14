const mongoose = require("mongoose");
const Report   = require("../models/Report");
const Project  = require("../models/Project");
const Expense  = require("../models/Expense");

async function list(req, res) {
  try {
    const { projectId, type } = req.query;
    const filter = { orgId: req.user.orgId };
    if (projectId) filter.projectId = new mongoose.Types.ObjectId(projectId);
    if (type)      filter.type      = type;
    const reports = await Report.find(filter).sort({ generatedAt: -1 });
    return res.json({ reports, total: reports.length });
  } catch (err) { return res.status(500).json({ error: "Erreur serveur." }); }
}

async function get(req, res) {
  try {
    const report = await Report.findOne({ _id: req.params.id, orgId: req.user.orgId });
    if (!report) return res.status(404).json({ error: "Rapport introuvable." });
    return res.json({ report });
  } catch (err) {
    if (err.name === "CastError") return res.status(404).json({ error: "Rapport introuvable." });
    return res.status(500).json({ error: "Erreur serveur." });
  }
}

async function generate(req, res) {
  try {
    const { projectId, type } = req.body;
    if (!type) return res.status(400).json({ error: "Le type de rapport est requis." });
    const VALID = ["quarterly","semester","annual"];
    if (!VALID.includes(type)) return res.status(400).json({ error: `Type invalide. Valeurs : ${VALID.join(", ")}.` });

    const orgId = new mongoose.Types.ObjectId(req.user.orgId);
    const projectQuery = { orgId };
    if (projectId) projectQuery._id = new mongoose.Types.ObjectId(projectId);
    const projects = await Project.find(projectQuery);
    if (projectId && projects.length === 0) return res.status(404).json({ error: "Projet introuvable." });

    const projectIds = projects.map(p => p._id);
    const expenseAgg = await Expense.aggregate([
      { $match: { projectId: { $in: projectIds } } },
      { $group: { _id: "$projectId", total: { $sum: "$amount" }, count: { $sum: 1 }, byCategory: { $push: { category: "$category", amount: "$amount" } } } },
    ]);
    const expMap = {};
    expenseAgg.forEach(r => {
      const byCat = {};
      r.byCategory.forEach(({ category, amount }) => { byCat[category] = (byCat[category] || 0) + amount; });
      expMap[r._id.toString()] = { total: r.total, count: r.count, byCat };
    });

    const reportData = projects.map(p => {
      const data  = expMap[p._id.toString()] || { total: 0, count: 0, byCat: {} };
      return {
        project: { id: p._id, name: p.name, domain: p.domain, status: p.status },
        budget: { allocated: p.budgetAllocated, spent: data.total, remaining: p.budgetAllocated - data.total, utilizationPct: p.budgetAllocated > 0 ? Math.round((data.total / p.budgetAllocated) * 100) : 0 },
        expensesByCategory: data.byCat, expenseCount: data.count,
      };
    });

    const title = projectId ? `Rapport ${type} — ${projects[0]?.name}` : `Rapport ${type} — Organisation complète`;
    const report = await Report.create({ orgId, projectId: projectId ? new mongoose.Types.ObjectId(projectId) : null, title, type, generatedBy: req.user.userId, generatedAt: new Date(), fileUrl: null, data: reportData });
    return res.status(201).json({ message: "Rapport généré.", report });
  } catch (err) {
    console.error("reports.generate:", err);
    return res.status(500).json({ error: "Erreur serveur." });
  }
}

async function remove(req, res) {
  try {
    if (req.user.role !== "ADMIN") return res.status(403).json({ error: "Seuls les administrateurs peuvent supprimer les rapports." });
    const report = await Report.findOneAndDelete({ _id: req.params.id, orgId: req.user.orgId });
    if (!report) return res.status(404).json({ error: "Rapport introuvable." });
    return res.json({ message: "Rapport supprimé." });
  } catch (err) { return res.status(500).json({ error: "Erreur serveur." }); }
}

module.exports = { list, get, generate, remove };