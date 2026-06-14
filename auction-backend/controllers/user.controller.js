const User = require("../models/User.model");
const bcrypt = require("bcryptjs");

// GET /api/users/me/stats  — dashboard stats for current user
const getMyStats = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        return res.status(200).json({
            success: true,
            stats: {
                totalBidsPlaced: user.totalBidsPlaced,
                totalWon: user.totalWon,
                totalEarnings: user.totalEarnings,
                totalAuctionsSold: user.totalAuctionsSold,
            },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/users/me  — update name or password
const updateProfile = async (req, res) => {
    try {
        const { name, currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id).select("+password");

        // Update name if provided
        if (name && name.trim()) {
            user.name = name.trim();
        }

        // Update password if provided
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({
                    success: false,
                    message: "Current password is required to set a new password.",
                });
            }
            const isMatch = await user.matchPassword(currentPassword);
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: "Current password is incorrect.",
                });
            }
            if (newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: "New password must be at least 6 characters.",
                });
            }
            user.password = newPassword; // pre-save hook will hash it
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getMyStats, updateProfile };
