/* eslint-disable react-hooks/immutability */
import  { useState, useEffect } from "react";
import { Row, Col, Card, Badge, Button, Spinner, ListGroup } from "react-bootstrap";
import { FiClock, FiCheckCircle, FiAlertCircle, FiRefreshCw } from "react-icons/fi";
import { dashboardApi } from "../../api/dashboardApi";
import PageHeader from "../../components/PageHeader";
import toast from "react-hot-toast";

const StaffDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardApi.getStaffDashboard();
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

  const pendingTasks = [
    { type: "KYC", count: data?.pendingTasks?.kyc?.total || 0, color: "warning" },
    { type: "Opportunities", count: data?.pendingTasks?.opportunities || 0, color: "info" },
    { type: "Inventory", count: data?.pendingTasks?.inventory || 0, color: "primary" },
    { type: "RFQs", count: data?.pendingTasks?.rfqs || 0, color: "danger" },
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
        title="Staff Dashboard"
        breadcrumbs={[{ label: "Dashboard" }]}
        actions={
          <Button variant="outline-secondary" size="sm" onClick={fetchDashboardData}>
            <FiRefreshCw className="me-1" /> Refresh
          </Button>
        }
      />

      <Row className="g-4 mb-4">
        <Col md={6} lg={3}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body>
              <div className="mb-3">
                <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex p-3">
                  <FiClock size={24} className="text-warning" />
                </div>
              </div>
              <h2 className="fw-bold mb-0">{data?.pendingTasks?.total || 0}</h2>
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
              <h2 className="fw-bold mb-0">{data?.schedule?.today || 0}</h2>
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
              <h2 className="fw-bold mb-0">{data?.alerts?.expiringInventory || 0}</h2>
              <p className="text-muted mb-0">Expiring Inventory</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body>
              <div className="mb-3">
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3">
                  <FiClock size={24} className="text-primary" />
                </div>
              </div>
              <h2 className="fw-bold mb-0">{data?.performance?.processedRFQs || 0}</h2>
              <p className="text-muted mb-0">RFQs Processed</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

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
                    <Button size="sm" variant="outline-primary">Review</Button>
                  </ListGroup.Item>
                ))}
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
              {data?.recentActivity?.rfqs?.map((rfq, index) => (
                <div key={index} className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                  <div>
                    <div className="fw-bold">{rfq.rfqNumber}</div>
                    <small className="text-muted">Buyer: {rfq.buyer?.fullName}</small>
                  </div>
                  <Badge bg="warning">Pending</Badge>
                </div>
              ))}
              {(!data?.recentActivity?.rfqs || data.recentActivity.rfqs.length === 0) && (
                <p className="text-muted text-center">No recent RFQs</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StaffDashboard;