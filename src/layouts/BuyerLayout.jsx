import  { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Container } from "react-bootstrap";

const BuyerLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/inventory", label: "Available Gold", icon: "📦" },
    { path: "/my-rfqs", label: "My RFQs", icon: "📝" },
    { path: "/appointments", label: "Appointments", icon: "📅" },
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

export default BuyerLayout;