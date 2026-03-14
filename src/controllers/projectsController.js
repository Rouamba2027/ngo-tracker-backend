const mongoose = require("mongoose");
const Project  = require("../models/Project");
const Expense  = require("../models/Expense");

function buildOrgQuery(req) {
  return { orgId: req.user.orgId };
}

async function enrichProject(project) {
  const agg = await Expense.aggregate([
    { $match: { projectId: project._id } },
    { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
  ]);
  const budgetSpent  = agg[0]?.total || 0;
  const expenseCount = agg[0]?.count || 0;
  const budgetPct    = project.budgetAllocated > 0 ? Math.round((budgetSpent / project.budgetAllocated) * 100) : 0;
  let derivedStatus = project.status;
  if (budgetSpent > project.budgetAllocated) derivedStatus = "exceeded";
  else if (budgetPct >= 65 && derivedStatus === "active") derivedStatus = "pending";
  return { ...(project.toJSON ? project.toJSON() : project), budgetSpent, budgetPct, expenseCount, status: derivedStatus };
}

async function list(req, res) {
  try {
    const { status, domain, search } = req.query;
    const query = buildOrgQuery(req);
    if (domain) query.domain = domain;
    if (search) query.name   = { $regex: search, $options: "i" };
    const projects = await Project.find(query).sort({ createdAt: -1 });
    let result = await Promise.all(projects.map(enrichProject));
    if (status) result = result.filter(p => p.status === status);
    return res.json({ projects: result, total: result.length });
  } catch (err) { return res.status(500).json({ error: "Erreur serveur." }); }
}

async function get(req, res) {
  try {
    const query = { _id: req.params.id, orgId: req.user.orgId };
    const project = await Project.findOne(query);
    if (!project) return res.status(404).json({ error: "Projet introuvable." });
    return res.json({ project: await enrichProject(project) });
  } catch (err) {
    if (err.name === "CastError") return res.status(404).json({ error: "Projet introuvable." });
    return res.status(500).json({ error: "Erreur serveur." });
  }
}

async function projectExpenses(req, res) {
  try {
    const query = { _id: req.params.id, orgId: req.user.orgId };
    const project = await Project.findOne(query);
    if (!project) return res.status(404).json({ error: "Projet introuvable." });
    const expenses = await Expense.find({ projectId: project._id }).sort({ date: -1 });
    return res.json({ expenses, total: expenses.length });
  } catch (err) { return res.status(500).json({ error: "Erreur serveur." }); }
}

async function create(req, res) {
  try {
    const { name, domain, budgetAllocated, startDate, endDate, assignedManagers } = req.body;
    if (!name || !domain || !budgetAllocated)
      return res.status(400).json({ error: "Nom, domaine et budget alloué sont requis." });
    const project = await Project.create({
      orgId: req.user.orgId, name, domain, status: "active",
      budgetAllocated: Number(budgetAllocated), budgetSpent: 0,
      startDate: startDate || new Date().toISOString().slice(0, 10),
      endDate: endDate || null,
      assignedManagers: Array.isArray(assignedManagers) ? assignedManagers.map(id => new mongoose.Types.ObjectId(id)) : [],
      createdBy: req.user.userId,
    });
    return res.status(201).json({ message: "Projet créé.", project: await enrichProject(project) });
  } catch (err) {
    if (err.name === "ValidationError")
      return res.status(400).json({ error: Object.values(err.errors).map(e => e.message).join(" ") });
    return res.status(500).json({ error: "Erreur serveur." });
  }
}

async function update(req, res) {
  try {
    const allowed = ["name","domain","status","budgetAllocated","startDate","endDate","assignedManagers"];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    if (updates.assignedManagers) updates.assignedManagers = updates.assignedManagers.map(id => new mongoose.Types.ObjectId(id));
    const project = await Project.findOneAndUpdate({ _id: req.params.id, orgId: req.user.orgId }, updates, { new: true, runValidators: true });
    if (!project) return res.status(404).json({ error: "Projet introuvable." });
    return res.json({ message: "Projet mis à jour.", project: await enrichProject(project) });
  } catch (err) {
    if (err.name === "ValidationError")
      return res.status(400).json({ error: Object.values(err.errors).map(e => e.message).join(" ") });
    return res.status(500).json({ error: "Erreur serveur." });
  }
}

async function remove(req, res) {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, orgId: req.user.orgId });
    if (!project) return res.status(404).json({ error: "Projet introuvable." });
    await Expense.deleteMany({ projectId: project._id });
    return res.json({ message: "Projet supprimé." });
  } catch (err) { return res.status(500).json({ error: "Erreur serveur." }); }
}

module.exports = { list, get, create, update, remove, projectExpenses };
