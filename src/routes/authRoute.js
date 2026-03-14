// ============================================================
// routes/authRoute.js — /api/auth
// POST /register  POST /login  GET /me
// ============================================================

const express = require("express");
const router  = express.Router();

const { register, login, me } = require("../controllers/authController");
const { authenticate }        = require("../middleware/authMiddleware");

// POST /api/auth/register
// type="ONG"     → crée org + compte ADMIN, renvoie orgCode généré
// type="MANAGER" | "VIEWER" → rejoint une org existante via orgCode
router.post("/register", register);

// POST /api/auth/login
// Body: { email, password, role, orgCode? }   orgCode requis pour ADMIN
router.post("/login", login);

// GET /api/auth/me  — restaure la session depuis un token stocké
router.get("/me", authenticate, me);

module.exports = router;
