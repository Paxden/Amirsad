import  { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Container,  } from "react-bootstrap";

const AdminLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: "📊", role: ["admin"] },
    { path: "/users", label: "Users", icon: "👥", role: ["admin", "staff"] },
    { path: "/inventory", label: "Inventory", icon: "📦", role: ["admin", "staff"] },
    { path: "/rfqs", label: "RFQs", icon: "📝", role: ["admin", "staff"] },
    { path: "/kyc-review", label: "KYC Review", icon: "✅", role: ["admin", "staff"] },
    { path: "/appointments", label: "Appointments", icon: "📅", role: ["admin", "staff"] },
    { path: "/reports", label: "Reports", icon: "📈", role: ["admin"] },
    { path: "/settings", label: "Settings", icon: "⚙️", role: ["admin"] },
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

export default AdminLayout;