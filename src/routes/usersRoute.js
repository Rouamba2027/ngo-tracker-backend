const express = require("express");
const router = express.Router();

const {
  list,
  get,
  update,
  remove,
  createUserByAdmin,
} = require("../controllers/usersController");

const { authenticate, authorize } = require("../middleware/authMiddleware");

// 🔐 Toutes les routes nécessitent authentification
router.use(authenticate);

// ADMIN uniquement
router.post("/", authorize("ADMIN"), createUserByAdmin);
router.get("/", authorize("ADMIN"), list);
router.delete("/:id", authorize("ADMIN"), remove);

// ADMIN ou self
router.get("/:id", get);
router.put("/:id", update);

module.exports = router;