/* eslint-disable no-unused-vars */
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Loader from "./components/Loader";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import ResendVerification from "./pages/auth/ResendVerification";

// Layouts
import DashboardLayout from "./layouts/DashboardLayout";

// Admin Pages
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import Users from "./pages/admin/Users";
import AdminInventory from "./pages/admin/Inventory";
import AdminRFQs from "./pages/admin/AdminRFQs";
import KYCReview from "./pages/admin/KYCReview";
import AdminAppointments from "./pages/admin/Appointments";
import AdminDeals from "./pages/admin/Deals";
import AdminReports from "./pages/admin/Reports";
import AdminSettings from "./pages/admin/Settings";
import AdminOpportunities from "./pages/admin/Opportunity";

// Staff Pages
import StaffDashboard from "./pages/dashboard/StaffDashboard";
import StaffRFQReview from "./pages/staff/RFQReview";
import StaffInventory from "./pages/staff/Inventory";

// Supplier Pages
import SupplierDashboard from "./pages/dashboard/SupplierDashboard";
import SupplierOpportunities from "./pages/supplier/Opportunities";
import SupplierInventory from "./pages/supplier/Inventory";
import SupplierRFQsReceived from "./pages/supplier/RFQsReceived";
import SupplierAppointments from "./pages/supplier/Appointments";
import SupplierDeals from "./pages/supplier/Deals";
import SupplierKYCStatus from "./pages/supplier/KYCStatus";
import SupplierProfile from "./pages/supplier/Profile";

// Buyer Pages
import BuyerDashboard from "./pages/dashboard/BuyerDashboard";
import BuyerInventory from "./pages/buyer/Inventory";
import BuyerMyRFQs from "./pages/buyer/MyRFQs";
import BuyerAppointments from "./pages/buyer/Appointments";
import BuyerMyDeals from "./pages/buyer/MyDeals";
import BuyerWishlist from "./pages/buyer/Wishlist";
import BuyerProfile from "./pages/buyer/Profile";

const AppRoutes = () => {
  const { user, loading, isAuthenticated } = useAuth();

  // Show loader while checking authentication
  if (loading) {
    return <Loader fullScreen />;
  }

  // If not authenticated, show public routes
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/resend-verification" element={<ResendVerification />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // If authenticated, show role-specific routes
  const role = user?.role;
  const basePath = `/${role}`;

  // Admin Routes
  if (role === "admin") {
    return (
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route
            path="/"
            element={<Navigate to="/admin/dashboard" replace />}
          />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<Users />} />
          <Route path="/admin/opportunities" element={<AdminOpportunities />} />

          <Route path="/admin/inventory" element={<AdminInventory />} />
          <Route path="/admin/rfqs" element={<AdminRFQs />} />
          <Route path="/admin/kyc-review" element={<KYCReview />} />
          <Route path="/admin/appointments" element={<AdminAppointments />} />
          <Route path="/admin/deals" element={<AdminDeals />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/settings" element={<AdminSettings />} />

          <Route
            path="*"
            element={<Navigate to="/admin/dashboard" replace />}
          />
        </Route>
      </Routes>
    );
  }

  // Staff Routes
  if (role === "staff") {
    return (
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route
            path="/"
            element={<Navigate to="/staff/dashboard" replace />}
          />
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
          <Route path="/staff/kyc-review" element={<KYCReview />} />
          <Route path="/staff/deals" element={<AdminDeals />} />
          <Route path="/staff/appointments" element={<AdminAppointments />} />
          <Route path="/staff/rfq-review" element={<StaffRFQReview />} />
          <Route path="/staff/inventory" element={<StaffInventory />} />

          <Route
            path="*"
            element={<Navigate to="/staff/dashboard" replace />}
          />
        </Route>
      </Routes>
    );
  }

  // Supplier Routes
  if (role === "supplier") {
    return (
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route
            path="/"
            element={<Navigate to="/supplier/dashboard" replace />}
          />
          <Route path="/supplier/dashboard" element={<SupplierDashboard />} />
          <Route
            path="/supplier/opportunities"
            element={<SupplierOpportunities />}
          />
          <Route path="/supplier/inventory" element={<SupplierInventory />} />
          <Route path="/supplier/rfqs" element={<SupplierRFQsReceived />} />

          <Route
            path="/supplier/appointments"
            element={<SupplierAppointments />}
          />
          <Route path="/supplier/deals" element={<SupplierDeals />} />
          <Route path="/supplier/kyc" element={<SupplierKYCStatus />} />
          <Route path="/supplier/profile" element={<SupplierProfile />} />
          <Route path="/buyer/wishlist" element={<BuyerWishlist />} />

          <Route
            path="*"
            element={<Navigate to="/supplier/dashboard" replace />}
          />
        </Route>
      </Routes>
    );
  }

  // Buyer Routes
  if (role === "buyer") {
    return (
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route
            path="/"
            element={<Navigate to="/buyer/dashboard" replace />}
          />
          <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
          <Route path="/buyer/inventory" element={<BuyerInventory />} />
          <Route path="/buyer/rfqs" element={<BuyerMyRFQs />} />
          <Route path="/buyer/appointments" element={<BuyerAppointments />} />
          <Route path="/buyer/deals" element={<BuyerMyDeals />} />
          <Route path="/buyer/profile" element={<BuyerProfile />} />

          <Route
            path="*"
            element={<Navigate to="/buyer/dashboard" replace />}
          />
        </Route>
      </Routes>
    );
  }

  // Fallback
  return (
    <Routes>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
