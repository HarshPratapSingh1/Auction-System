const express = require("express");
const router = express.Router();
const {
    getDashboardStats,
    getAllUsers,
    getUserById,
    updateUserRole,
    deleteUser,
    getAllAuctions,
    updateAuctionStatus,
    adminDeleteAuction,
} = require("../controllers/admin.controller");
const { protect, restrictTo } = require("../middleware/auth.middleware");

// All admin routes require login + admin role
router.use(protect, restrictTo("admin"));

// Dashboard
router.get("/stats", getDashboardStats);

// User management
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

// Auction management
router.get("/auctions", getAllAuctions);
router.put("/auctions/:id/status", updateAuctionStatus);
router.delete("/auctions/:id", adminDeleteAuction);

module.exports = router;