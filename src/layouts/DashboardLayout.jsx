/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import  { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Container,  } from "react-bootstrap";
import Sidebar from "./SideBar";
import Topbar from "./TopBar";
import { useAuth } from "../context/AuthContext";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar 
        isOpen={sidebarOpen} 
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
      <div className={`main-content ${!sidebarOpen ? "expanded" : ""}`}>
        <Topbar onMenuClick={toggleSidebar} />
        <div className="page-content">
          <Container fluid className="px-4 py-4">
            <Outlet />
          </Container>
        </div>
      </div>

      <style jsx>{`
        .dashboard-layout {
          display: flex;
          min-height: 100vh;
          background: var(--bg-secondary);
        }
        .main-content {
          flex: 1;
          margin-left: 260px;
          transition: all 0.3s ease;
        }
        .main-content.expanded {
          margin-left: 70px;
        }
        .page-content {
          padding-top: 70px;
        }
        @media (max-width: 768px) {
          .main-content {
            margin-left: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;