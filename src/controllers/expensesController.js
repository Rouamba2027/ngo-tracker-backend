const mongoose = require("mongoose");
const Expense  = require("../models/Expense");
const Project  = require("../models/Project");

const VALID_CATEGORIES = ["material", "transport", "staff", "other"];

async function syncBudgetSpent(projectId) {
  const agg = await Expense.aggregate([
    { $match: { projectId: new mongoose.Types.ObjectId(projectId.toString()) } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const total = agg[0]?.total || 0;
  await Project.findByIdAndUpdate(projectId, { budgetSpent: total });
  return total;
}

async function visibleProjectIds(req) {
  const projects = await Project.find({ orgId: req.user.orgId }).select("_id");
  return projects.map(p => p._id);
}

async function list(req, res) {
  try {
    const { projectId, category, from, to } = req.query;
    const allowedIds = await visibleProjectIds(req);
    const filter = { projectId: { $in: allowedIds } };
    if (projectId)  filter.projectId = new mongoose.Types.ObjectId(projectId);
    if (category)   filter.category  = category;
    if (from || to) { filter.date = {}; if (from) filter.date.$gte = from; if (to) filter.date.$lte = to; }
    const expenses = await Expense.find(filter).sort({ date: -1 });
    const totalAmount = expenses.reduce((s, e) => s + e.amount, 0);
    return res.json({ expenses, total: expenses.length, totalAmount });
  } catch (err) { return res.status(500).json({ error: "Erreur serveur." }); }
}

async function get(req, res) {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ error: "Dépense introuvable." });
    const project = await Project.findOne({ _id: expense.projectId, orgId: req.user.orgId });
    if (!project) return res.status(403).json({ error: "Accès refusé." });
    return res.json({ expense });
  } catch (err) {
    if (err.name === "CastError") return res.status(404).json({ error: "Dépense introuvable." });
    return res.status(500).json({ error: "Erreur serveur." });
  }
}

async function create(req, res) {
  try {
    const { projectId, amount, category, description, date } = req.body;
    if (!projectId || !amount || !category)
      return res.status(400).json({ error: "Projet, montant et catégorie sont requis." });
    if (!VALID_CATEGORIES.includes(category))
      return res.status(400).json({ error: `Catégorie invalide. Valeurs : ${VALID_CATEGORIES.join(", ")}.` });
    if (Number(amount) <= 0)
      return res.status(400).json({ error: "Le montant doit être positif." });
    const project = await Project.findOne({ _id: projectId, orgId: req.user.orgId });
    if (!project) return res.status(404).json({ error: "Projet introuvable." });
    const expense = await Expense.create({ projectId: project._id, orgId: req.user.orgId, createdBy: req.user.userId, amount: Number(amount), category, description: description || "", date: date || new Date().toISOString().slice(0, 10) });
    await syncBudgetSpent(project._id);
    return res.status(201).json({ message: "Dépense enregistrée.", expense });
  } catch (err) {
    if (err.name === "ValidationError")
      return res.status(400).json({ error: Object.values(err.errors).map(e => e.message).join(" ") });
    console.error("expenses.create error:", err);
      return res.status(500).json({ error: "Erreur serveur." });
  }
}

async function update(req, res) {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ error: "Dépense introuvable." });
    const project = await Project.findOne({ _id: expense.projectId, orgId: req.user.orgId });
    if (!project) return res.status(403).json({ error: "Accès refusé." });
    if (req.user.role !== "ADMIN" && expense.createdBy.toString() !== req.user.userId)
      return res.status(403).json({ error: "Vous ne pouvez modifier que vos propres dépenses." });
    ["amount","category","description","date"].forEach(f => { if (req.body[f] !== undefined) expense[f] = req.body[f]; });
    if (req.body.amount !== undefined) expense.amount = Number(req.body.amount);
    await expense.save();
    await syncBudgetSpent(project._id);
    return res.json({ message: "Dépense mise à jour.", expense });
  } catch (err) { return res.status(500).json({ error: "Erreur serveur." }); }
}

async function remove(req, res) {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ error: "Dépense introuvable." });
    const project = await Project.findOne({ _id: expense.projectId, orgId: req.user.orgId });
    if (!project) return res.status(403).json({ error: "Accès refusé." });
    if (req.user.role !== "ADMIN" && expense.createdBy.toString() !== req.user.userId)
      return res.status(403).json({ error: "Vous ne pouvez supprimer que vos propres dépenses." });
    await expense.deleteOne();
    await syncBudgetSpent(project._id);
    return res.json({ message: "Dépense supprimée." });
  } catch (err) { return res.status(500).json({ error: "Erreur serveur." }); }
}

module.exports = { list, get, create, update, remove };
