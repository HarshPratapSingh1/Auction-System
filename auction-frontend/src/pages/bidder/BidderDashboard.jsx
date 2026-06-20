import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import Navbar from "../../components/layout/Navbar";

export default function BidderDashboard() {
  const { user } = useContext(AuthContext);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("active");

  useEffect(() => {
  api.get("/bids/my-bids")
    .then((res) => setBids(res.data.bids))
    .catch(() => {})
    .finally(() => setLoading(false));
}, []);

  const now = new Date();
  const isEnded = (b) => b.auction && (b.auction.status === "ended" || new Date(b.auction.endTime) < now);
  const isLive = (b) => b.auction && b.auction.status === "active" && new Date(b.auction.endTime) > now;

  const activeBids = bids.filter((b) => isLive(b));
  const wonBids = bids.filter((b) => isEnded(b) && b.isWinning);
  const lostBids = bids.filter((b) => isEnded(b) && !b.isWinning);
  const endedBids = bids.filter((b) => isEnded(b));
  const allBids = bids;

  const tabMap = { active: activeBids, won: wonBids, lost: lostBids, ended: endedBids, all: allBids };
  const displayBids = tabMap[tab];

  const totalSpent = wonBids.reduce((s, b) => s + b.amount, 0);
  const winRate = bids.length > 0 ? Math.round((wonBids.length / new Set(bids.map((b) => b.auction?._id)).size) * 100) : 0;

  const statBox = (label, value, color = "#f0ede6", sub = null) => (
    <div style={{ background: "#141414", borderRadius: "12px", padding: "1.5rem", border: "1px solid #1e1e1e" }}>
      <p style={{ color: "#555", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 0.5rem" }}>{label}</p>
      <p style={{ color, fontFamily: "'Syne', sans-serif", fontSize: "1.75rem", fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>{value}</p>
      {sub && <p style={{ color: "#444", fontSize: "0.72rem", margin: "0.3rem 0 0" }}>{sub}</p>}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f0ede6", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');`}</style>
      <Navbar />

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2.5rem 2rem" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2.5rem" }}>
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "2rem", fontWeight: 800, margin: "0 0 0.25rem", letterSpacing: "-0.02em" }}>
              My Bids
            </h1>
            <p style={{ color: "#555", fontSize: "0.9rem", margin: 0 }}>Track everything you're bidding on</p>
          </div>
          <Link to="/auctions" style={{ background: "#e8c547", color: "#0a0a0a", padding: "0.6rem 1.25rem", borderRadius: "8px", textDecoration: "none", fontWeight: 600, fontSize: "0.85rem" }}>
            Browse Auctions →
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2.5rem" }}>
          {statBox("Active Bids", activeBids.length, "#e8c547", "currently bidding")}
          {statBox("Auctions Won", wonBids.length, "#4ade80", "items secured")}
          {statBox("Total Spent", `$${totalSpent.toLocaleString()}`, "#a78bfa", "on won auctions")}
          {statBox("Win Rate", `${winRate}%`, "#60a5fa", "of auctions entered")}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "0", marginBottom: "1.5rem", borderBottom: "1px solid #1e1e1e" }}>
          {[
            ["active", `Active (${activeBids.length})`],
            ["won", `Won (${wonBids.length})`],
            ["lost", `Lost (${lostBids.length})`],
            ["ended", `Ended (${bids.filter(b => b.auction?.status === "ended").length})`],
            ["all", `All (${allBids.length})`],
          ].map(([val, label]) => (
            <button key={val} onClick={() => setTab(val)} style={{ padding: "0.65rem 1.25rem", background: "transparent", border: "none", borderBottom: tab === val ? "2px solid #e8c547" : "2px solid transparent", color: tab === val ? "#e8c547" : "#555", cursor: "pointer", fontSize: "0.85rem", fontWeight: tab === val ? 600 : 400, fontFamily: "'DM Sans', sans-serif", marginBottom: "-1px", transition: "color 0.15s" }}>
              {label}
            </button>
          ))}
        </div>

        {/* Bid list */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {[1, 2, 3].map((i) => <div key={i} style={{ height: "88px", background: "#141414", borderRadius: "12px", animation: "pulse 1.5s infinite" }} />)}
          </div>
        ) : displayBids.length === 0 ? (
          <div style={{ textAlign: "center", padding: "5rem 2rem" }}>
            <p style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
              {tab === "won" ? "🏆" : tab === "lost" ? "😔" : "🏷️"}
            </p>
            <p style={{ color: "#444" }}>
              {tab === "won" ? "You haven't won any auctions yet." : tab === "lost" ? "No lost bids." : "No bids placed yet."}
            </p>
            <Link to="/auctions" style={{ color: "#e8c547", textDecoration: "none", fontWeight: 600, display: "inline-block", marginTop: "1rem", fontSize: "0.9rem" }}>
              Browse live auctions →
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {displayBids.map((bid) => {
              const auction = bid.auction;
              if (!auction) return null;
              const img = auction.images?.[0] || "https://placehold.co/72x72/141414/444?text=?";
              const isWinning = bid.isWinning && auction.status === "active";
              const isWon = bid.isWinning && auction.status === "ended";
              const isLost = !bid.isWinning && auction.status === "ended";
              const statusLabel = isWon ? "🏆 Won" : isWinning ? "⬆ Winning" : isLost ? "Lost" : "Outbid";
              const statusColor = isWon ? "#4ade80" : isWinning ? "#e8c547" : "#666";

              return (
                <Link key={bid._id} to={`/auctions/${auction._id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div style={{ background: "#141414", borderRadius: "12px", padding: "1rem 1.25rem", display: "flex", gap: "1rem", alignItems: "center", border: `1px solid ${isWon ? "#4ade8033" : isWinning ? "#e8c54733" : "#1e1e1e"}`, transition: "border-color 0.15s" }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = "#333"}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = isWon ? "#4ade8033" : isWinning ? "#e8c54733" : "#1e1e1e"}
                  >
                    <img src={img} alt="" onError={(e) => { e.target.src = "https://placehold.co/72x72/141414/444?text=?"; }} style={{ width: "72px", height: "72px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, margin: "0 0 0.3rem", fontSize: "0.95rem", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{auction.title}</p>
                      <p style={{ color: "#555", fontSize: "0.8rem", margin: 0 }}>
                        Your bid: <span style={{ color: "#e8c547", fontWeight: 600 }}>${bid.amount?.toLocaleString()}</span>
                        {" · "}Current: <span style={{ color: "#aaa" }}>${auction.currentPrice?.toLocaleString()}</span>
                        {" · "}{new Date(bid.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span style={{ background: statusColor + "22", color: statusColor, padding: "0.25rem 0.75rem", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 600, flexShrink: 0 }}>
                      {statusLabel}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }`}</style>
    </div>
  );
}
