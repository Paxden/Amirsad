/* eslint-disable no-unused-vars */
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
  FiRefreshCw,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiSend,
  FiPackage,
  FiTrendingUp,
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

const BuyerMyRFQs = () => {
  const navigate = useNavigate();
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRFQ, setSelectedRFQ] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    search: "",
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    quoted: 0,
    accepted: 0,
    rejected: 0,
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
        rejected: rfqsData.filter(r => r.status === "rejected" || r.status === "cancelled").length,
        totalValue: rfqsData.reduce((sum, r) => sum + (r.offeredTotalPrice || 0), 0),
      };
      setStats(statsData);
    } else {
      setStats({
        total: 0,
        pending: 0,
        quoted: 0,
        accepted: 0,
        rejected: 0,
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
        `${import.meta.env.VITE_API_URL}/rfqs/my-rfqs?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setRfqs(data.rfqs || []);
        calculateStats(data.rfqs || []);
      }
    } catch (error) {
      console.error("Failed to fetch RFQs:", error);
      toast.error("Failed to load RFQs");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRFQ = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/rfqs/${selectedRFQ._id}/accept`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        toast.success("RFQ accepted! A deal will be created.");
        setShowAcceptModal(false);
        fetchRFQs();
      }
    } catch (error) {
      console.error("Accept error:", error);
      toast.error("Failed to accept RFQ");
    }
  };

  const handleCancelRFQ = async () => {
    if (!cancelReason) {
      toast.error("Please provide a cancellation reason");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/rfqs/${selectedRFQ._id}/cancel`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason: cancelReason }),
        }
      );
      const data = await response.json();
      if (data.success) {
        toast.success("RFQ cancelled");
        setShowCancelModal(false);
        setCancelReason("");
        fetchRFQs();
      }
    } catch (error) {
      console.error("Cancel error:", error);
      toast.error("Failed to cancel RFQ");
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      draft: "secondary",
      pending: "warning",
      under_review: "info",
      quoted: "primary",
      negotiation: "warning",
      accepted: "success",
      rejected: "danger",
      expired: "secondary",
      cancelled: "danger",
    };
    const labels = {
      draft: "Draft",
      pending: "Pending Response",
      under_review: "Under Review",
      quoted: "Quoted",
      negotiation: "Negotiation",
      accepted: "Accepted",
      rejected: "Rejected",
      expired: "Expired",
      cancelled: "Cancelled",
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
      title: "Quoted",
      value: stats.quoted || 0,
      icon: FiSend,
      color: "info",
    },
    {
      title: "Total Value",
      value: formatNairaMillions(stats.totalValue || 0),
      icon: FaHashtag,
      color: "success",
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
        title="My RFQs"
        breadcrumbs={[{ label: "Buyer" }, { label: "My RFQs" }]}
        actions={
          <Button variant="outline-secondary" onClick={fetchRFQs}>
            <FiRefreshCw className="me-2" />
            Refresh
          </Button>
        }
      />

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        {statCards.map((stat, index) => (
          <Col md={6} lg={3} key={index}>
            <Card className="border-0 shadow-sm stat-card">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-1 small">{stat.title}</p>
                    <h3 className="fw-bold mb-0">{stat.value}</h3>
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

      {/* Quick Stats Summary */}
      <Card className="border-0 shadow-sm mb-4 bg-gradient-info">
        <Card.Body>
          <Row className="align-items-center text-center text-md-start">
            <Col md={8}>
              <h5 className="fw-bold text-white mb-2">📋 RFQ Summary</h5>
              <p className="text-white-50 mb-0">
                You have <strong className="text-white">{stats.total}</strong> total RFQs, 
                with <strong className="text-warning">{stats.pending}</strong> pending and 
                <strong className="text-success"> {stats.accepted}</strong> accepted
              </p>
            </Col>
            <Col md={4} className="text-md-end">
              <Badge bg="light" className="text-dark px-4 py-2">
                <FiTrendingUp className="me-1" />
                {stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0}% Success
              </Badge>
            </Col>
          </Row>
        </Card.Body>
      </Card>

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
                  placeholder="Search by RFQ number or inventory..."
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
                <option value="cancelled">Cancelled</option>
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
                <th>Inventory</th>
                <th>Weight</th>
                <th>Your Offer</th>
                <th>Quote Price</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rfqs.map((rfq) => (
                <tr key={rfq._id}>
                  <td>
                    <div className="fw-bold">{rfq.rfqNumber}</div>
                    <small className="text-muted">{rfq._id?.slice(-6)}</small>
                    {getPriorityBadge(rfq)}
                  </td>
                  <td>
                    <div className="small">
                      <FiPackage className="me-1" size={12} />
                      {rfq.inventory?.inventoryNumber || "N/A"}
                    </div>
                    <small className="text-muted">
                      {rfq.inventory?.purity}% purity
                    </small>
                  </td>
                  <td>
                    <div className="fw-bold">{rfq.requestedWeightKg} kg</div>
                  </td>
                  <td>
                    <div className="fw-bold text-primary">
                      {formatNaira(rfq.offeredPricePerKg)}/kg
                    </div>
                    <small>Total: {formatNaira(rfq.offeredTotalPrice || 0)}</small>
                  </td>
                  <td>
                    {rfq.quotePricePerKg ? (
                      <>
                        <div className="fw-bold text-success">
                          {formatNaira(rfq.quotePricePerKg)}/kg
                        </div>
                        <small>Total: {formatNaira(rfq.quotePricePerKg * rfq.requestedWeightKg)}</small>
                      </>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td>{getStatusBadge(rfq.status)}</td>
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
                      {rfq.status === "quoted" && (
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 text-success"
                          onClick={() => {
                            setSelectedRFQ(rfq);
                            setShowAcceptModal(true);
                          }}
                        >
                          <FiCheckCircle size={18} />
                        </Button>
                      )}
                      {(rfq.status === "pending" || rfq.status === "quoted") && (
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 text-danger"
                          onClick={() => {
                            setSelectedRFQ(rfq);
                            setShowCancelModal(true);
                          }}
                        >
                          <FiXCircle size={18} />
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
              <p className="text-muted">No RFQs found</p>
              <p className="text-muted small">
                Go to the <a href="/buyer/inventory">Gold Inventory</a> page to create your first RFQ.
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
              {/* Header */}
              <div className="bg-light p-3 rounded-3 mb-4">
                <Row>
                  <Col md={4}>
                    <strong>Status:</strong>
                    <div>{getStatusBadge(selectedRFQ.status)}</div>
                  </Col>
                  <Col md={4}>
                    <strong>Created:</strong>
                    <div>{new Date(selectedRFQ.createdAt).toLocaleString()}</div>
                  </Col>
                  <Col md={4}>
                    <strong>Valid Until:</strong>
                    <div>{new Date(selectedRFQ.validUntil).toLocaleDateString()}</div>
                  </Col>
                </Row>
              </div>

              {/* Inventory Information */}
              <h6 className="fw-bold mb-3">Gold Inventory</h6>
              <div className="bg-light p-3 rounded-3 mb-4">
                <Row>
                  <Col md={6}>
                    <strong>Inventory #:</strong>
                    <p>{selectedRFQ.inventory?.inventoryNumber}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Purity:</strong>
                    <p>{selectedRFQ.inventory?.purity}%</p>
                  </Col>
                  <Col md={6}>
                    <strong>Location:</strong>
                    <p>{selectedRFQ.inventory?.location}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Available Weight:</strong>
                    <p>{selectedRFQ.inventory?.availableWeightKg} kg</p>
                  </Col>
                </Row>
              </div>

              {/* RFQ Details */}
              <h6 className="fw-bold mb-3">Your Request</h6>
              <div className="bg-light p-3 rounded-3 mb-4">
                <Row>
                  <Col md={4}>
                    <div className="text-center p-2 border rounded">
                      <small className="text-muted">Weight</small>
                      <h5 className="fw-bold mb-0">{selectedRFQ.requestedWeightKg} kg</h5>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="text-center p-2 border rounded">
                      <small className="text-muted">Your Offer</small>
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

              {/* Staff Quote */}
              {selectedRFQ.quotePricePerKg && (
                <>
                  <h6 className="fw-bold mb-3">AMIRSAD Quote</h6>
                  <div className="bg-light p-3 rounded-3 mb-4">
                    <Row>
                      <Col md={6}>
                        <div className="p-2">
                          <small className="text-muted">Quote Price</small>
                          <h4 className="fw-bold text-success mb-0">
                            {formatNaira(selectedRFQ.quotePricePerKg)}/kg
                          </h4>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="p-2">
                          <small className="text-muted">Total Quote</small>
                          <h4 className="fw-bold text-primary mb-0">
                            {formatNaira(selectedRFQ.quotePricePerKg * selectedRFQ.requestedWeightKg)}
                          </h4>
                        </div>
                      </Col>
                      {selectedRFQ.staffResponse && (
                        <Col md={12}>
                          <strong>Response:</strong>
                          <p className="mb-0">{selectedRFQ.staffResponse}</p>
                        </Col>
                      )}
                    </Row>
                  </div>
                </>
              )}

              {/* Your Message */}
              {selectedRFQ.message && (
                <Alert variant="info" className="border-0">
                  <strong>Your Message:</strong>
                  <p className="mb-0 mt-1">{selectedRFQ.message}</p>
                </Alert>
              )}

              {/* Negotiation History */}
              {selectedRFQ.negotiationHistory && selectedRFQ.negotiationHistory.length > 0 && (
                <>
                  <h6 className="fw-bold mb-3">Negotiation History</h6>
                  <div className="bg-light p-3 rounded-3">
                    {selectedRFQ.negotiationHistory.map((item, index) => (
                      <div key={index} className="mb-2 pb-2 border-bottom">
                        <div className="d-flex justify-content-between">
                          <strong>Round {item.round}</strong>
                          <small>{new Date(item.createdAt).toLocaleString()}</small>
                        </div>
                        <div>Price: {formatNaira(item.pricePerKg)}/kg</div>
                        <div className="small text-muted">{item.message}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedRFQ?.status === "quoted" && (
            <Button variant="success" onClick={() => {
              setShowDetailModal(false);
              setShowAcceptModal(true);
            }}>
              <FiCheckCircle className="me-2" />
              Accept Quote
            </Button>
          )}
          {(selectedRFQ?.status === "pending" || selectedRFQ?.status === "quoted") && (
            <Button variant="danger" onClick={() => {
              setShowDetailModal(false);
              setShowCancelModal(true);
            }}>
              <FiXCircle className="me-2" />
              Cancel RFQ
            </Button>
          )}
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Accept Modal */}
      <Modal show={showAcceptModal} onHide={() => setShowAcceptModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Accept Quote</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="success" className="border-0">
            <FiCheckCircle size={20} className="me-2" />
            <strong>Are you sure you want to accept this quote?</strong>
          </Alert>
          {selectedRFQ && (
            <div className="bg-light p-3 rounded-3">
              <div className="d-flex justify-content-between mb-2">
                <span>Quote Price:</span>
                <span className="fw-bold">{formatNaira(selectedRFQ.quotePricePerKg)}/kg</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Total:</span>
                <span className="fw-bold text-success">
                  {formatNaira(selectedRFQ.quotePricePerKg * selectedRFQ.requestedWeightKg)}
                </span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Weight:</span>
                <span className="fw-bold">{selectedRFQ.requestedWeightKg} kg</span>
              </div>
            </div>
          )}
          <p className="mt-3 text-muted small">
            By accepting, a deal will be created and you can proceed with the transaction.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAcceptModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleAcceptRFQ}>
            <FiCheckCircle className="me-2" />
            Accept Quote
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Cancel Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cancel RFQ</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning" className="border-0">
            <strong>Are you sure you want to cancel this RFQ?</strong>
            <p className="mb-0 mt-1 small">This action cannot be undone.</p>
          </Alert>
          <Form.Group className="mb-3">
            <Form.Label>Cancellation Reason *</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Please explain why you're cancelling this RFQ..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Keep RFQ
          </Button>
          <Button variant="danger" onClick={handleCancelRFQ}>
            <FiXCircle className="me-2" />
            Cancel RFQ
          </Button>
        </Modal.Footer>
      </Modal>

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
        .bg-gradient-info {
          background: linear-gradient(135deg, #2a9d8f, #264653);
          border: none;
        }
      `}</style>
    </div>
  );
};

export default BuyerMyRFQs;