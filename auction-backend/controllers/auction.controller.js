const Auction = require("../models/Auction.model");
const User = require("../models/User.model");

const getAuctions = async (req, res) => {
  try {
    const { status, category, search, sort, page = 1, limit = 12 } = req.query;
    const query = {};
    if (status) {
      query.status = status;
    }
    else {
      query.status = "active";
      query.endTime = { $gt: new Date() }; // ← only truly live ones
    }
    if (category && category !== "All") query.category = category;
    if (search) query.title = { $regex: search, $options: "i" };

    let sortObj = { createdAt: -1 };
    if (sort === "price_asc") sortObj = { currentPrice: 1 };
    if (sort === "price_desc") sortObj = { currentPrice: -1 };
    if (sort === "ending_soon") sortObj = { endTime: 1 };
    if (sort === "most_bids") sortObj = { totalBids: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Auction.countDocuments(query);
    const auctions = await Auction.find(query)
      .populate("seller", "name email role")
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit));

    return res.status(200).json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), auctions });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate("seller", "name email role createdAt")
      .populate("winner", "name email");
    if (!auction) return res.status(404).json({ success: false, message: "Auction not found." });
    return res.status(200).json({ success: true, auction });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Only consignors can create
const createAuction = async (req, res) => {
  try {
    const { title, description, images, category, startingPrice, reservePrice, bidIncrement, endTime } = req.body;
    if (new Date(endTime) <= new Date())
      return res.status(400).json({ success: false, message: "End time must be in the future." });

    const auction = await Auction.create({
      title, description, images: images || [], category,
      startingPrice, currentPrice: startingPrice,
      reservePrice: reservePrice || 0,
      bidIncrement: bidIncrement || 1,
      endTime, seller: req.user._id,
    });
    await auction.populate("seller", "name email role");
    return res.status(201).json({ success: true, message: "Auction created successfully.", auction });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) return res.status(404).json({ success: false, message: "Auction not found." });
    if (auction.seller.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ success: false, message: "Not authorized." });
    if (auction.totalBids > 0)
      return res.status(400).json({ success: false, message: "Cannot edit an auction with existing bids." });

    const allowed = ["title", "description", "images", "category", "startingPrice", "reservePrice", "bidIncrement", "endTime", "status"];
    allowed.forEach((f) => { if (req.body[f] !== undefined) auction[f] = req.body[f]; });
    await auction.save();
    await auction.populate("seller", "name email role");
    return res.status(200).json({ success: true, message: "Updated.", auction });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) return res.status(404).json({ success: false, message: "Auction not found." });
    if (auction.seller.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ success: false, message: "Not authorized." });
    if (auction.totalBids > 0)
      return res.status(400).json({ success: false, message: "Cannot delete an auction with existing bids." });
    await auction.deleteOne();
    return res.status(200).json({ success: true, message: "Deleted." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getMyAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find({ seller: req.user._id }).sort({ createdAt: -1 });
    // Calculate total earnings from ended auctions
    const earnings = auctions
      .filter((a) => a.status === "ended" && a.winner)
      .reduce((sum, a) => sum + a.currentPrice, 0);
    return res.status(200).json({ success: true, auctions, totalEarnings: earnings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAuctions, getAuction, createAuction, updateAuction, deleteAuction, getMyAuctions };
