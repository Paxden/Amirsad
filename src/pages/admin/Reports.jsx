/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Form,
  Alert,
  Modal,
  Tabs,
  Tab,
} from "react-bootstrap";
import {
  FiDownload,
  FiFileText,
  FiUsers,
  FiPackage,
  FiDollarSign,
  FiTrendingUp,
  FiPieChart,
  FiRefreshCw,
  FiCheckCircle,
  FiClock,
  FiUserCheck,
} from "react-icons/fi";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import PageHeader from "../../components/PageHeader";
import toast from "react-hot-toast";

const AdminReports = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [reportData, setReportData] = useState({
    overview: null,
    deals: null,
    inventory: null,
    users: null,
    rfqs: null,
  });
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState("excel");
  const [exportType, setExportType] = useState("deals");

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      // Fetch overview stats
      const overviewRes = await fetch(
        `${import.meta.env.VITE_API_URL}/dashboard/admin`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const overviewData = await overviewRes.json();

      // Fetch deals stats
      const dealsRes = await fetch(
        `${import.meta.env.VITE_API_URL}/deals/stats`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const dealsData = await dealsRes.json();

      // Fetch inventory stats
      const inventoryRes = await fetch(
        `${import.meta.env.VITE_API_URL}/inventory/stats`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const inventoryData = await inventoryRes.json();

      setReportData({
        overview: overviewData.data,
        deals: dealsData,
        inventory: inventoryData,
      });
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      toast.error("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/reports/${exportType}?format=${exportFormat}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${exportType}-report-${new Date().toISOString().split("T")[0]}.${exportFormat === "excel" ? "xlsx" : exportFormat}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success("Report exported successfully");
        setShowExportModal(false);
      }
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export report");
    }
  };

  // Sample chart data (replace with real API data)
  const monthlyRevenueData = [
    { month: "Jan", revenue: 125000, deals: 12 },
    { month: "Feb", revenue: 150000, deals: 15 },
    { month: "Mar", revenue: 180000, deals: 18 },
    { month: "Apr", revenue: 165000, deals: 16 },
    { month: "May", revenue: 210000, deals: 22 },
    { month: "Jun", revenue: 245000, deals: 25 },
  ];

  const userGrowthData = [
    { month: "Jan", suppliers: 45, buyers: 38 },
    { month: "Feb", suppliers: 52, buyers: 44 },
    { month: "Mar", suppliers: 61, buyers: 52 },
    { month: "Apr", suppliers: 68, buyers: 61 },
    { month: "May", suppliers: 75, buyers: 72 },
    { month: "Jun", suppliers: 82, buyers: 85 },
  ];

  const inventoryDistribution = [
    { name: "Available", value: 45, color: "#10b981" },
    { name: "Reserved", value: 25, color: "#f59e0b" },
    { name: "Sold", value: 20, color: "#6366f1" },
    { name: "Pending", value: 10, color: "#ef4444" },
  ];

  const dealStatusDistribution = [
    { name: "Completed", value: 48, color: "#10b981" },
    { name: "In Progress", value: 32, color: "#f59e0b" },
    { name: "Open", value: 12, color: "#3b82f6" },
    { name: "Cancelled", value: 8, color: "#ef4444" },
  ];

  const statsCards = [
    {
      title: "Total Revenue",
      value: `$${((reportData?.deals?.totalValue || 0) / 1000000).toFixed(2)}M`,
      change: "+23%",
      icon: FiDollarSign,
      color: "success",
    },
    {
      title: "Total Deals",
      value: reportData?.deals?.totalDeals || 0,
      change: "+15%",
      icon: FiFileText,
      color: "primary",
    },
    {
      title: "Active Users",
      value: reportData?.overview?.users?.active || 0,
      change: "+8%",
      icon: FiUsers,
      color: "info",
    },
    {
      title: "Conversion Rate",
      value: `${reportData?.overview?.rfqs?.conversionRate || 0}%`,
      change: "+5%",
      icon: FiTrendingUp,
      color: "warning",
    },
  ];

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
        title="Reports & Analytics"
        breadcrumbs={[{ label: "Admin" }, { label: "Reports" }]}
        actions={
          <div className="d-flex gap-2">
            <Button variant="outline-secondary" onClick={fetchReports}>
              <FiRefreshCw className="me-2" />
              Refresh
            </Button>
            <Button variant="warning" onClick={() => setShowExportModal(true)}>
              <FiDownload className="me-2" />
              Export Report
            </Button>
          </div>
        }
      />

      {/* Date Range Filter */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col md={4}>
              <Form.Label className="fw-semibold">Start Date</Form.Label>
              <Form.Control
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, startDate: e.target.value })
                }
              />
            </Col>
            <Col md={4}>
              <Form.Label className="fw-semibold">End Date</Form.Label>
              <Form.Control
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, endDate: e.target.value })
                }
              />
            </Col>
            <Col md={4}>
              <Button
                variant="primary"
                onClick={fetchReports}
                className="w-100"
              >
                Apply Date Range
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        {statsCards.map((stat, index) => (
          <Col md={6} lg={3} key={index}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="text-muted mb-1 small">{stat.title}</p>
                    <h3 className="fw-bold mb-0">{stat.value}</h3>
                    <small className="text-success d-flex align-items-center gap-1 mt-1">
                      <FiTrendingUp size={12} />
                      {stat.change}
                    </small>
                  </div>
                  <div className={`bg-${stat.color} bg-opacity-10 p-3 rounded`}>
                    <stat.icon size={24} className={`text-${stat.color}`} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab
          eventKey="overview"
          title={
            <span>
              <FiPieChart className="me-2" />
              Overview
            </span>
          }
        />
        <Tab
          eventKey="deals"
          title={
            <span>
              <FiDollarSign className="me-2" />
              Deals
            </span>
          }
        />
        <Tab
          eventKey="inventory"
          title={
            <span>
              <FiPackage className="me-2" />
              Inventory
            </span>
          }
        />
        <Tab
          eventKey="users"
          title={
            <span>
              <FiUsers className="me-2" />
              Users
            </span>
          }
        />
        <Tab
          eventKey="rfqs"
          title={
            <span>
              <FiFileText className="me-2" />
              RFQs
            </span>
          }
        />
      </Tabs>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div>
          {/* Revenue Chart */}
          <Row className="g-4 mb-4">
            <Col lg={8}>
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-transparent border-0 pt-4">
                  <h5 className="mb-0 fw-bold">Revenue & Deal Trends</h5>
                </Card.Header>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={monthlyRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="revenue"
                        stroke="#f4a261"
                        name="Revenue ($)"
                        strokeWidth={2}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="deals"
                        stroke="#2a9d8f"
                        name="Deals"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={4}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-transparent border-0 pt-4">
                  <h5 className="mb-0 fw-bold">Revenue Distribution</h5>
                </Card.Header>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={dealStatusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label
                      >
                        {dealStatusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* User Growth Chart */}
          <Row className="g-4 mb-4">
            <Col lg={12}>
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-transparent border-0 pt-4">
                  <h5 className="mb-0 fw-bold">User Growth</h5>
                </Card.Header>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={userGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="suppliers"
                        stackId="1"
                        stroke="#f4a261"
                        fill="#f4a261"
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        dataKey="buyers"
                        stackId="1"
                        stroke="#2a9d8f"
                        fill="#2a9d8f"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Key Metrics Cards */}
          <Row className="g-4">
            <Col md={6}>
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-transparent border-0 pt-4">
                  <h5 className="mb-0 fw-bold">Platform Metrics</h5>
                </Card.Header>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                    <span>Total Users</span>
                    <span className="fw-bold">
                      {reportData?.overview?.users?.total || 0}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                    <span>Total Suppliers</span>
                    <span className="fw-bold">
                      {reportData?.overview?.users?.suppliers || 0}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                    <span>Total Buyers</span>
                    <span className="fw-bold">
                      {reportData?.overview?.users?.buyers || 0}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                    <span>Active Users</span>
                    <span className="fw-bold">
                      {reportData?.overview?.users?.active || 0}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span>New Users (This Month)</span>
                    <span className="fw-bold text-success">
                      {reportData?.overview?.users?.newThisMonth || 0}
                    </span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-transparent border-0 pt-4">
                  <h5 className="mb-0 fw-bold">KYC Status</h5>
                </Card.Header>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                    <span>
                      <FiCheckCircle className="text-success me-2" />
                      Approved
                    </span>
                    <span className="fw-bold">
                      {reportData?.overview?.kyc?.approved?.total || 0}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                    <span>
                      <FiClock className="text-warning me-2" />
                      Pending
                    </span>
                    <span className="fw-bold">
                      {reportData?.overview?.kyc?.pending?.total || 0}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span>
                      <FiUserCheck className="text-danger me-2" />
                      Rejected
                    </span>
                    <span className="fw-bold">
                      {reportData?.overview?.kyc?.rejected || 0}
                    </span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      )}

      {/* Deals Tab */}
      {activeTab === "deals" && (
        <div>
          <Row className="g-4">
            <Col lg={6}>
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-transparent border-0 pt-4">
                  <h5 className="mb-0 fw-bold">Deal Status Distribution</h5>
                </Card.Header>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={dealStatusDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {dealStatusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={6}>
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-transparent border-0 pt-4">
                  <h5 className="mb-0 fw-bold">Deal Summary</h5>
                </Card.Header>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                    <span>Total Deals</span>
                    <span className="fw-bold">
                      {reportData?.deals?.totalDeals || 0}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                    <span>Completed Deals</span>
                    <span className="fw-bold text-success">
                      {reportData?.deals?.completedDeals || 0}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                    <span>Total Value</span>
                    <span className="fw-bold">
                      $
                      {((reportData?.deals?.totalValue || 0) / 1000000).toFixed(
                        2,
                      )}
                      M
                    </span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                    <span>Average Deal Size</span>
                    <span className="fw-bold">
                      $
                      {(
                        (reportData?.deals?.averageDealSize || 0) / 1000
                      ).toFixed(0)}
                      K
                    </span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span>Total Weight</span>
                    <span className="fw-bold">
                      {reportData?.deals?.totalWeight || 0} kg
                    </span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      )}

      {/* Inventory Tab */}
      {activeTab === "inventory" && (
        <div>
          <Row className="g-4">
            <Col lg={6}>
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-transparent border-0 pt-4">
                  <h5 className="mb-0 fw-bold">Inventory Distribution</h5>
                </Card.Header>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={inventoryDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {inventoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={6}>
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-transparent border-0 pt-4">
                  <h5 className="mb-0 fw-bold">Inventory Summary</h5>
                </Card.Header>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                    <span>Total Inventory Items</span>
                    <span className="fw-bold">
                      {reportData?.inventory?.count || 0}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                    <span>Available</span>
                    <span className="fw-bold text-success">
                      {reportData?.inventory?.available || 0}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                    <span>Total Weight</span>
                    <span className="fw-bold">
                      {reportData?.inventory?.totalWeight || 0} kg
                    </span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span>Total Value</span>
                    <span className="fw-bold">
                      $
                      {(
                        (reportData?.inventory?.totalValue || 0) / 1000000
                      ).toFixed(2)}
                      M
                    </span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <Row className="g-4">
          <Col lg={12}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-transparent border-0 pt-4">
                <h5 className="mb-0 fw-bold">User Registration Trends</h5>
              </Card.Header>
              <Card.Body>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="suppliers" fill="#f4a261" name="Suppliers" />
                    <Bar dataKey="buyers" fill="#2a9d8f" name="Buyers" />
                  </BarChart>
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* RFQs Tab */}
      {activeTab === "rfqs" && (
        <Row className="g-4">
          <Col lg={12}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-transparent border-0 pt-4">
                <h5 className="mb-0 fw-bold">RFQ Analytics</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={4}>
                    <div className="text-center p-4 border rounded mb-3">
                      <h3 className="fw-bold text-primary">
                        {reportData?.overview?.rfqs?.total || 0}
                      </h3>
                      <p className="text-muted mb-0">Total RFQs</p>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="text-center p-4 border rounded mb-3">
                      <h3 className="fw-bold text-success">
                        {reportData?.overview?.rfqs?.accepted || 0}
                      </h3>
                      <p className="text-muted mb-0">Accepted RFQs</p>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="text-center p-4 border rounded mb-3">
                      <h3 className="fw-bold text-info">
                        {reportData?.overview?.rfqs?.conversionRate || 0}%
                      </h3>
                      <p className="text-muted mb-0">Conversion Rate</p>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Export Modal */}
      <Modal show={showExportModal} onHide={() => setShowExportModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Export Report</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Report Type</Form.Label>
              <Form.Select
                value={exportType}
                onChange={(e) => setExportType(e.target.value)}
              >
                <option value="deals">Deals Report</option>
                <option value="inventory">Inventory Report</option>
                <option value="rfq">RFQ Report</option>
                <option value="suppliers">Suppliers Report</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Export Format</Form.Label>
              <div className="d-flex gap-3">
                <Form.Check
                  type="radio"
                  label="Excel (.xlsx)"
                  name="format"
                  value="excel"
                  checked={exportFormat === "excel"}
                  onChange={(e) => setExportFormat(e.target.value)}
                />
                <Form.Check
                  type="radio"
                  label="CSV"
                  name="format"
                  value="csv"
                  checked={exportFormat === "csv"}
                  onChange={(e) => setExportFormat(e.target.value)}
                />
                <Form.Check
                  type="radio"
                  label="PDF"
                  name="format"
                  value="pdf"
                  checked={exportFormat === "pdf"}
                  onChange={(e) => setExportFormat(e.target.value)}
                />
              </div>
            </Form.Group>
            <Alert variant="info">
              <small>
                Report will be generated for the selected date range:{" "}
                {dateRange.startDate} to {dateRange.endDate}
              </small>
            </Alert>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowExportModal(false)}>
            Cancel
          </Button>
          <Button variant="warning" onClick={handleExport}>
            <FiDownload className="me-2" />
            Export Report
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminReports;
