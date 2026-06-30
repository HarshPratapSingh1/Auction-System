import { useContext, useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import NotificationBell from "../common/NotificationBell";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const roleColor = user?.role === "consignor" ? "#a78bfa" : "#e8c547";
  const roleBg = user?.role === "consignor" ? "#a78bfa22" : "#e8c54722";
  const roleLabel = user?.role === "consignor" ? "🏛️ Consignor" : "🏷️ Bidder";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');
        .nav-link { color: #666; text-decoration: none; font-size: 0.85rem; padding: 0.4rem 0.75rem; border-radius: 6px; transition: color 0.15s; }
        .nav-link:hover { color: #f0ede6; }
        .nav-link.active { color: #f0ede6; }
        .dropdown-item { display: block; padding: 0.6rem 1rem; color: #aaa; text-decoration: none; font-size: 0.85rem; border-radius: 6px; transition: background 0.15s, color 0.15s; cursor: pointer; background: transparent; border: none; width: 100%; text-align: left; font-family: 'DM Sans', sans-serif; }
        .dropdown-item:hover { background: #1e1e1e; color: #f0ede6; }
        .avatar-btn { width: 36px; height: 36px; border-radius: 50%; background: #1e1e1e; border: 2px solid #2a2a2a; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem; color: #f0ede6; transition: border-color 0.15s; font-family: 'DM Sans', sans-serif; }
        .avatar-btn:hover { border-color: #e8c547; }
      `}</style>
      <nav style={{ borderBottom: "1px solid #1e1e1e", padding: "0.85rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0a0a0a", position: "sticky", top: 0, zIndex: 100 }}>
        {/* Logo */}
        <Link to="/auctions" style={{ textDecoration: "none", fontFamily: "'Syne', sans-serif", fontSize: "1.2rem", fontWeight: 800, color: "#f0ede6", letterSpacing: "-0.02em" }}>
          AUCTIONEER
        </Link>

        {/* Center nav — role based */}
        <div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
          <Link to="/auctions" className="nav-link">Browse</Link>

          {/* Bidder nav */}
          {user?.role === "bidder" && (
            <>
              <Link to="/bidder/dashboard" className="nav-link">My Bids</Link>
              <Link to="/bidder/wins" className="nav-link">Won Items</Link>
            </>
          )}

          {/* Consignor nav */}
          {user?.role === "consignor" && (
            <>
              <Link to="/consignor/dashboard" className="nav-link">My Listings</Link>
              <Link to="/auctions/create" style={{ background: "#e8c547", color: "#0a0a0a", padding: "0.4rem 0.9rem", borderRadius: "6px", textDecoration: "none", fontWeight: 600, fontSize: "0.8rem", marginLeft: "0.25rem" }}>
                + List Item
              </Link>
            </>
          )}

          {/* Guest */}
          {!user && (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" style={{ background: "#e8c547", color: "#0a0a0a", padding: "0.4rem 0.9rem", borderRadius: "6px", textDecoration: "none", fontWeight: 600, fontSize: "0.8rem" }}>
                Register
              </Link>
            </>
          )}
        </div>

        {/* Right: Avatar dropdown */}
        {user && (
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <NotificationBell notifications={[]} />
            <div style={{ position: "relative" }} ref={dropdownRef}>
              <button className="avatar-btn" onClick={() => setOpen((o) => !o)} style={{ borderColor: open ? "#e8c547" : "#2a2a2a" }}>
              {initials}
            </button>

            {open && (
              <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", background: "#111", border: "1px solid #1e1e1e", borderRadius: "12px", padding: "0.5rem", minWidth: "200px", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
                {/* User info */}
                <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #1e1e1e", marginBottom: "0.25rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#1e1e1e", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.75rem", color: "#f0ede6", flexShrink: 0 }}>
                      {initials}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: "0.85rem", color: "#f0ede6" }}>{user.name}</p>
                      <p style={{ margin: 0, fontSize: "0.72rem", color: "#555" }}>{user.email}</p>
                    </div>
                  </div>
                  <span style={{ background: roleBg, color: roleColor, padding: "0.15rem 0.6rem", borderRadius: "100px", fontSize: "0.7rem", fontWeight: 600 }}>
                    {roleLabel}
                  </span>
                </div>

                {/* Links */}
                {user.role === "bidder" && (
                  <>
                    <Link to="/bidder/dashboard" className="dropdown-item" onClick={() => setOpen(false)}>📊 My Dashboard</Link>
                    <Link to="/bidder/wins" className="dropdown-item" onClick={() => setOpen(false)}>🏆 Won Auctions</Link>
                    <Link to="/bidder/profile" className="dropdown-item" onClick={() => setOpen(false)}>👤 Profile</Link>
                  </>
                )}
                {user.role === "consignor" && (
                  <>
                    <Link to="/consignor/dashboard" className="dropdown-item" onClick={() => setOpen(false)}>📊 My Dashboard</Link>
                    <Link to="/consignor/listings" className="dropdown-item" onClick={() => setOpen(false)}>📦 My Listings</Link>
                    <Link to="/consignor/payouts" className="dropdown-item" onClick={() => setOpen(false)}>💰 Payouts</Link>
                    <Link to="/consignor/profile" className="dropdown-item" onClick={() => setOpen(false)}>👤 Profile</Link>
                  </>
                )}

                <div style={{ borderTop: "1px solid #1e1e1e", marginTop: "0.25rem", paddingTop: "0.25rem" }}>
                  <button className="dropdown-item" onClick={handleLogout} style={{ color: "#e55555" }}>
                    ↩ Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
    </>
  );
}
