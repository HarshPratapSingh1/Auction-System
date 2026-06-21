const User = require("../models/User.model");
const Auction = require("../models/Auction.model");
const Bid = require("../models/Bid.model");

// ─── Dashboard Stats ────────────────────────────────────────────────────────

const getDashboardStats = async (req, res) => {
    try {
        const [
            totalUsers,
            totalBidders,
            totalConsignors,
            totalAuctions,
            activeAuctions,
            endedAuctions,
            totalBids,
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: "bidder" }),
            User.countDocuments({ role: "consignor" }),
            Auction.countDocuments(),
            Auction.countDocuments({ status: "active" }),
            Auction.countDocuments({ status: "ended" }),
            Bid.countDocuments(),
        ]);

        // Total platform revenue (sum of all ended auctions with a winner)
        const revenueResult = await Auction.aggregate([
            { $match: { status: "ended", winner: { $exists: true, $ne: null } } },
            { $group: { _id: null, total: { $sum: "$currentPrice" } } },
        ]);
        const totalRevenue = revenueResult[0]?.total || 0;

        // Recent 5 users
        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select("name email role createdAt");

        // Recent 5 auctions
        const recentAuctions = await Auction.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("seller", "name email")
            .select("title status currentPrice totalBids createdAt");

        return res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalBidders,
                totalConsignors,
                totalAuctions,
                activeAuctions,
                endedAuctions,
                totalBids,
                totalRevenue,
            },
            recentUsers,
            recentAuctions,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── User Management ────────────────────────────────────────────────────────

const getAllUsers = async (req, res) => {
    try {
        const { role, search, page = 1, limit = 10 } = req.query;
        const query = {};
        if (role && role !== "all") query.role = role;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }
        const skip = (Number(page) - 1) * Number(limit);
        const total = await User.countDocuments(query);
        const users = await User.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .select("-password");

        return res.status(200).json({
            success: true,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            users,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) return res.status(404).json({ success: false, message: "User not found." });
        return res.status(200).json({ success: true, user });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        if (!["bidder", "consignor", "admin"].includes(role)) {
            return res.status(400).json({ success: false, message: "Invalid role." });
        }
        // Prevent admin from demoting themselves
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: "You cannot change your own role." });
        }
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true, select: "-password" }
        );
        if (!user) return res.status(404).json({ success: false, message: "User not found." });
        return res.status(200).json({ success: true, message: `Role updated to ${role}.`, user });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        // Prevent admin from deleting themselves
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: "You cannot delete your own account." });
        }
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found." });

        // Clean up their auctions and bids
        await Auction.deleteMany({ seller: req.params.id });
        await Bid.deleteMany({ bidder: req.params.id });

        return res.status(200).json({ success: true, message: "User and their data deleted." });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Auction Management ─────────────────────────────────────────────────────

const getAllAuctions = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 10 } = req.query;
        const query = {};
        if (status && status !== "all") query.status = status;
        if (search) query.title = { $regex: search, $options: "i" };

        const skip = (Number(page) - 1) * Number(limit);
        const total = await Auction.countDocuments(query);
        const auctions = await Auction.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .populate("seller", "name email")
            .populate("winner", "name email");

        return res.status(200).json({
            success: true,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            auctions,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const updateAuctionStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!["active", "ended", "cancelled", "draft"].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status." });
        }
        const auction = await Auction.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate("seller", "name email");
        if (!auction) return res.status(404).json({ success: false, message: "Auction not found." });
        return res.status(200).json({ success: true, message: `Auction status set to ${status}.`, auction });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const adminDeleteAuction = async (req, res) => {
    try {
        const auction = await Auction.findByIdAndDelete(req.params.id);
        if (!auction) return res.status(404).json({ success: false, message: "Auction not found." });
        await Bid.deleteMany({ auction: req.params.id });
        return res.status(200).json({ success: true, message: "Auction and its bids deleted." });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getDashboardStats,
    getAllUsers,
    getUserById,
    updateUserRole,
    deleteUser,
    getAllAuctions,
    updateAuctionStatus,
    adminDeleteAuction,
};