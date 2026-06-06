import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import Countdown from "../components/auction/Countdown";

export default function AuctionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const res = await api.get(`/auctions/${id}`);
        setAuction(res.data.auction);
      } catch {
        setError("Auction not found.");
      } finally {
        setLoading(false);
      }
    };
    fetchAuction();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this auction? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await api.delete(`/auctions/${id}`);
      navigate("/auctions");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete.");
      setDeleting(false);
    }
  };

  const isOwner = user && auction && auction.seller?._id === user._id;
  const statusColors = { active: "#4ade80", ended: "#e55", cancelled: "#888", draft: "#e8c547" };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", color: "#666", fontFamily: "'DM Sans', sans-serif" }}>
      Loading auction...
    </div>
  );

  if (error || !auction) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", color: "#e55", fontFamily: "'DM Sans', sans-serif" }}>
      {error}
    </div>
  );

  const images = auction.images?.length > 0 ? auction.images : ["https://placehold.co/600x400/141414/666?text=No+Image"];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f0ede6", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');`}</style>

      <nav style={{ borderBottom: "1px solid #1e1e1e", padding: "1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link to="/auctions" style={{ textDecoration: "none", color: "#666", fontSize: "0.85rem" }}>← Back to Auctions</Link>
        <Link to="/" style={{ textDecoration: "none", color: "#f0ede6", fontFamily: "'Syne', sans-serif", fontSize: "1.2rem", fontWeight: 800 }}>AUCTIONEER</Link>
        <div style={{ width: "120px" }} />
      </nav>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2.5rem 2rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem" }}>
        {/* Left: Images */}
        <div>
          <div style={{ borderRadius: "16px", overflow: "hidden", marginBottom: "1rem", background: "#141414", aspectRatio: "4/3" }}>
            <img src={images[activeImg]} alt={auction.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.target.src = "https://placehold.co/600x400/141414/666?text=No+Image"; }} />
          </div>
          {images.length > 1 && (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} style={{ width: "70px", height: "70px", borderRadius: "8px", overflow: "hidden", border: i === activeImg ? "2px solid #e8c547" : "2px solid transparent", padding: 0, cursor: "pointer", background: "#141414" }}>
                  <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div>
          {/* Status + Category */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
            <span style={{ padding: "0.25rem 0.75rem", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 600, background: statusColors[auction.status] + "22", color: statusColors[auction.status] }}>
              {auction.status.toUpperCase()}
            </span>
            <span style={{ padding: "0.25rem 0.75rem", borderRadius: "100px", fontSize: "0.75rem", background: "#1e1e1e", color: "#888" }}>
              {auction.category}
            </span>
          </div>

          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.8rem", fontWeight: 800, margin: "0 0 1rem", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            {auction.title}
          </h1>

          <p style={{ color: "#999", lineHeight: 1.7, marginBottom: "1.5rem", fontSize: "0.95rem" }}>
            {auction.description}
          </p>

          {/* Countdown */}
          {auction.status === "active" && (
            <div style={{ background: "#141414", borderRadius: "12px", padding: "1.25rem", marginBottom: "1.5rem" }}>
              <p style={{ color: "#666", fontSize: "0.75rem", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Time Remaining</p>
              <Countdown endTime={auction.endTime} />
            </div>
          )}

          {/* Price */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
            <div style={{ background: "#141414", borderRadius: "12px", padding: "1.25rem" }}>
              <p style={{ color: "#666", fontSize: "0.75rem", marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Current Bid</p>
              <p style={{ fontSize: "1.8rem", fontWeight: 700, color: "#e8c547", fontFamily: "'Syne', sans-serif" }}>
                ${auction.currentPrice?.toLocaleString()}
              </p>
            </div>
            <div style={{ background: "#141414", borderRadius: "12px", padding: "1.25rem" }}>
              <p style={{ color: "#666", fontSize: "0.75rem", marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Total Bids</p>
              <p style={{ fontSize: "1.8rem", fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>
                {auction.totalBids}
              </p>
            </div>
          </div>

          {/* Bid section placeholder */}
          {auction.status === "active" && user && !isOwner && (
            <div style={{ background: "#141414", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem", border: "1px dashed #333" }}>
              <p style={{ color: "#666", fontSize: "0.85rem", textAlign: "center" }}>
                🔨 Bidding coming in Week 3 (Socket.IO)
              </p>
              <p style={{ color: "#444", fontSize: "0.75rem", textAlign: "center", marginTop: "0.5rem" }}>
                Min next bid: ${(auction.currentPrice + auction.bidIncrement).toLocaleString()}
              </p>
            </div>
          )}

          {!user && (
            <Link to="/login" style={{ display: "block", background: "#e8c547", color: "#0a0a0a", padding: "1rem", borderRadius: "10px", textAlign: "center", textDecoration: "none", fontWeight: 700, marginBottom: "1.5rem" }}>
              Login to Place a Bid
            </Link>
          )}

          {/* Seller info */}
          <div style={{ borderTop: "1px solid #1e1e1e", paddingTop: "1.5rem" }}>
            <p style={{ color: "#666", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>Listed by</p>
            <p style={{ fontWeight: 500 }}>{auction.seller?.name}</p>
            <p style={{ color: "#666", fontSize: "0.85rem" }}>{auction.seller?.email}</p>
          </div>

          {/* Owner actions */}
          {isOwner && (
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
              <Link
                to={`/auctions/${auction._id}/edit`}
                style={{ flex: 1, background: "#1e1e1e", color: "#f0ede6", padding: "0.75rem", borderRadius: "8px", textAlign: "center", textDecoration: "none", fontWeight: 500, fontSize: "0.9rem" }}
              >
                Edit Auction
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{ flex: 1, background: "#e55555", color: "#fff", padding: "0.75rem", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: 500, fontSize: "0.9rem" }}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
