// ============================================================
// routes/reportsRoute.js — /api/reports
// ADMIN   : lecture + générer + supprimer
// MANAGER : lecture + générer (pas de suppression)
// VIEWER  : lecture seule
// ============================================================

const express = require("express");
const router  = express.Router();

const { list, get, generate, remove } = require("../controllers/reportsController");
const { authenticate, authorize }     = require("../middleware/authMiddleware");

router.use(authenticate);

router.get("/",          list);
router.get("/:id",       get);
router.post("/generate", authorize("ADMIN", "MANAGER"), generate);
router.delete("/:id",    authorize("ADMIN"), remove);

module.exports = router;
