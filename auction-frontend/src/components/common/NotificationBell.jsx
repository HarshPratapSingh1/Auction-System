import { useState } from "react";

// This component shows recent email notification activity
// In a future week this can be backed by a real notifications collection
export default function NotificationBell({ notifications = [] }) {
  const [open, setOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ position: "relative", background: "transparent", border: "1px solid #2a2a2a", borderRadius: "8px", width: "36px", height: "36px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#666", fontSize: "1rem", transition: "border-color 0.15s" }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = "#444"}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = "#2a2a2a"}
      >
        🔔
        {unread > 0 && (
          <span style={{ position: "absolute", top: "-4px", right: "-4px", background: "#e55555", color: "#fff", borderRadius: "50%", width: "16px", height: "16px", fontSize: "0.6rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", background: "#111", border: "1px solid #1e1e1e", borderRadius: "12px", padding: "0.5rem", minWidth: "280px", boxShadow: "0 8px 32px rgba(0,0,0,0.5)", zIndex: 200 }}>
          <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #1e1e1e" }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: "0.85rem", color: "#f0ede6" }}>Notifications</p>
          </div>

          {notifications.length === 0 ? (
            <div style={{ padding: "2rem 1rem", textAlign: "center" }}>
              <p style={{ color: "#444", fontSize: "0.8rem", margin: 0 }}>No notifications yet.</p>
              <p style={{ color: "#333", fontSize: "0.75rem", margin: "0.5rem 0 0" }}>We'll email you when you're outbid or when auctions end.</p>
            </div>
          ) : (
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
              {notifications.map((n, i) => (
                <div key={i} style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #1a1a1a", background: n.read ? "transparent" : "#1e1e1e33" }}>
                  <p style={{ margin: "0 0 0.2rem", fontSize: "0.85rem", color: n.read ? "#666" : "#f0ede6", fontWeight: n.read ? 400 : 500 }}>{n.message}</p>
                  <p style={{ margin: 0, fontSize: "0.72rem", color: "#444" }}>{n.time}</p>
                </div>
              ))}
            </div>
          )}

          <div style={{ padding: "0.75rem 1rem", borderTop: "1px solid #1e1e1e" }}>
            <p style={{ margin: 0, fontSize: "0.72rem", color: "#444", textAlign: "center" }}>
              📧 Email notifications are active
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
