const Bid = require("../models/Bid.model");
const Auction = require("../models/Auction.model");

// Get all bids for an auction (public)
const getAuctionBids = async (req, res) => {
  try {
    const bids = await Bid.find({ auction: req.params.id })
      .populate("bidder", "name")
      .sort({ createdAt: -1 })
      .limit(50);
    return res.status(200).json({ success: true, bids });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get bids placed by the logged-in bidder
const getMyBids = async (req, res) => {
  try {
    const bids = await Bid.find({ bidder: req.user._id })
      .populate("auction", "title currentPrice status endTime images winner")
      .sort({ createdAt: -1 });

    // Fix: mark auctions as ended if their endTime has passed
    const fixedBids = bids.map((bid) => {
      const b = bid.toObject();
      if (b.auction && b.auction.status === "active" && new Date(b.auction.endTime) < new Date()) {
        b.auction.status = "ended";
      }
      // isWinning: user's bid matches the auction's current highest AND auction is ended
      b.isWinning =
        b.auction?.status === "ended" &&
        b.auction?.winner?.toString() === req.user._id.toString();
      return b;
    });

    return res.status(200).json({ success: true, bids: fixedBids }); // ✅ was returning wrong variable
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAuctionBids, getMyBids };
// still to edit