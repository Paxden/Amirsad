/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Table,
  Badge,
  Button,
  Spinner,
  Form,
  Modal,
  InputGroup,
  Alert,
} from "react-bootstrap";
import {
  FiFileText,
  FiSearch,
  FiEye,
  FiCheckCircle,
  FiRefreshCw,
  FiUser,
  FiCalendar,
  FiClock,
  FiSend,
  FiMapPin,
} from "react-icons/fi";
import { FaHashtag } from "react-icons/fa";
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

// Helper function to format currency in Naira with millions
const formatNairaMillions = (amount) => {
  if (!amount) return "₦0";
  const millions = amount / 1000000;
  if (millions >= 1) {
    return `₦${millions.toFixed(2)}M`;
  }
  return formatNaira(amount);
};

const SupplierRFQsReceived = () => {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRFQ, setSelectedRFQ] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseData, setResponseData] = useState({
    quotePricePerKg: "",
    message: "",
  });
  const [filters, setFilters] = useState({
    status: "",
    search: "",
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    quoted: 0,
    accepted: 0,
    totalValue: 0,
  });

  useEffect(() => {
    fetchRFQs();
  }, [filters]);

  // Calculate stats from RFQs data
  const calculateStats = (rfqsData) => {
    if (rfqsData && rfqsData.length > 0) {
      const statsData = {
        total: rfqsData.length,
        pending: rfqsData.filter(r => r.status === "pending" || r.status === "under_review").length,
        quoted: rfqsData.filter(r => r.status === "quoted").length,
        accepted: rfqsData.filter(r => r.status === "accepted").length,
        totalValue: rfqsData.reduce((sum, r) => sum + (r.offeredTotalPrice || 0), 0),
      };
      setStats(statsData);
    } else {
      setStats({
        total: 0,
        pending: 0,
        quoted: 0,
        accepted: 0,
        totalValue: 0,
      });
    }
  };

  const fetchRFQs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.search) queryParams.append("search", filters.search);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/rfqs/supplier-rfqs?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setRfqs(data.rfqs || []);
        // Calculate stats from the fetched data
        calculateStats(data.rfqs || []);
      }
    } catch (error) {
      console.error("Failed to fetch RFQs:", error);
      toast.error("Failed to load RFQs");
      setRfqs([]);
      calculateStats([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async () => {
    if (!responseData.quotePricePerKg) {
      toast.error("Please enter a quote price");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/rfqs/${selectedRFQ._id}/respond/supplier`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            quotePricePerKg: parseFloat(responseData.quotePricePerKg),
            message: responseData.message,
          }),
        }
      );
      const data = await response.json();
      if (data.success) {
        toast.success("Quote sent to buyer successfully");
        setShowResponseModal(false);
        setResponseData({ quotePricePerKg: "", message: "" });
        fetchRFQs();
      }
    } catch (error) {
      console.error("Response error:", error);
      toast.error("Failed to send response");
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: "warning",
      under_review: "info",
      quoted: "primary",
      negotiation: "warning",
      accepted: "success",
      rejected: "danger",
      expired: "secondary",
    };
    const labels = {
      pending: "Pending Response",
      under_review: "Under Review",
      quoted: "Quoted",
      negotiation: "Negotiation",
      accepted: "Accepted",
      rejected: "Rejected",
      expired: "Expired",
    };
    return <Badge bg={variants[status] || "secondary"}>{labels[status] || status}</Badge>;
  };

  const getPriorityBadge = (rfq) => {
    const totalValue = rfq.offeredTotalPrice || 0;
    if (totalValue > 100000) {
      return <Badge bg="danger" className="ms-2">High Value</Badge>;
    }
    if (totalValue > 50000) {
      return <Badge bg="warning" className="ms-2">Medium Value</Badge>;
    }
    return null;
  };

  const statCards = [
    {
      title: "Total RFQs",
      value: stats.total || 0,
      icon: FiFileText,
      color: "primary",
    },
    {
      title: "Pending Response",
      value: stats.pending || 0,
      icon: FiClock,
      color: "warning",
    },
    {
      title: "Accepted",
      value: stats.accepted || 0,
      icon: FiCheckCircle,
      color: "success",
    },
    {
      title: "Total Value",
      value: formatNairaMillions(stats.totalValue || 0),
      icon: FaHashtag,
      color: "info",
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
        title="RFQs Received"
        breadcrumbs={[{ label: "Supplier" }, { label: "RFQs" }]}
        actions={
          <Button variant="outline-secondary" onClick={fetchRFQs}>
            <FiRefreshCw className="me-2" />
            Refresh
          </Button>
        }
      />

      {/* Stats Cards - Calculated from RFQs data */}
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

      {/* Filters */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={5}>
              <InputGroup>
                <InputGroup.Text>
                  <FiSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by RFQ number or buyer name..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All Status</option>
                <option value="pending">Pending Response</option>
                <option value="quoted">Quoted</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button variant="outline-secondary" onClick={fetchRFQs} className="w-100">
                <FiRefreshCw className="me-2" />
                Reset
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* RFQ Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>RFQ #</th>
                <th>Buyer</th>
                <th>Request Details</th>
                <th>Offer</th>
                <th>Status</th>
                <th>Received</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rfqs.map((rfq) => (
                <tr key={rfq._id}>
                  <td>
                    <div className="fw-bold">{rfq.rfqNumber}</div>
                    <small className="text-muted">{rfq._id?.slice(-6)}</small>
                  </td>
                  <td>
                    <div>
                      <FiUser className="me-1" size={12} />
                      {rfq.buyer?.fullName || "N/A"}
                    </div>
                    
                  </td>
                  <td>
                    <div className="fw-bold">{rfq.requestedWeightKg} kg</div>
                    <small className="text-muted">{rfq.inventory?.purity}% purity</small>
                    {rfq.deliveryTerms && (
                      <div className="small text-muted">
                        <FiMapPin className="me-1" size={12} />
                        {rfq.deliveryTerms}
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="fw-bold text-primary">
                      {formatNaira(rfq.offeredPricePerKg)}/kg
                    </div>
                    <small>Total: {formatNaira(rfq.offeredTotalPrice || 0)}</small>
                    {rfq.quotePricePerKg && (
                      <div className="small text-success mt-1">
                        Your quote: {formatNaira(rfq.quotePricePerKg)}/kg
                      </div>
                    )}
                  </td>
                  <td>
                    {getStatusBadge(rfq.status)}
                    {getPriorityBadge(rfq)}
                  </td>
                  <td>
                    <small className="text-muted">
                      <FiCalendar className="me-1" size={12} />
                      {new Date(rfq.createdAt).toLocaleDateString()}
                    </small>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0"
                        onClick={() => {
                          setSelectedRFQ(rfq);
                          setShowDetailModal(true);
                        }}
                      >
                        <FiEye size={18} />
                      </Button>
                      {(rfq.status === "pending" || rfq.status === "under_review") && (
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 text-success"
                          onClick={() => {
                            setSelectedRFQ(rfq);
                            setResponseData({
                              quotePricePerKg: rfq.offeredPricePerKg,
                              message: "",
                            });
                            setShowResponseModal(true);
                          }}
                        >
                          <FiSend size={18} />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {rfqs.length === 0 && (
            <div className="text-center py-5">
              <FiFileText size={48} className="text-muted mb-3" />
              <p className="text-muted">No RFQs received yet</p>
              <p className="text-muted small">
                When buyers request quotes for your gold, they will appear here.
              </p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* RFQ Detail Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>RFQ Details - {selectedRFQ?.rfqNumber}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRFQ && (
            <div>
              <div className="bg-light p-3 rounded mb-4">
                <Row>
                  <Col md={4}>
                    <strong>Status:</strong>
                    <div>{getStatusBadge(selectedRFQ.status)}</div>
                  </Col>
                  <Col md={4}>
                    <strong>Received:</strong>
                    <div>{new Date(selectedRFQ.createdAt).toLocaleString()}</div>
                  </Col>
                  <Col md={4}>
                    <strong>Valid Until:</strong>
                    <div>{new Date(selectedRFQ.validUntil).toLocaleDateString()}</div>
                  </Col>
                </Row>
              </div>

              <h6 className="fw-bold mb-3">Buyer Information</h6>
              <div className="bg-light p-3 rounded mb-4">
                <Row>
                  <Col md={6}>
                    <strong>Name:</strong>
                    <p>{selectedRFQ.buyer?.fullName}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Email:</strong>
                    <p>{selectedRFQ.buyer?.email}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Phone:</strong>
                    <p>{selectedRFQ.buyer?.phone || "N/A"}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Company:</strong>
                    <p>{selectedRFQ.buyerProfile?.companyName || "N/A"}</p>
                  </Col>
                </Row>
              </div>

              <h6 className="fw-bold mb-3">Request Details</h6>
              <div className="bg-light p-3 rounded mb-4">
                <Row>
                  <Col md={4}>
                    <div className="text-center p-2 border rounded">
                      <small className="text-muted">Weight</small>
                      <h5 className="fw-bold mb-0">{selectedRFQ.requestedWeightKg} kg</h5>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="text-center p-2 border rounded">
                      <small className="text-muted">Offer Price</small>
                      <h5 className="fw-bold text-primary mb-0">
                        {formatNaira(selectedRFQ.offeredPricePerKg)}/kg
                      </h5>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="text-center p-2 border rounded">
                      <small className="text-muted">Total Value</small>
                      <h5 className="fw-bold text-success mb-0">
                        {formatNaira(selectedRFQ.offeredTotalPrice || 0)}
                      </h5>
                    </div>
                  </Col>
                </Row>
              </div>

              {selectedRFQ.message && (
                <Alert variant="info">
                  <strong>Buyer Message:</strong>
                  <p className="mb-0 mt-1">{selectedRFQ.message}</p>
                </Alert>
              )}

              {selectedRFQ.staffResponse && (
                <Alert variant="success">
                  <strong>Your Response:</strong>
                  <p className="mb-0 mt-1">{selectedRFQ.staffResponse}</p>
                  {selectedRFQ.quotePricePerKg && (
                    <small className="text-muted">
                      Quoted Price: {formatNaira(selectedRFQ.quotePricePerKg)}/kg
                    </small>
                  )}
                </Alert>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {(selectedRFQ?.status === "pending" || selectedRFQ?.status === "under_review") && (
            <Button variant="success" onClick={() => {
              setShowDetailModal(false);
              setShowResponseModal(true);
            }}>
              <FiSend className="me-2" />
              Send Quote
            </Button>
          )}
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Response Modal */}
      <Modal show={showResponseModal} onHide={() => setShowResponseModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Send Quote to Buyer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRFQ && (
            <Form>
              <Alert variant="info">
                <strong>RFQ: {selectedRFQ.rfqNumber}</strong>
                <p className="mb-0 mt-2">
                  Buyer: {selectedRFQ.buyer?.fullName}<br />
                  Requested: {selectedRFQ.requestedWeightKg} kg @ {formatNaira(selectedRFQ.offeredPricePerKg)}/kg
                </p>
              </Alert>

              <Form.Group className="mb-3">
                <Form.Label>Your Quote Price (per kg) *</Form.Label>
                <InputGroup>
                  <InputGroup.Text>₦</InputGroup.Text>
                  <Form.Control
                    type="number"
                    step="100"
                    placeholder="Enter your quote price"
                    value={responseData.quotePricePerKg}
                    onChange={(e) => setResponseData({ ...responseData, quotePricePerKg: e.target.value })}
                    required
                  />
                </InputGroup>
                {responseData.quotePricePerKg && (
                  <Form.Text className="text-muted">
                    Total Quote: {formatNaira(responseData.quotePricePerKg * selectedRFQ.requestedWeightKg)}
                  </Form.Text>
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Message to Buyer *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Enter your response to the buyer..."
                  value={responseData.message}
                  onChange={(e) => setResponseData({ ...responseData, message: e.target.value })}
                  required
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResponseModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleRespond}>
            <FiSend className="me-2" />
            Send Quote
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SupplierRFQsReceived;