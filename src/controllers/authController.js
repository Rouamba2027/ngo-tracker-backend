// ============================================================
// authController.js — Contrôleur d'authentification
// ============================================================

const bcrypt       = require("bcryptjs");
const jwt          = require("jsonwebtoken");
const Organization = require("../models/Organization");
const User         = require("../models/User");

const JWT_SECRET     = process.env.JWT_SECRET     || "dev_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// ── Génération du token JWT ───────────────────────────────
function signToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), role: user.role, orgId: user.orgId.toString() },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// ── Nettoyage des données utilisateur pour le frontend ─────
function sanitizeUser(user, org) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    orgId: user.orgId.toString(),
    orgName: org?.name || null,
    orgCode: org?.orgCode || null,
    createdAt: user.createdAt,
  };
}

// ── Création d’un compte ONG ──────────────────────────────
async function register(req, res) {
  try {
    const { name, email, password, orgName, receiptNumber, country } = req.body;

    // Vérifications obligatoires
    if (!name || !email || !password)
      return res.status(400).json({ error: "Tous les champs obligatoires doivent être renseignés." });

    if (password.length < 8)
      return res.status(400).json({ error: "Le mot de passe doit contenir au moins 8 caractères." });

    if (await User.exists({ email: email.toLowerCase().trim() }))
      return res.status(409).json({ error: "Un compte existe déjà avec cet email." });

    if (!orgName || !receiptNumber || !country)
      return res.status(400).json({ error: "Nom de l'ONG, numéro de récépissé et pays sont requis." });

    if (country.trim().length !== 2)
      return res.status(400).json({ error: "Le code pays doit contenir exactement 2 lettres (ex: BF, FR, CI)." });

    if (await Organization.exists({ receiptNumber }))
      return res.status(409).json({ error: "Ce numéro de récépissé est déjà enregistré." });

    // ── Génération d’un orgCode unique ─────────────────────
    let generatedOrgCode;
    do {
      generatedOrgCode = `NGO-${country.toUpperCase()}-2025-${String(Math.floor(Math.random() * 90000) + 10000)}`;
    } while (await Organization.exists({ orgCode: generatedOrgCode }));

    // Création de l’ONG
    const org = await Organization.create({
      name: orgName,
      orgCode: generatedOrgCode,
      receiptNumber,
      country: country.toUpperCase()
    });

    // Création de l’admin
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      orgId: org._id,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: "ADMIN"
    });

    const token = signToken(user);

    return res.status(201).json({
      message: "Compte créé avec succès.",
      orgCode: org.orgCode,
      token,
      user: sanitizeUser(user, org)
    });

  } catch (err) {
    // Gestion des erreurs MongoDB et validation
    if (err.name === "ValidationError")
      return res.status(400).json({ error: Object.values(err.errors).map(e => e.message).join(" ") });

    if (err.code === 11000)
      return res.status(409).json({ error: "Cet email ou ce code est déjà utilisé." });

    console.error("register error:", err);
    return res.status(500).json({ error: "Erreur serveur interne." });
  }
}

// ── Connexion utilisateur ────────────────────────────────
async function login(req, res) {
  try {
    const { email, password, orgCode } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Email et mot de passe sont requis." });

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+passwordHash");
    if (!user)
      return res.status(401).json({ error: "Identifiants invalides." });

    if (!await bcrypt.compare(password, user.passwordHash))
      return res.status(401).json({ error: "Identifiants invalides." });

    const org = await Organization.findById(user.orgId);

    // Vérification du code ONG pour les Admin
    if (user.role === "ADMIN" && orgCode) {
      const cleanOrgCode = orgCode.trim().toUpperCase();
      if (!org || org.orgCode.toUpperCase() !== cleanOrgCode)
        return res.status(401).json({ error: "Le code ONG ne correspond pas à votre compte." });
    }

    return res.json({
      message: "Connexion réussie.",
      token: signToken(user),
      user: sanitizeUser(user, org)
    });

  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ error: "Erreur serveur interne." });
  }
}

// ── Récupération du profil actuel ───────────────────────
async function me(req, res) {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });
    const org = await Organization.findById(user.orgId);
    return res.json({ user: sanitizeUser(user, org) });
  } catch (err) {
    return res.status(500).json({ error: "Erreur serveur interne." });
  }
}

module.exports = { register, login, me };