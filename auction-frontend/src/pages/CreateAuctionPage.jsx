import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

const CATEGORIES = ["Electronics", "Fashion", "Art", "Collectibles", "Vehicles", "Real Estate", "Other"];

export default function CreateAuctionPage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageInput, setImageInput] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Electronics",
    startingPrice: "",
    reservePrice: "",
    bidIncrement: "1",
    endTime: "",
    images: [],
  });

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const addImage = () => {
    const url = imageInput.trim();
    if (!url) return;
    if (!url.startsWith("http")) { setError("Please enter a valid image URL."); return; }
    setForm((f) => ({ ...f, images: [...f.images, url] }));
    setImageInput("");
    setError("");
  };

  const removeImage = (i) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title || !form.description || !form.startingPrice || !form.endTime) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auctions", {
        ...form,
        startingPrice: Number(form.startingPrice),
        reservePrice: Number(form.reservePrice) || 0,
        bidIncrement: Number(form.bidIncrement) || 1,
      });
      navigate(`/auctions/${res.data.auction._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create auction.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", background: "#141414", border: "1px solid #2a2a2a",
    borderRadius: "8px", padding: "0.75rem 1rem", color: "#f0ede6",
    fontSize: "0.9rem", outline: "none", boxSizing: "border-box",
    fontFamily: "'DM Sans', sans-serif",
  };

  const labelStyle = { display: "block", color: "#888", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f0ede6", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap'); input:focus,select:focus,textarea:focus { border-color: #e8c547 !important; } input::placeholder, textarea::placeholder { color: #444; }`}</style>

      <nav style={{ borderBottom: "1px solid #1e1e1e", padding: "1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link to="/auctions" style={{ textDecoration: "none", color: "#666", fontSize: "0.85rem" }}>← Browse Auctions</Link>
        <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.2rem", fontWeight: 800 }}>AUCTIONEER</span>
        <div style={{ width: "120px" }} />
      </nav>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "3rem 2rem" }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "2.2rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>
          List an Item
        </h1>
        <p style={{ color: "#666", marginBottom: "3rem", fontSize: "0.95rem" }}>Fill in the details to create your auction listing.</p>

        {error && (
          <div style={{ background: "#e5555522", border: "1px solid #e55555", borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "1.5rem", color: "#e55555", fontSize: "0.9rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Title *</label>
            <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Vintage Rolex Submariner 1960" style={inputStyle} />
          </div>

          {/* Description */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Description *</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={5} placeholder="Describe the item, its condition, history, and any relevant details..." style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          {/* Category */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Category *</label>
            <select name="category" value={form.category} onChange={handleChange} style={{ ...inputStyle, appearance: "none" }}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Pricing row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
            <div>
              <label style={labelStyle}>Starting Price ($) *</label>
              <input type="number" name="startingPrice" value={form.startingPrice} onChange={handleChange} placeholder="0" min="0" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Reserve Price ($)</label>
              <input type="number" name="reservePrice" value={form.reservePrice} onChange={handleChange} placeholder="0" min="0" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Bid Increment ($)</label>
              <input type="number" name="bidIncrement" value={form.bidIncrement} onChange={handleChange} placeholder="1" min="1" style={inputStyle} />
            </div>
          </div>

          {/* End Time */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Auction End Date & Time *</label>
            <input type="datetime-local" name="endTime" value={form.endTime} onChange={handleChange} style={inputStyle} min={new Date().toISOString().slice(0, 16)} />
          </div>

          {/* Images */}
          <div style={{ marginBottom: "2rem" }}>
            <label style={labelStyle}>Images (optional)</label>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <input value={imageInput} onChange={(e) => setImageInput(e.target.value)} placeholder="Paste image URL here..." style={{ ...inputStyle, flex: 1 }} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImage())} />
              <button type="button" onClick={addImage} style={{ background: "#1e1e1e", color: "#f0ede6", border: "1px solid #2a2a2a", borderRadius: "8px", padding: "0 1rem", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif" }}>
                Add URL
              </button>
            </div>
            {form.images.length > 0 && (
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {form.images.map((img, i) => (
                  <div key={i} style={{ position: "relative", width: "80px", height: "80px" }}>
                    <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }} />
                    <button type="button" onClick={() => removeImage(i)} style={{ position: "absolute", top: "-6px", right: "-6px", background: "#e55555", color: "#fff", border: "none", borderRadius: "50%", width: "20px", height: "20px", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                  </div>
                ))}
              </div>
            )}
            <p style={{ color: "#444", fontSize: "0.75rem", marginTop: "0.5rem" }}>Add external image URLs (e.g. from Imgur or Cloudinary)</p>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading} style={{ width: "100%", background: "#e8c547", color: "#0a0a0a", border: "none", borderRadius: "10px", padding: "1rem", fontSize: "1rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, fontFamily: "'DM Sans', sans-serif" }}>
            {loading ? "Creating Auction..." : "Create Auction →"}
          </button>
        </form>
      </div>
    </div>
  );
}
