import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import DataTable from "../../components/admin/DataTable";
import { getAdminUsers, updateUserRole, deleteUser } from "../../services/admin.service";

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [role, setRole] = useState("all");
    const [page, setPage] = useState(1);
    const [toast, setToast] = useState("");

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(""), 3000);
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await getAdminUsers({ search, role, page, limit: 10 });
            setUsers(res.data.users);
            setTotal(res.data.total);
        } catch {
            showToast("Failed to load users.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, [search, role, page]);

    const handleRoleChange = async (userId, newRole) => {
        try {
            await updateUserRole(userId, newRole);
            showToast(`Role updated to ${newRole}.`);
            fetchUsers();
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to update role.");
        }
    };

    const handleDelete = async (userId, userName) => {
        if (!window.confirm(`Delete user "${userName}"? This will also delete their auctions and bids.`)) return;
        try {
            await deleteUser(userId);
            showToast("User deleted.");
            fetchUsers();
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to delete user.");
        }
    };

    const columns = [
        { key: "name", label: "Name", render: (u) => <span className="font-medium">{u.name}</span> },
        { key: "email", label: "Email", render: (u) => <span className="text-gray-500">{u.email}</span> },
        {
            key: "role", label: "Role",
            render: (u) => (
                <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u._id, e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
                >
                    <option value="bidder">bidder</option>
                    <option value="consignor">consignor</option>
                    <option value="admin">admin</option>
                </select>
            ),
        },
        {
            key: "createdAt", label: "Joined",
            render: (u) => new Date(u.createdAt).toLocaleDateString(),
        },
        {
            key: "actions", label: "Actions",
            render: (u) => (
                <button
                    onClick={() => handleDelete(u._id, u.name)}
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
                    <h2 className="text-xl font-semibold text-gray-900">Users <span className="text-gray-400 text-base font-normal">({total})</span></h2>
                </div>

                {/* Filters */}
                <div className="flex gap-3 mb-5 flex-wrap">
                    <input
                        type="text"
                        placeholder="Search name or email..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="flex-1 min-w-48 px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    <select
                        value={role}
                        onChange={(e) => { setRole(e.target.value); setPage(1); }}
                        className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                    >
                        <option value="all">All roles</option>
                        <option value="bidder">Bidder</option>
                        <option value="consignor">Consignor</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                {/* Table */}
                <DataTable columns={columns} data={users} loading={loading} emptyMessage="No users found." />

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
