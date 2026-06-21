import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import BidderDashboard from "./pages/bidder/BidderDashboard";
import BidderProfile from "./pages/bidder/BidderProfile";
import ConsignorDashboard from "./pages/consignor/ConsignorDashboard";
import ConsignorProfile from "./pages/consignor/ConsignorProfile";
import AuctionsPage from "./pages/AuctionsPage";
import AuctionDetailPage from "./pages/AuctionDetailPage";
import CreateAuctionPage from "./pages/CreateAuctionPage";
import EditAuctionPage from "./pages/EditAuctionPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAuctions from "./pages/admin/AdminAuctions";

function getDashboardPath(role) {
  if (role === "admin") return "/admin";
  if (role === "consignor") return "/consignor/dashboard";
  return "/bidder/dashboard";
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-gray-400">Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to={getDashboardPath(user.role)} replace />;
}

function RoleRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={getDashboardPath(user.role)} replace />;
  return children;
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-gray-400">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={getDashboardPath(user.role)} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

      <Route path="/auctions" element={<ProtectedRoute><AuctionsPage /></ProtectedRoute>} />
      <Route path="/auctions/:id" element={<ProtectedRoute><AuctionDetailPage /></ProtectedRoute>} />

      <Route path="/bidder/dashboard" element={<RoleRoute role="bidder"><BidderDashboard /></RoleRoute>} />
      <Route path="/bidder/profile" element={<RoleRoute role="bidder"><BidderProfile /></RoleRoute>} />

      <Route path="/consignor/dashboard" element={<RoleRoute role="consignor"><ConsignorDashboard /></RoleRoute>} />
      <Route path="/consignor/profile" element={<RoleRoute role="consignor"><ConsignorProfile /></RoleRoute>} />
      <Route path="/auctions/create" element={<RoleRoute role="consignor"><CreateAuctionPage /></RoleRoute>} />
      <Route path="/auctions/:id/edit" element={<RoleRoute role="consignor"><EditAuctionPage /></RoleRoute>} />

      <Route path="/admin" element={<RoleRoute role="admin"><AdminDashboard /></RoleRoute>} />
      <Route path="/admin/users" element={<RoleRoute role="admin"><AdminUsers /></RoleRoute>} />
      <Route path="/admin/auctions" element={<RoleRoute role="admin"><AdminAuctions /></RoleRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}