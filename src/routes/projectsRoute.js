// ============================================================
// routes/projectsRoute.js — /api/projects
// ADMIN : CRUD complet
// MANAGER : lecture seule (projets assignés)
// VIEWER  : lecture seule (tous les projets org)
// ============================================================

const express = require("express");
const router  = express.Router();

const {
  list, get, create, update, remove, projectExpenses,
} = require("../controllers/projectsController");

const { authenticate, authorize } = require("../middleware/authMiddleware");

router.use(authenticate);

router.get("/",            list);
router.get("/:id",         get);
router.get("/:id/expenses", projectExpenses);
router.post("/",           authorize("ADMIN"), create);
router.put("/:id",         authorize("ADMIN"), update);
router.delete("/:id",      authorize("ADMIN"), remove);

module.exports = router;
