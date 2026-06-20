/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from "react";
import { Row, Col, Card, Badge, Button, Spinner, ListGroup } from "react-bootstrap";
import { FiClock, FiCheckCircle, FiAlertCircle, FiRefreshCw } from "react-icons/fi";
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

const StaffDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingTasks, setPendingTasks] = useState([
    { type: "KYC", count: 0, color: "warning" },
    { type: "Opportunities", count: 0, color: "info" },
    { type: "Inventory", count: 0, color: "primary" },
    { type: "RFQs", count: 0, color: "danger" },
  ]);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    expiringInventory: 0,
    processedRFQs: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardApi.getStaffDashboard();
      if (response.success) {
        setData(response.data);
        // Calculate stats from response data
        const pendingTasksData = response.data?.pendingTasks || {};
        setPendingTasks([
          { type: "KYC", count: pendingTasksData.kyc?.total || 0, color: "warning" },
          { type: "Opportunities", count: pendingTasksData.opportunities || 0, color: "info" },
          { type: "Inventory", count: pendingTasksData.inventory || 0, color: "primary" },
          { type: "RFQs", count: pendingTasksData.rfqs || 0, color: "danger" },
        ]);
        
        setStats({
          total: pendingTasksData.total || 0,
          today: response.data?.schedule?.today || 0,
          expiringInventory: response.data?.alerts?.expiringInventory || 0,
          processedRFQs: response.data?.performance?.processedRFQs || 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

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
        title="Staff Dashboard"
        breadcrumbs={[{ label: "Dashboard" }]}
        actions={
          <Button variant="outline-secondary" size="sm" onClick={fetchDashboardData}>
            <FiRefreshCw className="me-1" /> Refresh
          </Button>
        }
      />

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        <Col md={6} lg={3}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body>
              <div className="mb-3">
                <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex p-3">
                  <FiClock size={24} className="text-warning" />
                </div>
              </div>
              <h2 className="fw-bold mb-0">{stats.total}</h2>
              <p className="text-muted mb-0">Pending Tasks</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body>
              <div className="mb-3">
                <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex p-3">
                  <FiCheckCircle size={24} className="text-success" />
                </div>
              </div>
              <h2 className="fw-bold mb-0">{stats.today}</h2>
              <p className="text-muted mb-0">Today's Appointments</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body>
              <div className="mb-3">
                <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex p-3">
                  <FiAlertCircle size={24} className="text-info" />
                </div>
              </div>
              <h2 className="fw-bold mb-0">{stats.expiringInventory}</h2>
              <p className="text-muted mb-0">Expiring Inventory</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body>
              <div className="mb-3">
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3">
                  <FaHashtag size={24} className="text-primary" />
                </div>
              </div>
              <h2 className="fw-bold mb-0">{stats.processedRFQs}</h2>
              <p className="text-muted mb-0">RFQs Processed</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Pending Reviews & Recent RFQs */}
      <Row className="g-4">
        <Col lg={6}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-transparent border-0 pt-4">
              <h5 className="mb-0 fw-bold">Pending Reviews</h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                {pendingTasks.map((task, index) => (
                  <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center bg-transparent">
                    <div>
                      <Badge bg={task.color} className="me-2">{task.type}</Badge>
                      <span>{task.count} pending</span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline-primary"
                      onClick={() => {
                        // Navigate to appropriate review page based on type
                        if (task.type === "KYC") {
                          window.location.href = "/staff/kyc-review";
                        } else if (task.type === "RFQs") {
                          window.location.href = "/staff/rfq-review";
                        } else if (task.type === "Inventory") {
                          window.location.href = "/staff/inventory";
                        }
                      }}
                    >
                      Review
                    </Button>
                  </ListGroup.Item>
                ))}
                {pendingTasks.every(task => task.count === 0) && (
                  <p className="text-muted text-center py-3">No pending reviews</p>
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-transparent border-0 pt-4">
              <h5 className="mb-0 fw-bold">Recent RFQs</h5>
            </Card.Header>
            <Card.Body>
              {data?.recentActivity?.rfqs && data.recentActivity.rfqs.length > 0 ? (
                data.recentActivity.rfqs.map((rfq, index) => (
                  <div key={index} className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                    <div>
                      <div className="fw-bold">{rfq.rfqNumber}</div>
                      <small className="text-muted">Buyer: {rfq.buyer?.fullName || "N/A"}</small>
                      {rfq.requestedWeightKg && (
                        <div className="small text-muted">
                          {rfq.requestedWeightKg} kg @ {formatNaira(rfq.offeredPricePerKg || 0)}
                        </div>
                      )}
                    </div>
                    <Badge 
                      bg={rfq.status === "pending" ? "warning" : rfq.status === "accepted" ? "success" : "secondary"}
                    >
                      {rfq.status || "Pending"}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-muted text-center py-3">No recent RFQs</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StaffDashboard;