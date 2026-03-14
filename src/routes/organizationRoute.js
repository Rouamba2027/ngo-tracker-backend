// ============================================================
// routes/organizationRoute.js — /api/organization
// GET /  — lecture pour tous
// PUT /  — modification nom/pays (ADMIN uniquement)
// ============================================================

const express = require("express");
const router  = express.Router();

const { get, update }           = require("../controllers/organizationController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

router.use(authenticate);

router.get("/",  get);
router.put("/",  authorize("ADMIN"), update);

module.exports = router;
