const mongoose = require("mongoose");
const Project  = require("../models/Project");
const Expense  = require("../models/Expense");
const Report   = require("../models/Report");

async function overview(req, res) {
  try {
    const orgId  = new mongoose.Types.ObjectId(req.user.orgId);
    const userId = new mongoose.Types.ObjectId(req.user.userId);

    const projectQuery = { orgId };
    if (req.user.role === "MANAGER") projectQuery.assignedManagers = userId;

    const projects   = await Project.find(projectQuery);
    const projectIds = projects.map(p => p._id);

    const expenseAgg = await Expense.aggregate([
      { $match: { projectId: { $in: projectIds } } },
      { $group: { _id: "$projectId", total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]);
    const spentMap = {};
    expenseAgg.forEach(r => { spentMap[r._id.toString()] = { total: r.total, count: r.count }; });

    const enriched = projects.map(p => {
      const spent     = spentMap[p._id.toString()]?.total || 0;
      const budgetPct = p.budgetAllocated > 0 ? Math.round((spent / p.budgetAllocated) * 100) : 0;
      let status = p.status;
      if (spent > p.budgetAllocated) status = "exceeded";
      else if (budgetPct >= 65 && status === "active") status = "pending";
      return { ...p.toJSON(), budgetSpent: spent, budgetPct, status, expenseCount: spentMap[p._id.toString()]?.count || 0 };
    });

    const totalReports = await Report.countDocuments({ orgId });
    const stats = {
      activeProjects:       enriched.filter(p => ["active","pending"].includes(p.status)).length,
      completedProjects:    enriched.filter(p => p.status === "done").length,
      overBudgetProjects:   enriched.filter(p => p.status === "exceeded").length,
      totalBudgetAllocated: enriched.reduce((s,p) => s + p.budgetAllocated, 0),
      totalBudgetSpent:     enriched.reduce((s,p) => s + p.budgetSpent, 0),
      totalReports,
    };

    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ key: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`, label: d.toLocaleString("fr-FR", { month: "short" }) });
    }
    const monthAgg = await Expense.aggregate([
      { $match: { projectId: { $in: projectIds } } },
      { $group: { _id: { $substr: ["$date", 0, 7] }, total: { $sum: "$amount" } } },
    ]);
    const monthMap = {};
    monthAgg.forEach(r => { monthMap[r._id] = r.total; });
    const monthlyExpenses = months.map(m => ({ month: m.key, label: m.label, total: monthMap[m.key] || 0 }));

    const domainMap = {};
    enriched.forEach(p => {
      if (!domainMap[p.domain]) domainMap[p.domain] = { allocated: 0, spent: 0, count: 0 };
      domainMap[p.domain].allocated += p.budgetAllocated;
      domainMap[p.domain].spent     += p.budgetSpent;
      domainMap[p.domain].count     += 1;
    });
    const budgetByDomain = Object.entries(domainMap).map(([domain, data]) => ({
      domain, ...data,
      percentage: stats.totalBudgetAllocated > 0 ? Math.round((data.allocated / stats.totalBudgetAllocated) * 100) : 0,
    }));

    const alerts = enriched
      .filter(p => p.status === "exceeded" || p.status === "pending")
      .map(p => ({ projectId: p.id, projectName: p.name, status: p.status, budgetAllocated: p.budgetAllocated, budgetSpent: p.budgetSpent, budgetPct: p.budgetPct, overBy: p.budgetSpent > p.budgetAllocated ? p.budgetSpent - p.budgetAllocated : 0 }))
      .sort((a,b) => b.budgetPct - a.budgetPct);

    return res.json({ stats, monthlyExpenses, budgetByDomain, alerts, recentProjects: enriched.slice(0, 5) });
  } catch (err) {
    console.error("dashboard.overview:", err);
    return res.status(500).json({ error: "Erreur serveur." });
  }
}

module.exports = { overview };