/* eslint-disable react-hooks/immutability */
import  { useState, useEffect } from "react";
import { Row, Col, Card, Badge, Button, Spinner, ProgressBar } from "react-bootstrap";
import { FiPackage, FiDollarSign, FiTrendingUp, FiCheckCircle,  FiRefreshCw, FiShoppingCart } from "react-icons/fi";
import { dashboardApi } from "../../api/dashboardApi";
import PageHeader from "../../components/PageHeader";
import toast from "react-hot-toast";

const BuyerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardApi.getBuyerDashboard();
      if (response.success) {
        setData(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: "Available Gold", value: `${data?.market?.totalAvailableWeight || 0} kg`, icon: FiPackage, color: "primary" },
    { title: "My RFQs", value: data?.rfqs?.total || 0, icon: FiTrendingUp, color: "info" },
    { title: "Accepted Offers", value: data?.rfqs?.accepted || 0, icon: FiCheckCircle, color: "success" },
    { title: "Total Spent", value: `$${((data?.rfqs?.totalValue || 0) / 1000).toFixed(0)}K`, icon: FiDollarSign, color: "warning" },
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
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-1 small">{stat.title}</p>
                    <h3 className="fw-bold mb-0">{stat.value}</h3>
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

      <Row className="g-4">
        <Col lg={6}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-transparent border-0 pt-4">
              <h5 className="mb-0 fw-bold">Market Overview</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span>Available Inventory</span>
                  <span className="fw-bold">{data?.market?.availableInventory || 0} listings</span>
                </div>
                <ProgressBar now={75} variant="success" />
              </div>
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span>Total Weight Available</span>
                  <span className="fw-bold">{data?.market?.totalAvailableWeight || 0} kg</span>
                </div>
                <ProgressBar now={60} variant="warning" />
              </div>
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span>Market Value</span>
                  <span className="fw-bold">${((data?.market?.totalAvailableValue || 0) / 1000000).toFixed(1)}M</span>
                </div>
                <ProgressBar now={45} variant="info" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-transparent border-0 pt-4">
              <h5 className="mb-0 fw-bold">My Performance</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-3 pb-2 border-bottom">
                <span>RFQ Response Rate</span>
                <Badge bg="success">{data?.rfqs?.responseRate || 0}%</Badge>
              </div>
              <div className="d-flex justify-content-between mb-3 pb-2 border-bottom">
                <span>Quote Acceptance Rate</span>
                <Badge bg="info">{data?.rfqs?.acceptanceRate || 0}%</Badge>
              </div>
              <div className="d-flex justify-content-between mb-3 pb-2 border-bottom">
                <span>Total Gold Purchased</span>
                <span className="fw-bold">{data?.performance?.totalGoldPurchased || 0} kg</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Average Purchase Size</span>
                <span className="fw-bold">${((data?.performance?.averagePurchaseSize || 0) / 1000).toFixed(0)}K</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row className="mt-4">
        <Col xs={12}>
          <Card className="border-0 shadow-sm bg-gradient">
            <Card.Body className="text-center">
              <h5 className="fw-bold mb-3">Ready to buy gold?</h5>
              <p className="text-muted mb-3">Browse available inventory and request quotations from verified suppliers.</p>
              <Button variant="warning" size="lg">
                <FiShoppingCart className="me-2" />
                Browse Inventory
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default BuyerDashboard;