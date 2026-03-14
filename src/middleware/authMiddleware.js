// ============================================================
// middleware/authMiddleware.js
// Authentification JWT + contrôle de rôle (RBAC).
// ============================================================

const jwt  = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

// ── authenticate ─────────────────────────────────────────────
// Vérifie le token Bearer, charge l'utilisateur depuis MongoDB,
// puis attache req.user pour les handlers suivants.
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token manquant. Veuillez vous connecter." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Vérifie que l'utilisateur existe toujours en base
    const user = await User.findById(decoded.userId).select("-passwordHash");
    if (!user) {
      return res.status(401).json({ error: "Utilisateur introuvable." });
    }

    req.user = {
      userId: user._id.toString(),
      role:   user.role,
      orgId:  user.orgId.toString(),
      email:  user.email,
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: "Token invalide ou expiré." });
  }
}

// ── authorize ────────────────────────────────────────────────
// Garde de rôle — à utiliser après authenticate.
// Usage : authorize("ADMIN") | authorize("ADMIN", "MANAGER")
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Non authentifié." });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Accès refusé. Rôle requis : ${allowedRoles.join(" ou ")}.`,
      });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
