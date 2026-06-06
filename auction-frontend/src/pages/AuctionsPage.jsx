import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import AuctionCard from "../components/auction/AuctionCard";
import AuctionFilters from "../components/auction/AuctionFilters";

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({
    search: "",
    category: "All",
    sort: "createdAt",
    page: 1,
  });

  const fetchAuctions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.category !== "All") params.set("category", filters.category);
      if (filters.sort) params.set("sort", filters.sort);
      params.set("page", filters.page);
      params.set("limit", 12);

      const res = await api.get(`/auctions?${params.toString()}`);
      setAuctions(res.data.auctions);
      setPagination({ page: res.data.page, pages: res.data.pages, total: res.data.total });
    } catch (err) {
      setError("Failed to load auctions.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f0ede6", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Google Font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');`}</style>

      {/* NAV */}
      <nav style={{ borderBottom: "1px solid #1e1e1e", padding: "1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link to="/" style={{ textDecoration: "none", color: "#f0ede6", fontFamily: "'Syne', sans-serif", fontSize: "1.2rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
          AUCTIONEER
        </Link>
        <div style={{ display: "flex", gap: "1rem" }}>
          <Link to="/auctions/create" style={{ background: "#e8c547", color: "#0a0a0a", padding: "0.5rem 1.2rem", borderRadius: "6px", textDecoration: "none", fontWeight: 600, fontSize: "0.85rem" }}>
            + List Item
          </Link>
          <Link to="/dashboard" style={{ color: "#888", textDecoration: "none", padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
            Dashboard
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "2rem" }}>
        {/* Header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>
            Live Auctions
          </h1>
          <p style={{ color: "#666", marginTop: "0.5rem", fontSize: "0.95rem" }}>
            {pagination.total} items available — bid before time runs out
          </p>
        </div>

        <AuctionFilters filters={filters} setFilters={setFilters} />

        {/* Grid */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ background: "#141414", borderRadius: "12px", height: "360px", animation: "pulse 1.5s infinite" }} />
            ))}
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "#e55" }}>{error}</div>
        ) : auctions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "6rem 2rem" }}>
            <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</p>
            <p style={{ color: "#666", fontSize: "1rem" }}>No auctions found. Try different filters.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
            {auctions.map((auction) => (
              <AuctionCard key={auction._id} auction={auction} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "3rem" }}>
            {[...Array(pagination.pages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setFilters((f) => ({ ...f, page: i + 1 }))}
                style={{
                  width: "40px", height: "40px", borderRadius: "8px",
                  background: pagination.page === i + 1 ? "#e8c547" : "#1a1a1a",
                  color: pagination.page === i + 1 ? "#0a0a0a" : "#888",
                  border: "none", cursor: "pointer", fontWeight: 600,
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}
