import api from "./api";

// Stats
export const getAdminStats = () => api.get("/admin/stats");

// Users
export const getAdminUsers = (params) => api.get("/admin/users", { params });
export const getUserById = (id) => api.get(`/admin/users/${id}`);
export const updateUserRole = (id, role) => api.put(`/admin/users/${id}/role`, { role });
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);

// Auctions
export const getAdminAuctions = (params) => api.get("/admin/auctions", { params });
export const updateAuctionStatus = (id, status) => api.put(`/admin/auctions/${id}/status`, { status });
export const adminDeleteAuction = (id) => api.delete(`/admin/auctions/${id}`);
