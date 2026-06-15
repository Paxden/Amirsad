import  { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Container } from "react-bootstrap";

const SupplierLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/opportunities", label: "Opportunities", icon: "💰" },
    { path: "/inventory", label: "My Inventory", icon: "📦" },
    { path: "/rfqs", label: "RFQs Received", icon: "📝" },
    { path: "/appointments", label: "Appointments", icon: "📅" },
    { path: "/kyc", label: "KYC Status", icon: "✅" },
    { path: "/profile", label: "Profile", icon: "👤" },
  ];

  return (
    <div className="d-flex">
      <Sidebar
        items={menuItems}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      <div className="flex-grow-1">
        <Navbar onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <Container fluid className="p-4">
          <Outlet />
        </Container>
      </div>
    </div>
  );
};

export default SupplierLayout;