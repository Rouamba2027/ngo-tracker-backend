// ============================================================
// routes/usersRoute.js — /api/users
// ADMIN   : liste, consulter, modifier rôle, supprimer
// MANAGER / VIEWER : modifier uniquement son propre profil
// ============================================================

const express = require("express");
const router  = express.Router();

const { list, get, update, remove } = require("../controllers/usersController");
const { authenticate, authorize }   = require("../middleware/authMiddleware");

router.use(authenticate);

router.get("/",       authorize("ADMIN"), list);
router.get("/:id",    authorize("ADMIN"), get);
router.put("/:id",    update);                        // self ou admin
router.delete("/:id", authorize("ADMIN"), remove);

module.exports = router;
