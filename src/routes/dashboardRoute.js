const express = require("express");
const router  = express.Router();

const { overview }     = require("../controllers/dashboardController");
const { authenticate } = require("../middleware/authMiddleware");

router.get("/", authenticate, overview);

module.exports = router;