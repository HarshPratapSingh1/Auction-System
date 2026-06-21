import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navItems = [
    { to: "/admin", label: "Dashboard", icon: "📊", end: true },
    { to: "/admin/users", label: "Users", icon: "👥" },
    { to: "/admin/auctions", label: "Auctions", icon: "🏷️" },
];

export default function AdminLayout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Sidebar */}
            <aside className="w-56 bg-white border-r border-gray-200 flex flex-col fixed h-full">
                {/* Logo */}
                <div className="px-5 py-5 border-b border-gray-100">
                    <h1 className="text-lg font-semibold text-indigo-600">AuctionHub</h1>
                    <p className="text-xs text-gray-400 mt-0.5">Admin Panel</p>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${isActive
                                    ? "bg-indigo-50 text-indigo-600"
                                    : "text-gray-600 hover:bg-gray-50"
                                }`
                            }
                        >
                            <span>{item.icon}</span>
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* User + Logout */}
                <div className="px-4 py-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 truncate mb-2">{user?.email}</p>
                    <button
                        onClick={handleLogout}
                        className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                    >
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="ml-56 flex-1 p-8">
                {children}
            </main>
        </div>
    );
}
