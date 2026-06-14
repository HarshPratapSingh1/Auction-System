const express = require("express");
const router = express.Router();
const { getMyStats, updateProfile } = require("../controllers/user.controller");
const { protect } = require("../middleware/auth.middleware");

// All routes are protected
router.get("/me/stats", protect, getMyStats);
router.put("/me", protect, updateProfile);

module.exports = router;
