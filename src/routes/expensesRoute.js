// ============================================================
// routes/expensesRoute.js — /api/expenses
// ADMIN   : CRUD complet sur toutes les dépenses de l'org
// MANAGER : lecture + créer/modifier/supprimer ses propres dépenses
// VIEWER  : lecture seule
// ============================================================

const express = require("express");
const router  = express.Router();

const { list, get, create, update, remove } = require("../controllers/expensesController");
const { authenticate, authorize }           = require("../middleware/authMiddleware");

router.use(authenticate);

router.get("/",       list);
router.get("/:id",    get);
router.post("/",      authorize("ADMIN", "MANAGER"), create);
router.put("/:id",    authorize("ADMIN", "MANAGER"), update);
router.delete("/:id", authorize("ADMIN", "MANAGER"), remove);

module.exports = router;
