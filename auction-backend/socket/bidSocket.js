const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const Auction = require("../models/Auction.model");
const Bid = require("../models/Bid.model");
const cookie = require("cookie");
const { sendOutbidEmail } = require("../utils/emailService");

module.exports = (io) => {
  // ── Auth middleware for socket connections ──────────────────────────────
  io.use(async (socket, next) => {
    try {
      // Parse cookies from the handshake headers
      const cookies = cookie.parse(socket.handshake.headers.cookie || "");
      const token = cookies.token;

      if (!token) {
        // Allow unauthenticated connections (for browsing)
        socket.user = null;
        return next();
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      socket.user = user || null;
      next();
    } catch {
      socket.user = null;
      next();
    }
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id} | user: ${socket.user?.name || "guest"}`);

    // ── Join auction room ─────────────────────────────────────────────────
    socket.on("join_auction", async (auctionId) => {
      socket.join(auctionId);
      console.log(`${socket.user?.name || "guest"} joined auction room: ${auctionId}`);

      // Send current bid history to the joining user
      try {
        const bids = await Bid.find({ auction: auctionId })
          .populate("bidder", "name")
          .sort({ createdAt: -1 })
          .limit(20);
        socket.emit("bid_history", bids);
      } catch (err) {
        socket.emit("error", { message: "Failed to load bid history." });
      }
    });

    // ── Leave auction room ────────────────────────────────────────────────
    socket.on("leave_auction", (auctionId) => {
      socket.leave(auctionId);
    });

    // ── Place bid ─────────────────────────────────────────────────────────
    socket.on("place_bid", async ({ auctionId, amount }) => {
      try {
        // Must be authenticated
        if (!socket.user) {
          return socket.emit("bid_error", { message: "You must be logged in to bid." });
        }

        // Only bidders can bid
        if (socket.user.role !== "bidder") {
          return socket.emit("bid_error", { message: "Only bidders can place bids." });
        }

        const auction = await Auction.findById(auctionId);

        // Auction must exist and be active
        if (!auction) return socket.emit("bid_error", { message: "Auction not found." });
        if (auction.status !== "active") return socket.emit("bid_error", { message: "This auction is not active." });
        if (new Date() > new Date(auction.endTime)) return socket.emit("bid_error", { message: "This auction has ended." });

        // Can't bid on your own auction
        if (auction.seller.toString() === socket.user._id.toString()) {
          return socket.emit("bid_error", { message: "You cannot bid on your own auction." });
        }

        // ── Strict bid validation ─────────────────────────────────────────
        const minBid = auction.currentPrice + auction.bidIncrement;
        if (amount < minBid) {
          return socket.emit("bid_error", {
            message: `Minimum bid is $${minBid.toLocaleString()} (current $${auction.currentPrice} + increment $${auction.bidIncrement}).`,
          });
        }

        // Mark previous winning bid as not winning
        await Bid.updateMany({ auction: auctionId, isWinning: true }, { isWinning: false });

        // Create new bid
        const bid = await Bid.create({
          auction: auctionId,
          bidder: socket.user._id,
          amount,
          isWinning: true,
        });
        await bid.populate("bidder", "name");

        // Update auction
        auction.currentPrice = amount;
        auction.totalBids += 1;
        auction.winner = socket.user._id;
        await auction.save();

        // Update bidder stats
        await User.findByIdAndUpdate(socket.user._id, { $inc: { totalBidsPlaced: 1 } });

        // Broadcast new bid to everyone in the room
        const bidData = {
          _id: bid._id,
          amount: bid.amount,
          bidder: { _id: socket.user._id, name: socket.user.name },
          createdAt: bid.createdAt,
          isWinning: true,
          auctionId,
          currentPrice: amount,
          totalBids: auction.totalBids,
        };

        io.to(auctionId).emit("new_bid", bidData);
        console.log(`💰 Bid: $${amount} on ${auctionId} by ${socket.user.name}`);
        const previousWinningBid = await Bid.findOne({
          auction: auctionId,
          isWinning: false,
          bidder: { $ne: socket.user._id },
        }).populate("bidder", "name email").sort({ createdAt: -1 });

        if (previousWinningBid) {
          try {
            await sendOutbidEmail({
              to: previousWinningBid.bidder.email,
              name: previousWinningBid.bidder.name,
              auctionTitle: auction.title,
              auctionId: auction._id,
              newBidAmount: amount,
              yourBidAmount: previousWinningBid.amount,
            });
          } catch (e) {
              console.error("Outbid email failed:", e.message);
          }
        }
        } catch (err) {
        console.error("place_bid error:", err.message);
        socket.emit("bid_error", { message: "Failed to place bid. Try again." });
      }
    });

    // ── Disconnect ────────────────────────────────────────────────────────
    socket.on("disconnect", () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};
