/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Table,
  Badge,
  Spinner,
  Button,
  Alert,
  Dropdown,
} from "react-bootstrap";
import {
  FiUsers,
  FiUserCheck,
  FiPackage,
  FiFileText,
  FiCalendar,
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiRefreshCw,
  FiEye,
  FiArrowRight,
  FiDownload,
} from "react-icons/fi";
import {
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { dashboardApi } from "../../api/dashboardApi";
import { supplierApi } from "../../api/supplierApi";
import PageHeader from "../../components/PageHeader";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState("month");
  const [chartData, setChartData] = useState([]);
  const [recentSuppliers, setRecentSuppliers] = useState([]);
  const [pendingKYCCount, setPendingKYCCount] = useState(0);

  useEffect(() => {
    fetchDashboardData();
    fetchRecentSuppliers();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardApi.getAdminDashboard();
      if (response.success) {
        setData(response.data);
        setPendingKYCCount(response.data?.kyc?.pending?.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      const response = await dashboardApi.getCharts(chartPeriod);
      if (response.success && response.data) {
        // Ensure response.data is an array
        const dataArray = Array.isArray(response.data) ? response.data : [];
        setChartData(dataArray); 
      } else {
        setChartData([
          { date: "Week 1", revenue: 0, users: 0 },
          { date: "Week 2", revenue: 0, users: 0 },
          { date: "Week 3", revenue: 0, users: 0 },
          { date: "Week 4", revenue: 0, users: 0 },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch chart data:", error);
    }
  };

  const fetchRecentSuppliers = async () => {
    try {
      const response = await supplierApi.getAllSuppliers({ limit: 5 });
      if (response.success) {
        setRecentSuppliers(response.suppliers);
      }
    } catch (error) {
      console.error("Failed to fetch recent suppliers:", error);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, [chartPeriod]);

  const statCards = [
    {
      title: "Total Users",
      value: data?.users?.total || 0,
      icon: FiUsers,
      color: "primary",
      trend: "+12%",
      trendUp: true,
      link: "/admin/users",
      detail: `${data?.users?.newThisMonth || 0} new this month`,
    },
    {
      title: "Suppliers",
      value: data?.users?.suppliers || 0,
      icon: FiUserCheck,
      color: "success",
      trend: "+5%",
      trendUp: true,
      link: "/admin/suppliers",
      detail: `${data?.kyc?.pending?.suppliers || 0} pending KYC`,
    },
    {
      title: "Buyers",
      value: data?.users?.buyers || 0,
      icon: FiUsers,
      color: "info",
      trend: "+8%",
      trendUp: true,
      link: "/admin/buyers",
      detail: `${data?.kyc?.pending?.buyers || 0} pending verification`,
    },
    {
      title: "Available Inventory",
      value: data?.inventory?.available || 0,
      icon: FiPackage,
      color: "warning",
      trend: "-2%",
      trendUp: false,
      link: "/admin/inventory",
      detail: `${data?.inventory?.total || 0} total items`,
    },
    {
      title: "Pending RFQs",
      value: data?.rfqs?.pending || 0,
      icon: FiFileText,
      color: "danger",
      trend: "+3",
      trendUp: true,
      link: "/admin/rfqs",
      detail: `${data?.rfqs?.quoted || 0} quoted`,
    },
    {
      title: "Completed Deals",
      value: data?.rfqs?.accepted || 0,
      icon: FiDollarSign,
      color: "success",
      trend: "+15%",
      trendUp: true,
      link: "/admin/deals",
      detail: `$${((data?.financial?.totalTransactionValue || 0) / 1000000).toFixed(2)}M value`,
    },
    {
      title: "Upcoming Appointments",
      value: data?.appointments?.upcoming || 0,
      icon: FiCalendar,
      color: "info",
      link: "/admin/appointments",
      detail: `${data?.appointments?.completed || 0} completed`,
    },
    {
      title: "Total Transaction Value",
      value: `$${((data?.financial?.totalTransactionValue || 0) / 1000000).toFixed(2)}M`,
      icon: FiDollarSign,
      color: "success",
      trend: "+23%",
      trendUp: true,
      link: "/admin/reports",
      detail: `${data?.rfqs?.accepted || 0} total deals`,
    },
  ];

  const pieData = [
    { name: "Suppliers", value: data?.users?.suppliers || 0, color: "#f4a261" },
    { name: "Buyers", value: data?.users?.buyers || 0, color: "#2a9d8f" },
    { name: "Staff", value: data?.users?.staff || 0, color: "#e76f51" },
  ];

  const recentActivities = [
    {
      user: "John Doe",
      action: "Registered as Supplier",
      time: "2 mins ago",
      type: "user",
    },
    {
      user: "Jane Smith",
      action: "Submitted KYC",
      time: "15 mins ago",
      type: "kyc",
    },
    {
      user: "Mike Johnson",
      action: "Created RFQ",
      time: "1 hour ago",
      type: "rfq",
    },
    {
      user: "Sarah Wilson",
      action: "Approved Inventory",
      time: "2 hours ago",
      type: "inventory",
    },
    {
      user: "ABC Mining",
      action: "Completed Deal",
      time: "3 hours ago",
      type: "deal",
    },
  ];

  const getStatusColor = (status) => {
    const colors = {
      approved: "success",
      pending: "warning",
      rejected: "danger",
      under_review: "info",
      completed: "success",
      cancelled: "danger",
    };
    return colors[status] || "secondary";
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px" }}
      >
        <Spinner animation="border" variant="warning" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        breadcrumbs={[{ label: "Dashboard" }]}
        actions={
          <div className="d-flex gap-2">
            <Dropdown>
              <Dropdown.Toggle variant="outline-secondary" size="sm">
                <FiDownload className="me-1" /> Export
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item>Export as CSV</Dropdown.Item>
                <Dropdown.Item>Export as PDF</Dropdown.Item>
                <Dropdown.Item>Export as Excel</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={fetchDashboardData}
            >
              <FiRefreshCw className="me-1" /> Refresh
            </Button>
          </div>
        }
      />

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        {statCards.map((stat, index) => (
          <Col xl={3} lg={4} md={6} key={index}>
            <Card
              className="stat-card h-100 border-0 shadow-sm"
              onClick={() => stat.link && navigate(stat.link)}
              style={{ cursor: stat.link ? "pointer" : "default" }}
            >
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="text-muted mb-1 small">{stat.title}</p>
                    <h3 className="fw-bold mb-1">{stat.value}</h3>
                    <small className="text-muted">{stat.detail}</small>
                    {stat.trend && (
                      <small
                        className={`text-${stat.trendUp ? "success" : "danger"} d-flex align-items-center gap-1 mt-1`}
                      >
                        {stat.trendUp ? (
                          <FiTrendingUp size={12} />
                        ) : (
                          <FiTrendingDown size={12} />
                        )}
                        {stat.trend}
                      </small>
                    )}
                  </div>
                  <div className={`stat-icon bg-${stat.color}-light`}>
                    <stat.icon size={24} className={`text-${stat.color}`} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* KYC Alert */}
      {pendingKYCCount > 0 && (
        <Alert variant="warning" className="mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <strong>Pending KYC Reviews!</strong>
              <p className="mb-0 small">
                You have {pendingKYCCount} supplier(s) waiting for KYC
                verification.
              </p>
            </div>
            <Button
              variant="warning"
              size="sm"
              onClick={() => navigate("/admin/kyc-review")}
            >
              Review Now <FiArrowRight className="ms-1" />
            </Button>
          </div>
        </Alert>
      )}

      {/* Charts Row */}
      <Row className="g-4 mb-4">
        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-transparent border-0 d-flex justify-content-between align-items-center pt-4">
              <h5 className="mb-0 fw-bold">Revenue & Growth Overview</h5>
              <div className="btn-group btn-group-sm">
                <Button
                  variant={
                    chartPeriod === "week" ? "warning" : "outline-secondary"
                  }
                  size="sm"
                  onClick={() => setChartPeriod("week")}
                >
                  Week
                </Button>
                <Button
                  variant={
                    chartPeriod === "month" ? "warning" : "outline-secondary"
                  }
                  size="sm"
                  onClick={() => setChartPeriod("month")}
                >
                  Month
                </Button>
                <Button
                  variant={
                    chartPeriod === "year" ? "warning" : "outline-secondary"
                  }
                  size="sm"
                  onClick={() => setChartPeriod("year")}
                >
                  Year
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stackId="1"
                    stroke="#f4a261"
                    fill="#f4a261"
                    fillOpacity={0.3}
                    name="Revenue ($)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="users"
                    stroke="#2a9d8f"
                    name="New Users"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-transparent border-0 pt-4">
              <h5 className="mb-0 fw-bold">User Distribution</h5>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3">
                {pieData.map((item, index) => (
                  <div
                    key={index}
                    className="d-flex justify-content-between align-items-center mb-2"
                  >
                    <div className="d-flex align-items-center gap-2">
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          background: item.color,
                          borderRadius: "50%",
                        }}
                      />
                      <span>{item.name}</span>
                    </div>
                    <span className="fw-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity & Pending KYC */}
      <Row className="g-4">
        <Col lg={6}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-transparent border-0 pt-4 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">Recent Activities</h5>
              <Button
                variant="link"
                size="sm"
                className="text-decoration-none"
                onClick={() => navigate("/admin/activities")}
              >
                View All <FiArrowRight className="ms-1" />
              </Button>
            </Card.Header>
            <Card.Body>
              <div className="activity-timeline">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div
                      className={`activity-dot bg-${getStatusColor(activity.type)}`}
                    ></div>
                    <div className="activity-content">
                      <div className="d-flex justify-content-between">
                        <strong>{activity.user}</strong>
                        <small className="text-muted">{activity.time}</small>
                      </div>
                      <p className="mb-0 text-muted small">{activity.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-transparent border-0 pt-4 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">Recent Supplier Registrations</h5>
              <Button
                variant="link"
                size="sm"
                className="text-decoration-none"
                onClick={() => navigate("/admin/suppliers")}
              >
                View All <FiArrowRight className="ms-1" />
              </Button>
            </Card.Header>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Supplier</th>
                    <th>Company</th>
                    <th>KYC Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSuppliers.map((supplier) => (
                    <tr key={supplier._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="supplier-avatar me-2">
                            {supplier.fullName?.charAt(0)}
                          </div>
                          <div>
                            <div className="fw-bold small">
                              {supplier.fullName}
                            </div>
                            <small className="text-muted">
                              {supplier.email}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>{supplier.profile?.companyName || "-"}</td>
                      <td>
                        <Badge
                          bg={getStatusColor(supplier.kyc?.verificationStatus)}
                        >
                          {supplier.kyc?.verificationStatus || "Pending"}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() =>
                            navigate(`/admin/suppliers/${supplier._id}`)
                          }
                        >
                          <FiEye size={14} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {recentSuppliers.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center text-muted">
                        No recent suppliers
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Stats Row */}
      <Row className="g-4 mt-2">
        <Col md={4}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body>
              <h6 className="text-muted mb-2">Platform Growth</h6>
              <h2 className="fw-bold text-success mb-0">
                +{data?.users?.growth || 0}%
              </h2>
              <small className="text-muted">vs last month</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body>
              <h6 className="text-muted mb-2">Deal Success Rate</h6>
              <h2 className="fw-bold text-info mb-0">
                {data?.rfqs?.conversionRate || 0}%
              </h2>
              <small className="text-muted">RFQ to Deal conversion</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body>
              <h6 className="text-muted mb-2">Active Users</h6>
              <h2 className="fw-bold text-primary mb-0">
                {data?.users?.active || 0}
              </h2>
              <small className="text-muted">online in last 24h</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <style jsx>{`
        .stat-card {
          transition: all 0.3s ease;
        }
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1) !important;
        }
        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        .stat-card:hover .stat-icon {
          transform: scale(1.1);
        }
        .bg-primary-light {
          background: rgba(244, 162, 97, 0.1);
        }
        .bg-success-light {
          background: rgba(46, 204, 113, 0.1);
        }
        .bg-info-light {
          background: rgba(52, 152, 219, 0.1);
        }
        .bg-warning-light {
          background: rgba(241, 196, 15, 0.1);
        }
        .bg-danger-light {
          background: rgba(231, 76, 60, 0.1);
        }
        .activity-timeline {
          position: relative;
          padding-left: 20px;
        }
        .activity-item {
          position: relative;
          padding-bottom: 20px;
        }
        .activity-item:last-child {
          padding-bottom: 0;
        }
        .activity-dot {
          position: absolute;
          left: -20px;
          top: 5px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        .activity-item::before {
          content: "";
          position: absolute;
          left: -16px;
          top: 15px;
          width: 2px;
          height: calc(100% - 10px);
          background: var(--border-color);
        }
        .activity-item:last-child::before {
          display: none;
        }
        .supplier-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f4a261, #e76f51);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
