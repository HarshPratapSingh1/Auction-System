import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import DataTable from "../../components/admin/DataTable";
import { getAdminAuctions, updateAuctionStatus, adminDeleteAuction } from "../../services/admin.service";

const STATUS_COLORS = {
    active: "bg-green-100 text-green-700",
    ended: "bg-gray-100 text-gray-500",
    cancelled: "bg-red-100 text-red-600",
    draft: "bg-yellow-100 text-yellow-700",
};

export default function AdminAuctions() {
    const [auctions, setAuctions] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [page, setPage] = useState(1);
    const [toast, setToast] = useState("");

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(""), 3000);
    };

    const fetchAuctions = async () => {
        setLoading(true);
        try {
            const res = await getAdminAuctions({ search, status, page, limit: 10 });
            setAuctions(res.data.auctions);
            setTotal(res.data.total);
        } catch {
            showToast("Failed to load auctions.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAuctions(); }, [search, status, page]);

    const handleStatusChange = async (auctionId, newStatus) => {
        try {
            await updateAuctionStatus(auctionId, newStatus);
            showToast(`Status updated to ${newStatus}.`);
            fetchAuctions();
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to update status.");
        }
    };

    const handleDelete = async (auctionId, title) => {
        if (!window.confirm(`Delete auction "${title}"? All its bids will also be deleted.`)) return;
        try {
            await adminDeleteAuction(auctionId);
            showToast("Auction deleted.");
            fetchAuctions();
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to delete auction.");
        }
    };

    const columns = [
        {
            key: "title", label: "Title",
            render: (a) => <span className="font-medium text-gray-900 max-w-xs truncate block">{a.title}</span>,
        },
        {
            key: "status", label: "Status",
            render: (a) => (
                <select
                    value={a.status}
                    onChange={(e) => handleStatusChange(a._id, e.target.value)}
                    className={`text-xs border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400 ${STATUS_COLORS[a.status] || ""}`}
                >
                    <option value="active">active</option>
                    <option value="ended">ended</option>
                    <option value="cancelled">cancelled</option>
                    <option value="draft">draft</option>
                </select>
            ),
        },
        {
            key: "currentPrice", label: "Price",
            render: (a) => <span className="font-medium">₹{a.currentPrice?.toLocaleString()}</span>,
        },
        { key: "totalBids", label: "Bids", render: (a) => a.totalBids ?? 0 },
        { key: "seller", label: "Seller", render: (a) => a.seller?.name ?? "—" },
        { key: "winner", label: "Winner", render: (a) => a.winner?.name ?? "—" },
        {
            key: "endTime", label: "Ends",
            render: (a) => new Date(a.endTime).toLocaleDateString(),
        },
        {
            key: "actions", label: "Actions",
            render: (a) => (
                <button
                    onClick={() => handleDelete(a._id, a.title)}
                    className="text-xs px-3 py-1 rounded-lg bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition"
                >
                    Delete
                </button>
            ),
        },
    ];

    const pages = Math.ceil(total / 10);

    return (
        <AdminLayout>
            <div className="max-w-6xl">
                {/* Toast */}
                {toast && (
                    <div className="fixed top-4 right-4 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg z-50">
                        {toast}
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Auctions <span className="text-gray-400 text-base font-normal">({total})</span>
                    </h2>
                </div>

                {/* Filters */}
                <div className="flex gap-3 mb-5 flex-wrap">
                    <input
                        type="text"
                        placeholder="Search by title..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="flex-1 min-w-48 px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    <select
                        value={status}
                        onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                        className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                    >
                        <option value="all">All statuses</option>
                        <option value="active">Active</option>
                        <option value="ended">Ended</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="draft">Draft</option>
                    </select>
                </div>

                {/* Table */}
                <DataTable columns={columns} data={auctions} loading={loading} emptyMessage="No auctions found." />

                {/* Pagination */}
                {pages > 1 && (
                    <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                        <span>Page {page} of {pages}</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition"
                            >
                                ← Prev
                            </button>
                            <button
                                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                                disabled={page === pages}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition"
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
