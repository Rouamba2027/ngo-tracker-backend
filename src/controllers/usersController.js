const bcrypt = require("bcryptjs");
const User = require("../models/User");

// Liste des utilisateurs (ADMIN)
async function list(req, res) {
  try {
    const users = await User.find({ orgId: req.user.orgId }).sort({ createdAt: 1 });
    return res.json({ users, total: users.length });
  } catch (err) {
    return res.status(500).json({ error: "Erreur serveur." });
  }
}

// Détails utilisateur
async function get(req, res) {
  try {
    const user = await User.findOne({ _id: req.params.id, orgId: req.user.orgId });
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });
    return res.json({ user });
  } catch (err) {
    if (err.name === "CastError") return res.status(404).json({ error: "Utilisateur introuvable." });
    return res.status(500).json({ error: "Erreur serveur." });
  }
}

// Mise à jour utilisateur
async function update(req, res) {
  try {
    const user = await User.findOne({ _id: req.params.id, orgId: req.user.orgId });
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });

    const isSelf = user._id.toString() === req.user.userId;
    const isAdmin = req.user.role === "ADMIN";

    if (!isSelf && !isAdmin) {
      return res.status(403).json({ error: "Vous ne pouvez modifier que votre propre profil." });
    }

    if (req.body.role && !isAdmin) {
      return res.status(403).json({ error: "Seuls les administrateurs peuvent modifier les rôles." });
    }

    if (req.body.name) user.name = req.body.name;

    // 🔒 Empêcher de promouvoir en ADMIN sauf si déjà ADMIN
    if (req.body.role && isAdmin) {
      if (req.body.role === "ADMIN" && user.role !== "ADMIN") {
        return res.status(403).json({ error: "Création ou promotion en ADMIN interdite." });
      }
      user.role = req.body.role;
    }

    if (req.body.password) {
      if (req.body.password.length < 8) {
        return res.status(400).json({ error: "Mot de passe minimum 8 caractères." });
      }
      user.passwordHash = await bcrypt.hash(req.body.password, 10);
    }

    await user.save();
    return res.json({ message: "Utilisateur mis à jour.", user });

  } catch (err) {
    return res.status(500).json({ error: "Erreur serveur." });
  }
}

// Supprimer utilisateur
async function remove(req, res) {
  try {
    const user = await User.findOne({ _id: req.params.id, orgId: req.user.orgId });
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });

    // ❌ empêcher suppression de soi-même
    if (user._id.toString() === req.user.userId) {
      return res.status(400).json({ error: "Vous ne pouvez pas supprimer votre propre compte." });
    }

    // 🔒 empêcher suppression du dernier ADMIN
    if (user.role === "ADMIN") {
      const adminCount = await User.countDocuments({ orgId: req.user.orgId, role: "ADMIN" });
      if (adminCount <= 1) {
        return res.status(400).json({ error: "Impossible de supprimer le dernier ADMIN." });
      }
    }

    await user.deleteOne();
    return res.json({ message: "Utilisateur supprimé avec succès." });

  } catch (err) {
    return res.status(500).json({ error: "Erreur serveur." });
  }
}

// 🔐 Création utilisateur (ADMIN uniquement)
async function createUserByAdmin(req, res) {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "Tous les champs sont requis." });
    }

    // 🔒 empêcher création ADMIN
    if (!["MANAGER", "VIEWER"].includes(role)) {
      return res.status(400).json({
        error: "Seuls les rôles MANAGER ou VIEWER sont autorisés.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Mot de passe minimum 8 caractères." });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "Email déjà utilisé." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      orgId: req.user.orgId,
      name,
      email,
      passwordHash,
      role,
    });

    return res.status(201).json({
      message: "Utilisateur créé avec succès",
      user,
    });

  } catch (err) {
    console.error("createUser error:", err);
    return res.status(500).json({ error: "Erreur serveur." });
  }
}

module.exports = {
  list,
  get,
  update,
  remove,
  createUserByAdmin,
};