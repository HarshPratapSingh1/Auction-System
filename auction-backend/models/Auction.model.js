const mongoose = require("mongoose");

const auctionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    images: [
      {
        type: String, // URLs
      },
    ],
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["Electronics", "Fashion", "Art", "Collectibles", "Vehicles", "Real Estate", "Other"],
    },
    startingPrice: {
      type: Number,
      required: [true, "Starting price is required"],
      min: [0, "Price cannot be negative"],
    },
    currentPrice: {
      type: Number,
      default: function () {
        return this.startingPrice;
      },
    },
    reservePrice: {
      type: Number,
      default: 0,
    },
    bidIncrement: {
      type: Number,
      default: 1,
      min: [1, "Bid increment must be at least 1"],
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
      required: [true, "End time is required"],
    },
    status: {
      type: String,
      enum: ["draft", "active", "ended", "cancelled"],
      default: "active",
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    totalBids: {
      type: Number,
      default: 0,
    },
    watchers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    endingSoonNotified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto-update status based on endTime
auctionSchema.pre("save", function () {
  if (this.endTime < new Date() && this.status === "active") {
    this.status = "ended";
  }
});

// Virtual: is auction live?
auctionSchema.virtual("isLive").get(function () {
  return this.status === "active" && new Date() < this.endTime;
});

// Virtual: time remaining in ms
auctionSchema.virtual("timeRemaining").get(function () {
  return Math.max(0, new Date(this.endTime) - new Date());
});

auctionSchema.set("toJSON", { virtuals: true });
auctionSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Auction", auctionSchema);
