import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiHome,
  FiUsers,
  FiPackage,
  FiFileText,
  FiCalendar,
  FiSettings,
  FiUserCheck,
  FiDollarSign,
  FiBarChart2,
  FiBell,
  FiLogOut,
  FiGrid,
  FiShield,
} from "react-icons/fi";

const Sidebar = ({ isOpen, mobileOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItemsByRole = {
    admin: [
      { path: "/admin/dashboard", label: "Dashboard", icon: FiHome },
      { path: "/admin/users", label: "Users", icon: FiUsers },
      { path: "/admin/inventory", label: "Inventory", icon: FiPackage },
      { path: "/admin/rfqs", label: "RFQs", icon: FiFileText },
      { path: "/admin/kyc-review", label: "KYC Review", icon: FiUserCheck },
      { path: "/admin/appointments", label: "Appointments", icon: FiCalendar },
      { path: "/admin/deals", label: "Deals", icon: FiDollarSign },
      { path: "/admin/reports", label: "Reports", icon: FiBarChart2 },
      { path: "/admin/settings", label: "Settings", icon: FiSettings },
    ],
    staff: [
      { path: "/staff/dashboard", label: "Dashboard", icon: FiHome },
      { path: "/staff/kyc-review", label: "KYC Review", icon: FiUserCheck },
      { path: "/staff/rfq-review", label: "RFQ Review", icon: FiFileText },
      { path: "/staff/inventory", label: "Inventory", icon: FiPackage },
      { path: "/staff/appointments", label: "Appointments", icon: FiCalendar },
      { path: "/staff/deals", label: "Deals", icon: FiDollarSign },
    ],
    supplier: [
      { path: "/supplier/dashboard", label: "Dashboard", icon: FiHome },
      { path: "/supplier/opportunities", label: "Opportunities", icon: FiGrid },
      { path: "/supplier/inventory", label: "My Inventory", icon: FiPackage },
      { path: "/supplier/rfqs", label: "RFQs Received", icon: FiFileText },
      {
        path: "/supplier/appointments",
        label: "Appointments",
        icon: FiCalendar,
      },
      { path: "/supplier/deals", label: "My Deals", icon: FiDollarSign },
      { path: "/supplier/kyc", label: "KYC Status", icon: FiShield },
      { path: "/supplier/profile", label: "Profile", icon: FiSettings },
    ],
    buyer: [
      { path: "/buyer/dashboard", label: "Dashboard", icon: FiHome },
      { path: "/buyer/inventory", label: "Buy Gold", icon: FiPackage },
      { path: "/buyer/rfqs", label: "My RFQs", icon: FiFileText },
      { path: "/buyer/appointments", label: "Appointments", icon: FiCalendar },
      { path: "/buyer/deals", label: "My Deals", icon: FiDollarSign },
      { path: "/buyer/wishlist", label: "Saved Items", icon: FiBell },
      { path: "/buyer/profile", label: "Profile", icon: FiSettings },
    ],
  };

  const menuItems = menuItemsByRole[user?.role] || [];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const sidebarClasses = `sidebar ${!isOpen ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`;

  return (
    <>
      {mobileOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={sidebarClasses}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">AG</div>
            {isOpen && <div className="logo-text">AMIRSAD Gold</div>}
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
              end
            >
              <item.icon size={20} />
              {isOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-link" onClick={handleLogout}>
            <FiLogOut size={20} />
            {isOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <style jsx>{`
        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          height: 100vh;
          width: 260px;
          background: var(--card-bg);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
          z-index: 1000;
        }
        .sidebar.collapsed {
          width: 70px;
        }
        .sidebar-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--border-color);
        }
        .logo-container {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .logo-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #f4a261, #e76f51);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 18px;
          color: white;
        }
        .logo-text {
          font-size: 18px;
          font-weight: bold;
          color: var(--text-primary);
          white-space: nowrap;
        }
        .sidebar-nav {
          flex: 1;
          padding: 1rem 0;
          overflow-y: auto;
        }
        .nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 24px;
          color: var(--text-secondary);
          text-decoration: none;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .nav-link:hover {
          background: var(--bg-secondary);
          color: var(--primary-color);
        }
        .nav-link.active {
          background: var(--primary-color);
          color: white;
          border-right: 3px solid var(--primary-dark);
        }
        .sidebar-footer {
          padding: 1rem 0;
          border-top: 1px solid var(--border-color);
        }
        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999;
        }
        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
          }
          .sidebar.mobile-open {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
