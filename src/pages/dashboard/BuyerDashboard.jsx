/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Card, Badge, Button, Spinner, ProgressBar } from "react-bootstrap";
import { 
  FiPackage, 
  FiTrendingUp, 
  FiCheckCircle, 
  FiRefreshCw, 
  FiShoppingCart,
  FiClock,
  FiArrowRight,
  FiCalendar,
  FiFileText
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

// Helper function to format currency in Naira with millions
const formatNairaMillions = (amount) => {
  if (!amount) return "₦0";
  const millions = amount / 1000000;
  if (millions >= 1) {
    return `₦${millions.toFixed(2)}M`;
  }
  return formatNaira(amount);
};

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quickStats, setQuickStats] = useState({
    totalDeals: 0,
    totalAppointments: 0,
    avgDealSize: 0,
    totalRFQs: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/dashboard/buyer`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await response.json();
      if (result.success) {
        setData(result.data);
        
        // Calculate quick stats from the data
        setQuickStats({
          totalDeals: result.data?.rfqs?.accepted || 0,
          totalAppointments: result.data?.appointments?.total || 0,
          avgDealSize: result.data?.performance?.averagePurchaseSize || 0,
          totalRFQs: result.data?.rfqs?.total || 0,
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
      title: "Available Gold", 
      value: `${data?.market?.totalAvailableWeight || 0} kg`, 
      icon: FiPackage, 
      color: "primary",
      description: "Ready for purchase"
    },
    { 
      title: "My RFQs", 
      value: data?.rfqs?.total || 0, 
      icon: FiTrendingUp, 
      color: "info",
      description: `${data?.rfqs?.pending || 0} pending`
    },
    { 
      title: "Accepted Offers", 
      value: data?.rfqs?.accepted || 0, 
      icon: FiCheckCircle, 
      color: "success",
      description: `${data?.rfqs?.quoted || 0} quoted`
    },
    { 
      title: "Total Spent", 
      value: formatNairaThousands(data?.rfqs?.totalValue || 0), 
      icon: FaHashtag, 
      color: "warning",
      description: "Total purchases"
    },
  ];

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
        title="Buyer Dashboard"
        breadcrumbs={[{ label: "Dashboard" }]}
        actions={
          <Button variant="outline-secondary" size="sm" onClick={fetchDashboardData}>
            <FiRefreshCw className="me-1" /> Refresh
          </Button>
        }
      />

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        {statCards.map((stat, index) => (
          <Col md={6} lg={3} key={index}>
            <Card className="border-0 shadow-sm h-100 stat-card">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="text-muted mb-1 small">{stat.title}</p>
                    <h3 className="fw-bold mb-1">{stat.value}</h3>
                    <small className="text-muted">{stat.description}</small>
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

      <Row className="g-4">
        {/* Market Overview */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-transparent border-0 pt-4 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">Market Overview</h5>
              <Badge bg="info" pill className="px-3 py-2">
                <FiClock className="me-1" size={12} />
                Live
              </Badge>
            </Card.Header>
            <Card.Body>
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Available Inventory</span>
                  <span className="fw-bold">{data?.market?.availableInventory || 0} listings</span>
                </div>
                <ProgressBar 
                  now={data?.market?.availableInventory > 0 ? Math.min((data.market.availableInventory / 100) * 100, 100) : 0} 
                  variant="success" 
                  className="rounded-pill"
                  style={{ height: "8px" }}
                />
              </div>
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Total Weight Available</span>
                  <span className="fw-bold">{data?.market?.totalAvailableWeight || 0} kg</span>
                </div>
                <ProgressBar 
                  now={data?.market?.totalAvailableWeight > 0 ? Math.min((data.market.totalAvailableWeight / 1000) * 100, 100) : 0} 
                  variant="warning" 
                  className="rounded-pill"
                  style={{ height: "8px" }}
                />
              </div>
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Market Value</span>
                  <span className="fw-bold">{formatNairaMillions(data?.market?.totalAvailableValue || 0)}</span>
                </div>
                <ProgressBar 
                  now={data?.market?.totalAvailableValue > 0 ? Math.min((data.market.totalAvailableValue / 1000000000) * 100, 100) : 0} 
                  variant="info" 
                  className="rounded-pill"
                  style={{ height: "8px" }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* My Performance */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-transparent border-0 pt-4 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">My Performance</h5>
              <Badge bg="warning" pill className="px-3 py-2">
                <FiTrendingUp className="me-1" size={12} />
                {data?.rfqs?.acceptanceRate || 0}% Success
              </Badge>
            </Card.Header>
            <Card.Body>
              <div className="bg-light p-3 rounded-3 mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">RFQ Response Rate</span>
                  <Badge bg="success" className="px-3 py-2">
                    {data?.rfqs?.responseRate || 0}%
                  </Badge>
                </div>
              </div>
              <div className="bg-light p-3 rounded-3 mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">Quote Acceptance Rate</span>
                  <Badge bg="info" className="px-3 py-2">
                    {data?.rfqs?.acceptanceRate || 0}%
                  </Badge>
                </div>
              </div>
              <div className="bg-light p-3 rounded-3 mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">Total Gold Purchased</span>
                  <span className="fw-bold text-success">{data?.performance?.totalGoldPurchased || 0} kg</span>
                </div>
              </div>
              <div className="bg-light p-3 rounded-3">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">Average Purchase Size</span>
                  <span className="fw-bold text-primary">{formatNairaThousands(data?.performance?.averagePurchaseSize || 0)}</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions & Quick Stats */}
      <Row className="g-4 mt-2">
        <Col lg={8}>
          <Card className="border-0 shadow-sm bg-gradient-primary">
            <Card.Body className="text-center py-5">
              <div className="mb-4">
                <div className="d-inline-flex p-3 rounded-circle bg-white bg-opacity-20">
                  <FiShoppingCart size={40} className="text-white" />
                </div>
              </div>
              <h4 className="fw-bold text-white mb-2">Ready to buy gold?</h4>
              <p className="text-white-50 mb-4">
                Browse available inventory and request quotations from verified suppliers.
              </p>
              <Button 
                variant="light" 
                size="lg"
                className="px-5 py-2 fw-bold"
                onClick={() => navigate("/buyer/inventory")}
              >
                <FiShoppingCart className="me-2" />
                Browse Inventory
                <FiArrowRight className="ms-2" />
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-transparent border-0 pt-4">
              <h5 className="mb-0 fw-bold">Quick Stats</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                <span className="text-muted">
                  <FiFileText className="me-2" size={16} />
                  Total RFQs
                </span>
                <span className="fw-bold">{quickStats.totalRFQs}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                <span className="text-muted">
                  <FiCheckCircle className="me-2" size={16} />
                  Accepted Deals
                </span>
                <span className="fw-bold text-success">{quickStats.totalDeals}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                <span className="text-muted">
                  <FiCalendar className="me-2" size={16} />
                  Appointments
                </span>
                <span className="fw-bold text-info">{quickStats.totalAppointments}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted">
                  <FaHashtag className="me-2" size={16} />
                  Avg Deal Size
                </span>
                <span className="fw-bold text-success">
                  {formatNairaThousands(quickStats.avgDealSize)}
                </span>
              </div>
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
        .bg-gradient-primary {
          background: linear-gradient(135deg, #f4a261, #e76f51);
          border: none;
        }
        .bg-white.bg-opacity-20 {
          background: rgba(255, 255, 255, 0.2);
        }
        .progress {
          background-color: var(--bg-secondary);
        }
      `}</style>
    </div>
  );
};

export default BuyerDashboard;