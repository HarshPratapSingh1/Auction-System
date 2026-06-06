import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api";

const CATEGORIES = ["Electronics", "Fashion", "Art", "Collectibles", "Vehicles", "Real Estate", "Other"];

export default function EditAuctionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/auctions/${id}`);
        const a = res.data.auction;
        setForm({
          title: a.title,
          description: a.description,
          category: a.category,
          startingPrice: a.startingPrice,
          reservePrice: a.reservePrice || 0,
          bidIncrement: a.bidIncrement || 1,
          endTime: new Date(a.endTime).toISOString().slice(0, 16),
          images: a.images || [],
        });
      } catch {
        setError("Auction not found or you are not authorized.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.put(`/auctions/${id}`, {
        ...form,
        startingPrice: Number(form.startingPrice),
        reservePrice: Number(form.reservePrice),
        bidIncrement: Number(form.bidIncrement),
      });
      navigate(`/auctions/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update.");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = { width: "100%", background: "#141414", border: "1px solid #2a2a2a", borderRadius: "8px", padding: "0.75rem 1rem", color: "#f0ede6", fontSize: "0.9rem", outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif" };
  const labelStyle = { display: "block", color: "#888", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" };

  if (loading) return <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", color: "#666" }}>Loading...</div>;
  if (error && !form) return <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", color: "#e55" }}>{error}</div>;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f0ede6", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap'); input:focus,select:focus,textarea:focus { border-color: #e8c547 !important; }`}</style>
      <nav style={{ borderBottom: "1px solid #1e1e1e", padding: "1rem 2rem", display: "flex", justifyContent: "space-between" }}>
        <Link to={`/auctions/${id}`} style={{ textDecoration: "none", color: "#666", fontSize: "0.85rem" }}>← Back to Auction</Link>
        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.2rem" }}>AUCTIONEER</span>
        <div style={{ width: "120px" }} />
      </nav>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "3rem 2rem" }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "2rem", fontWeight: 800, marginBottom: "2rem" }}>Edit Auction</h1>

        {error && <div style={{ background: "#e5555522", border: "1px solid #e55555", borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "1.5rem", color: "#e55555" }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Title *</label>
            <input name="title" value={form.title} onChange={handleChange} style={inputStyle} />
          </div>
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Description *</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={5} style={{ ...inputStyle, resize: "vertical" }} />
          </div>
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Category</label>
            <select name="category" value={form.category} onChange={handleChange} style={{ ...inputStyle, appearance: "none" }}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
            <div>
              <label style={labelStyle}>Starting Price</label>
              <input type="number" name="startingPrice" value={form.startingPrice} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Reserve Price</label>
              <input type="number" name="reservePrice" value={form.reservePrice} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Bid Increment</label>
              <input type="number" name="bidIncrement" value={form.bidIncrement} onChange={handleChange} style={inputStyle} />
            </div>
          </div>
          <div style={{ marginBottom: "2rem" }}>
            <label style={labelStyle}>End Time</label>
            <input type="datetime-local" name="endTime" value={form.endTime} onChange={handleChange} style={inputStyle} />
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button type="submit" disabled={saving} style={{ flex: 1, background: "#e8c547", color: "#0a0a0a", border: "none", borderRadius: "10px", padding: "1rem", fontSize: "1rem", fontWeight: 700, cursor: "pointer" }}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <Link to={`/auctions/${id}`} style={{ flex: 1, background: "#1e1e1e", color: "#f0ede6", borderRadius: "10px", padding: "1rem", textAlign: "center", textDecoration: "none", fontWeight: 500 }}>
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
