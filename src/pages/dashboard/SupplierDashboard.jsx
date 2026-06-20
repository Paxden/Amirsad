/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Row, 
  Col, 
  Card, 
  ProgressBar, 
  Badge, 
  Button, 
  Spinner,
  ListGroup,
  Alert
} from "react-bootstrap";
import { 
  FiPackage, 
  FiTrendingUp, 
  FiRefreshCw, 
  FiCheckCircle, 
  FiClock, 
  FiFileText,
  FiCalendar,
  FiAlertCircle,
  FiArrowRight
} from "react-icons/fi";
import { FaHashtag } from "react-icons/fa";
import { dashboardApi } from "../../api/dashboardApi";
import PageHeader from "../../components/PageHeader";
import toast from "react-hot-toast";

// Helper function to format currency in Naira
const formatNaira = (amount) => {
  if (!amount) return "₦0";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper function to format currency in Naira with thousands
const formatNairaThousands = (amount) => {
  if (!amount) return "₦0";
  const thousands = amount / 1000;
  if (thousands >= 1000) {
    return `₦${(thousands / 1000).toFixed(1)}B`;
  }
  if (thousands >= 1) {
    return `₦${thousands.toFixed(0)}K`;
  }
  return formatNaira(amount);
};

const SupplierDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [stats, setStats] = useState({
    totalOpportunities: 0,
    availableInventory: 0,
    totalRFQs: 0,
    totalValue: 0,
    approvalRate: 0,
    utilizationRate: 0,
    acceptanceRate: 0,
    totalGoldSold: 0,
    totalDealsValue: 0,
    completedDeals: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardApi.getSupplierDashboard();
      if (response.success) {
        const dashboardData = response.data;
        setData(dashboardData);
        
        // Calculate stats from response data
        setStats({
          totalOpportunities: dashboardData?.opportunities?.total || 0,
          availableInventory: dashboardData?.inventory?.available || 0,
          totalRFQs: dashboardData?.rfqs?.total || 0,
          totalValue: dashboardData?.inventory?.totalValue || 0,
          approvalRate: dashboardData?.opportunities?.approvalRate || 0,
          utilizationRate: dashboardData?.inventory?.utilizationRate || 0,
          acceptanceRate: dashboardData?.rfqs?.acceptanceRate || 0,
          totalGoldSold: dashboardData?.performance?.totalGoldSold || 0,
          totalDealsValue: dashboardData?.rfqs?.totalValue || 0,
          completedDeals: dashboardData?.rfqs?.accepted || 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      title: "Total Opportunities", 
      value: stats.totalOpportunities, 
      icon: FiPackage, 
      color: "primary",
      link: "/supplier/opportunities",
      description: "Total submitted opportunities"
    },
    { 
      title: "Active Inventory", 
      value: stats.availableInventory, 
      icon: FiPackage, 
      color: "success",
      link: "/supplier/inventory",
      description: "Currently listed for sale"
    },
    { 
      title: "RFQs Received", 
      value: stats.totalRFQs, 
      icon: FiTrendingUp, 
      color: "info",
      link: "/supplier/rfqs",
      description: "Buyer inquiries"
    },
    { 
      title: "Total Value", 
      value: formatNairaThousands(stats.totalValue), 
      icon: FaHashtag, 
      color: "warning",
      link: "/supplier/deals",
      description: "Total inventory value"
    },
  ];

  const getKYCStatusBadge = () => {
    const status = data?.kycStatus || "not_submitted";
    const statusMap = {
      not_submitted: { text: "Not Submitted", variant: "secondary", icon: FiAlertCircle },
      pending: { text: "Under Review", variant: "warning", icon: FiClock },
      under_review: { text: "Under Review", variant: "info", icon: FiClock },
      approved: { text: "Approved", variant: "success", icon: FiCheckCircle },
      rejected: { text: "Rejected", variant: "danger", icon: FiAlertCircle },
    };
    return statusMap[status] || statusMap.not_submitted;
  };

  const kycStatus = getKYCStatusBadge();

  const getApprovalStatusBadge = () => {
    const status = data?.approvalStatus || "pending";
    const statusMap = {
      approved: { text: "Approved", variant: "success", icon: FiCheckCircle },
      pending: { text: "Pending Approval", variant: "warning", icon: FiClock },
      rejected: { text: "Rejected", variant: "danger", icon: FiAlertCircle },
    };
    return statusMap[status] || statusMap.pending;
  };

  const approvalStatus = getApprovalStatusBadge();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
        <Spinner animation="border" variant="warning" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Supplier Dashboard"
        breadcrumbs={[{ label: "Dashboard" }]}
        actions={
          <Button variant="outline-secondary" size="sm" onClick={fetchDashboardData}>
            <FiRefreshCw className="me-1" /> Refresh
          </Button>
        }
      />

      {/* KYC Alert */}
      {data?.kycStatus !== "approved" && (
        <Alert variant="warning" className="mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <strong>KYC Verification Required!</strong>
              <p className="mb-0 small">Complete your KYC verification to start selling gold.</p>
            </div>
            <Button 
              variant="warning" 
              size="sm"
              onClick={() => navigate("/supplier/kyc")}
            >
              Submit KYC Now
            </Button>
          </div>
        </Alert>
      )}

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        {statCards.map((stat, index) => (
          <Col md={6} lg={3} key={index}>
            <Card 
              className="border-0 shadow-sm stat-card h-100"
              onClick={() => stat.link && navigate(stat.link)}
              style={{ cursor: stat.link ? "pointer" : "default" }}
            >
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-1 small">{stat.title}</p>
                    <h3 className="fw-bold mb-1">{stat.value}</h3>
                    <small className="text-muted">{stat.description}</small>
                  </div>
                  <div className={`bg-${stat.color} bg-opacity-10 p-3 rounded stat-icon`}>
                    <stat.icon size={24} className={`text-${stat.color}`} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="g-4">
        {/* Performance Metrics */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-transparent border-0 pt-4">
              <h5 className="mb-0 fw-bold">Performance Metrics</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span>Approval Rate</span>
                  <span className="fw-bold">{stats.approvalRate || 0}%</span>
                </div>
                <ProgressBar 
                  now={stats.approvalRate || 0} 
                  variant="success"
                  className="rounded-pill"
                />
              </div>
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span>Inventory Utilization</span>
                  <span className="fw-bold">{stats.utilizationRate || 0}%</span>
                </div>
                <ProgressBar 
                  now={stats.utilizationRate || 0} 
                  variant="warning"
                  className="rounded-pill"
                />
              </div>
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span>RFQ Acceptance Rate</span>
                  <span className="fw-bold">{stats.acceptanceRate || 0}%</span>
                </div>
                <ProgressBar 
                  now={stats.acceptanceRate || 0} 
                  variant="info"
                  className="rounded-pill"
                />
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Overall Performance</span>
                  <span className="fw-bold">
                    {Math.round(
                      ((stats.approvalRate || 0) + 
                       (stats.utilizationRate || 0) + 
                       (stats.acceptanceRate || 0)) / 3
                    )}%
                  </span>
                </div>
                <ProgressBar 
                  now={Math.round(
                    ((stats.approvalRate || 0) + 
                     (stats.utilizationRate || 0) + 
                     (stats.acceptanceRate || 0)) / 3
                  )} 
                  variant="primary"
                  className="rounded-pill"
                />
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Account Status */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-transparent border-0 pt-4">
              <h5 className="mb-0 fw-bold">Account Status</h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item className="d-flex justify-content-between align-items-center bg-transparent">
                  <div className="d-flex align-items-center gap-2">
                    <kycStatus.icon size={18} className={`text-${kycStatus.variant}`} />
                    <span>KYC Status</span>
                  </div>
                  <Badge bg={kycStatus.variant}>{kycStatus.text}</Badge>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center bg-transparent">
                  <div className="d-flex align-items-center gap-2">
                    <approvalStatus.icon size={18} className={`text-${approvalStatus.variant}`} />
                    <span>Account Approval</span>
                  </div>
                  <Badge bg={approvalStatus.variant}>{approvalStatus.text}</Badge>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center bg-transparent">
                  <span>Total Gold Sold</span>
                  <span className="fw-bold text-success">
                    {stats.totalGoldSold || 0} kg
                  </span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center bg-transparent">
                  <span>Total Revenue</span>
                  <span className="fw-bold text-primary">
                    {formatNairaThousands(stats.totalDealsValue || 0)}
                  </span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center bg-transparent">
                  <span>Completed Deals</span>
                  <span className="fw-bold">{stats.completedDeals || 0}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center bg-transparent">
                  <span>Total Deals Value</span>
                  <span className="fw-bold text-success">
                    {formatNairaThousands(stats.totalDealsValue || 0)}
                  </span>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        {/* Recent Activity */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-transparent border-0 pt-4 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">Recent Activity</h5>
              <Button 
                variant="link" 
                size="sm" 
                className="text-decoration-none"
                onClick={() => navigate("/supplier/activities")}
              >
                View All <FiArrowRight className="ms-1" />
              </Button>
            </Card.Header>
            <Card.Body>
              <div className="activity-timeline">
                {data?.recentActivity?.rfqs && data.recentActivity.rfqs.length > 0 ? (
                  data.recentActivity.rfqs.slice(0, 5).map((rfq, index) => (
                    <div key={index} className="activity-item">
                      <div className="activity-icon">
                        <FiClock size={14} />
                      </div>
                      <div className="activity-content">
                        <p className="mb-0 small">
                          <strong>RFQ {rfq.rfqNumber}</strong> received from {rfq.buyer?.fullName || "a buyer"}
                        </p>
                        <small className="text-muted">
                          {new Date(rfq.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted text-center">No recent activities</p>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Quick Actions */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-transparent border-0 pt-4">
              <h5 className="mb-0 fw-bold">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col sm={6}>
                  <Button 
                    variant="outline-primary" 
                    className="w-100 py-3"
                    onClick={() => navigate("/supplier/opportunities")}
                  >
                    <FiFileText size={20} className="mb-2 d-block mx-auto" />
                    <span>New Opportunity</span>
                  </Button>
                </Col>
                <Col sm={6}>
                  <Button 
                    variant="outline-success" 
                    className="w-100 py-3"
                    onClick={() => navigate("/supplier/inventory")}
                  >
                    <FiPackage size={20} className="mb-2 d-block mx-auto" />
                    <span>Manage Inventory</span>
                  </Button>
                </Col>
                <Col sm={6}>
                  <Button 
                    variant="outline-info" 
                    className="w-100 py-3"
                    onClick={() => navigate("/supplier/rfqs")}
                  >
                    <FiTrendingUp size={20} className="mb-2 d-block mx-auto" />
                    <span>View RFQs</span>
                  </Button>
                </Col>
                <Col sm={6}>
                  <Button 
                    variant="outline-warning" 
                    className="w-100 py-3"
                    onClick={() => navigate("/supplier/appointments")}
                  >
                    <FiCalendar size={20} className="mb-2 d-block mx-auto" />
                    <span>Schedule Appointment</span>
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <style>{`
        .stat-card {
          transition: all 0.3s ease;
        }
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1) !important;
        }
        .stat-icon {
          transition: all 0.3s ease;
        }
        .stat-card:hover .stat-icon {
          transform: scale(1.1);
        }
        .activity-timeline {
          max-height: 300px;
          overflow-y: auto;
        }
        .activity-item {
          display: flex;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid var(--border-color);
        }
        .activity-item:last-child {
          border-bottom: none;
        }
        .activity-icon {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--bg-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary-color);
        }
        .activity-content {
          flex: 1;
        }
        .progress {
          background-color: var(--bg-secondary);
        }
      `}</style>
    </div>
  );
};

export default SupplierDashboard;