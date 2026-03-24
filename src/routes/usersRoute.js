const express = require("express");
const router = express.Router();
const { list, get, update, remove, createUserByAdmin } = require("../controllers/usersController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

router.use(authenticate);

router.get("/", authorize("ADMIN"), list);
router.get("/:id", get); // self ou admin
router.put("/:id", update); // self ou admin
router.delete("/:id", authorize("ADMIN"), remove);
router.post("/", authorize("ADMIN"), createUserByAdmin); // création MANAGER/VIEWER par ADMIN

module.exports = router;