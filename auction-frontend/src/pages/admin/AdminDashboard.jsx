import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import StatCard from "../../components/admin/StatCard";
import DataTable from "../../components/admin/DataTable";
import { getAdminStats } from "../../services/admin.service";

export default function AdminDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await getAdminStats();
                setData(res.data);
            } catch {
                setError("Failed to load dashboard stats.");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const userColumns = [
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        {
            key: "role", label: "Role",
            render: (u) => (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.role === "admin" ? "bg-red-100 text-red-600"
                        : u.role === "consignor" ? "bg-purple-100 text-purple-600"
                            : "bg-green-100 text-green-600"
                    }`}>
                    {u.role}
                </span>
            ),
        },
        {
            key: "createdAt", label: "Joined",
            render: (u) => new Date(u.createdAt).toLocaleDateString(),
        },
    ];

    const auctionColumns = [
        { key: "title", label: "Title", render: (a) => <span className="font-medium">{a.title}</span> },
        {
            key: "status", label: "Status",
            render: (a) => (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${a.status === "active" ? "bg-green-100 text-green-600"
                        : a.status === "ended" ? "bg-gray-100 text-gray-500"
                            : "bg-yellow-100 text-yellow-600"
                    }`}>
                    {a.status}
                </span>
            ),
        },
        { key: "currentPrice", label: "Price", render: (a) => `₹${a.currentPrice?.toLocaleString()}` },
        { key: "totalBids", label: "Bids", render: (a) => a.totalBids ?? 0 },
        { key: "seller", label: "Seller", render: (a) => a.seller?.name ?? "—" },
    ];

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout>
                <div className="text-red-500 text-sm">{error}</div>
            </AdminLayout>
        );
    }

    const { stats, recentUsers, recentAuctions } = data;

    return (
        <AdminLayout>
            <div className="max-w-6xl">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Dashboard Overview</h2>

                {/* Stats grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard label="Total Users" value={stats.totalUsers} color="indigo" />
                    <StatCard label="Bidders" value={stats.totalBidders} color="green" />
                    <StatCard label="Consignors" value={stats.totalConsignors} color="purple" />
                    <StatCard label="Total Auctions" value={stats.totalAuctions} color="blue" />
                    <StatCard label="Active Auctions" value={stats.activeAuctions} color="yellow" />
                    <StatCard label="Ended Auctions" value={stats.endedAuctions} color="red" />
                    <StatCard label="Total Bids" value={stats.totalBids} color="indigo" />
                    <StatCard
                        label="Platform Revenue"
                        value={`₹${stats.totalRevenue?.toLocaleString()}`}
                        color="green"
                    />
                </div>

                {/* Recent Users */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-700">Recent Users</h3>
                        <a href="/admin/users" className="text-xs text-indigo-600 hover:underline">View all →</a>
                    </div>
                    <DataTable columns={userColumns} data={recentUsers} emptyMessage="No users yet." />
                </div>

                {/* Recent Auctions */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-700">Recent Auctions</h3>
                        <a href="/admin/auctions" className="text-xs text-indigo-600 hover:underline">View all →</a>
                    </div>
                    <DataTable columns={auctionColumns} data={recentAuctions} emptyMessage="No auctions yet." />
                </div>
            </div>
        </AdminLayout>
    );
}
