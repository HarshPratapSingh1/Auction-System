const cron = require("node-cron");
const Auction = require("../models/Auction.model");
const Bid = require("../models/Bid.model");
const User = require("../models/User.model");
const {
  sendAuctionWonEmail,
  sendItemSoldEmail,
  sendNoSaleEmail,
  sendEndingSoonEmail,
} = require("../utils/emailService");

// ── Job 1: Auto-end expired auctions (runs every minute) ─────────────────────
const autoEndAuctions = async () => {
  try {
    const expiredAuctions = await Auction.find({
      status: "active",
      endTime: { $lte: new Date() },
    }).populate("seller", "name email");

    if (expiredAuctions.length === 0) return;

    console.log(`⏰ Auto-ending ${expiredAuctions.length} expired auction(s)...`);

    for (const auction of expiredAuctions) {
      // Find winning bid
      const winningBid = await Bid.findOne({ auction: auction._id, isWinning: true })
        .populate("bidder", "name email");

      // Mark auction as ended
      auction.status = "ended";

      if (winningBid) {
        auction.winner = winningBid.bidder._id;
        await auction.save();

        // Update seller stats
        await User.findByIdAndUpdate(auction.seller._id, {
          $inc: { totalEarnings: auction.currentPrice, totalAuctionsSold: 1 },
        });

        // Update winner stats
        await User.findByIdAndUpdate(winningBid.bidder._id, {
          $inc: { totalWon: 1 },
        });

        // Send winner email
        try {
          await sendAuctionWonEmail({
            to: winningBid.bidder.email,
            name: winningBid.bidder.name,
            auctionTitle: auction.title,
            auctionId: auction._id,
            winningBid: auction.currentPrice,
          });
          console.log(`📧 Won email sent to ${winningBid.bidder.email}`);
        } catch (e) {
          console.error("Won email failed:", e.message);
        }

        // Send seller email
        try {
          await sendItemSoldEmail({
            to: auction.seller.email,
            name: auction.seller.name,
            auctionTitle: auction.title,
            auctionId: auction._id,
            soldPrice: auction.currentPrice,
            winnerName: winningBid.bidder.name,
            totalBids: auction.totalBids,
          });
          console.log(`📧 Sold email sent to ${auction.seller.email}`);
        } catch (e) {
          console.error("Sold email failed:", e.message);
        }
      } else {
        // No bids — notify seller
        await auction.save();
        try {
          await sendNoSaleEmail({
            to: auction.seller.email,
            name: auction.seller.name,
            auctionTitle: auction.title,
            auctionId: auction._id,
          });
          console.log(`📧 No-sale email sent to ${auction.seller.email}`);
        } catch (e) {
          console.error("No-sale email failed:", e.message);
        }
      }

      console.log(`✅ Auction ended: "${auction.title}" | Winner: ${winningBid ? winningBid.bidder.name : "none"}`);
    }
  } catch (err) {
    console.error("autoEndAuctions error:", err.message);
  }
};

// ── Job 2: Ending soon alerts — 30 minutes before end (runs every 5 minutes) ──
const endingSoonAlerts = async () => {
  try {
    const now = new Date();
    const in30 = new Date(now.getTime() + 30 * 60 * 1000);
    const in25 = new Date(now.getTime() + 25 * 60 * 1000);

    // Auctions ending in 25-30 minutes
    const endingSoon = await Auction.find({
      status: "active",
      endTime: { $gte: in25, $lte: in30 },
      endingSoonNotified: { $ne: true }, // don't double-send
    });

    for (const auction of endingSoon) {
      // Get all unique bidders for this auction
      const bids = await Bid.find({ auction: auction._id })
        .populate("bidder", "name email")
        .distinct("bidder");

      const uniqueBidders = await User.find({ _id: { $in: bids } });

      const minutesLeft = Math.round((new Date(auction.endTime) - now) / 60000);

      for (const bidder of uniqueBidders) {
        try {
          await sendEndingSoonEmail({
            to: bidder.email,
            name: bidder.name,
            auctionTitle: auction.title,
            auctionId: auction._id,
            currentPrice: auction.currentPrice,
            minutesLeft,
          });
        } catch (e) {
          console.error(`Ending soon email failed for ${bidder.email}:`, e.message);
        }
      }

      // Mark as notified so we don't send again
      auction.endingSoonNotified = true;
      await auction.save();
      console.log(`📧 Ending soon alerts sent for: "${auction.title}"`);
    }
  } catch (err) {
    console.error("endingSoonAlerts error:", err.message);
  }
};

// ── Start all cron jobs ───────────────────────────────────────────────────────
const startCronJobs = () => {
  // Every minute — check for expired auctions
  cron.schedule("* * * * *", () => {
    autoEndAuctions();
  });

  // Every 5 minutes — send ending soon alerts
  cron.schedule("*/5 * * * *", () => {
    endingSoonAlerts();
  });

  console.log("⏰ Cron jobs started: auto-end (1min) + ending-soon alerts (5min)");
};

module.exports = { startCronJobs, autoEndAuctions };
