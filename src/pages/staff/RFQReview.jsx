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
  Dropdown,
  Alert,
} from "react-bootstrap";
import {
  FiFileText,
  FiSearch,
  FiFilter,
  FiMoreVertical,
  FiEye,
  FiSend,
  FiRefreshCw,
  FiUser,
  FiCalendar,
  FiMessageSquare,
  FiClock,
  FiMail,
  FiPhone,
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

const StaffRFQReview = () => {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRFQ, setSelectedRFQ] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRespondModal, setShowRespondModal] = useState(false);
  const [showNegotiateModal, setShowNegotiateModal] = useState(false);
  const [responseData, setResponseData] = useState({
    quotePricePerKg: "",
    staffResponse: "",
    staffNotes: "",
  });
  const [negotiateData, setNegotiateData] = useState({
    pricePerKg: "",
    message: "",
  });
  const [filters, setFilters] = useState({
    status: "pending",
    search: "",
    priority: "",
  });
  const [stats, setStats] = useState({
    pending: 0,
    underReview: 0,
    quoted: 0,
    totalValue: 0,
  });

  useEffect(() => {
    fetchRFQs();
  }, [filters]);

  // Calculate stats from RFQs data
  const calculateStats = (rfqsData) => {
    if (rfqsData && rfqsData.length > 0) {
      const totalValue = rfqsData.reduce((sum, r) => sum + (r.offeredTotalPrice || 0), 0);
      
      setStats({
        pending: rfqsData.filter(r => r.status === "pending").length,
        underReview: rfqsData.filter(r => r.status === "under_review").length,
        quoted: rfqsData.filter(r => r.status === "quoted").length,
        totalValue: totalValue,
      });
    } else {
      setStats({
        pending: 0,
        underReview: 0,
        quoted: 0,
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
        `${import.meta.env.VITE_API_URL}/rfqs?${queryParams}`,
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
        `${import.meta.env.VITE_API_URL}/rfqs/${selectedRFQ._id}/respond`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            quotePricePerKg: parseFloat(responseData.quotePricePerKg),
            staffResponse: responseData.staffResponse,
            staffNotes: responseData.staffNotes,
          }),
        }
      );
      const data = await response.json();
      if (data.success) {
        toast.success("Quote sent to buyer successfully");
        setShowRespondModal(false);
        setResponseData({
          quotePricePerKg: "",
          staffResponse: "",
          staffNotes: "",
        });
        fetchRFQs();
      }
    } catch (error) {
      console.error("Respond error:", error);
      toast.error("Failed to send response");
    }
  };

  const handleNegotiate = async () => {
    if (!negotiateData.pricePerKg) {
      toast.error("Please enter a counter offer price");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/rfqs/${selectedRFQ._id}/negotiate`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pricePerKg: parseFloat(negotiateData.pricePerKg),
            message: negotiateData.message,
          }),
        }
      );
      const data = await response.json();
      if (data.success) {
        toast.success("Counter offer sent to buyer");
        setShowNegotiateModal(false);
        setNegotiateData({ pricePerKg: "", message: "" });
        fetchRFQs();
      }
    } catch (error) {
      console.error("Negotiate error:", error);
      toast.error("Failed to send counter offer");
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
      expired: "dark",
    };
    const labels = {
      draft: "Draft",
      pending: "Pending",
      under_review: "Under Review",
      quoted: "Quoted",
      negotiation: "Negotiation",
      accepted: "Accepted",
      rejected: "Rejected",
      expired: "Expired",
    };
    return (
      <Badge bg={variants[status] || "secondary"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getPriorityBadge = (rfq) => {
    const totalValue = rfq.offeredTotalPrice || 0;
    if (totalValue > 100000) {
      return (
        <Badge bg="danger" className="ms-2">
          High Value
        </Badge>
      );
    }
    if (totalValue > 50000) {
      return (
        <Badge bg="warning" className="ms-2">
          Medium Value
        </Badge>
      );
    }
    return null;
  };

  const statCards = [
    {
      title: "Pending Review",
      value: stats.pending || 0,
      icon: FiClock,
      color: "warning",
      description: "RFQs awaiting response",
    },
    {
      title: "Under Review",
      value: stats.underReview || 0,
      icon: FiEye,
      color: "info",
      description: "Being analyzed",
    },
    {
      title: "Quoted",
      value: stats.quoted || 0,
      icon: FiSend,
      color: "primary",
      description: "Quotes sent",
    },
    {
      title: "Total Value",
      value: formatNairaMillions(stats.totalValue || 0),
      icon: FaHashtag,
      color: "success",
      description: "Pending RFQ value",
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
        title="RFQ Review"
        breadcrumbs={[{ label: "Staff" }, { label: "RFQ Review" }]}
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
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="text-muted mb-1 small">{stat.title}</p>
                    <h3 className="fw-bold mb-0">{stat.value}</h3>
                    <small className="text-muted">{stat.description}</small>
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
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
              >
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="quoted">Quoted</option>
                <option value="negotiation">Negotiation</option>
                <option value="all">All RFQs</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button
                variant="outline-secondary"
                onClick={fetchRFQs}
                className="w-100"
              >
                <FiFilter className="me-2" />
                Apply
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
                <th>Buyer Info</th>
                <th>Request Details</th>
                <th>Offer</th>
                <th>Status</th>
                <th>Submitted</th>
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
                    <small className="text-muted">
                      <FiMail className="me-1" size={12} />
                      {rfq.buyer?.email}
                    </small>
                    {rfq.buyer?.phone && (
                      <div className="small text-muted">
                        <FiPhone className="me-1" size={12} />
                        {rfq.buyer.phone}
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="fw-bold">{rfq.requestedWeightKg} kg</div>
                    <small className="text-muted">
                      {rfq.inventory?.purity}% purity
                    </small>
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
                    <small>
                      Total: {formatNaira(rfq.offeredTotalPrice || 0)}
                    </small>
                    {rfq.quotePricePerKg && (
                      <div className="small text-success">
                        Quoted: {formatNaira(rfq.quotePricePerKg)}/kg
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
                    <Dropdown align="end">
                      <Dropdown.Toggle variant="link" className="text-dark p-0">
                        <FiMoreVertical size={18} />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item
                          onClick={() => {
                            setSelectedRFQ(rfq);
                            setShowDetailModal(true);
                          }}
                        >
                          <FiEye className="me-2" /> View Details
                        </Dropdown.Item>
                        {(rfq.status === "pending" ||
                          rfq.status === "under_review") && (
                          <Dropdown.Item
                            onClick={() => {
                              setSelectedRFQ(rfq);
                              setShowRespondModal(true);
                            }}
                          >
                            <FiSend className="me-2 text-success" /> Send Quote
                          </Dropdown.Item>
                        )}
                        {rfq.status === "quoted" && (
                          <Dropdown.Item
                            onClick={() => {
                              setSelectedRFQ(rfq);
                              setShowNegotiateModal(true);
                            }}
                          >
                            <FiMessageSquare className="me-2 text-warning" />{" "}
                            Counter Offer
                          </Dropdown.Item>
                        )}
                        {rfq.status === "negotiation" && (
                          <Dropdown.Item
                            onClick={() => {
                              setSelectedRFQ(rfq);
                              setShowRespondModal(true);
                            }}
                          >
                            <FiSend className="me-2 text-primary" /> Update
                            Quote
                          </Dropdown.Item>
                        )}
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {rfqs.length === 0 && (
            <div className="text-center py-5">
              <FiFileText size={48} className="text-muted mb-3" />
              <p className="text-muted">No RFQs found</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* RFQ Detail Modal */}
      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>RFQ Details - {selectedRFQ?.rfqNumber}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRFQ && (
            <div>
              {/* Header */}
              <div className="bg-light p-3 rounded mb-4">
                <Row>
                  <Col md={4}>
                    <strong>Status:</strong>
                    <div>{getStatusBadge(selectedRFQ.status)}</div>
                  </Col>
                  <Col md={4}>
                    <strong>Created:</strong>
                    <div>
                      {new Date(selectedRFQ.createdAt).toLocaleString()}
                    </div>
                  </Col>
                  <Col md={4}>
                    <strong>Valid Until:</strong>
                    <div>
                      {new Date(selectedRFQ.validUntil).toLocaleDateString()}
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Buyer Information */}
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

              {/* RFQ Details */}
              <h6 className="fw-bold mb-3">Request Details</h6>
              <div className="bg-light p-3 rounded mb-4">
                <Row>
                  <Col md={4}>
                    <div className="text-center p-2 border rounded">
                      <small className="text-muted">Weight</small>
                      <h5 className="fw-bold mb-0">
                        {selectedRFQ.requestedWeightKg} kg
                      </h5>
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

              {/* Inventory Details */}
              <h6 className="fw-bold mb-3">Inventory Information</h6>
              <div className="bg-light p-3 rounded mb-4">
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

              {/* Message */}
              {selectedRFQ.message && (
                <Alert variant="info">
                  <strong>Buyer Message:</strong>
                  <p className="mb-0 mt-1">{selectedRFQ.message}</p>
                </Alert>
              )}

              {/* Staff Response */}
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

              {/* Negotiation History */}
              {selectedRFQ.negotiationHistory &&
                selectedRFQ.negotiationHistory.length > 0 && (
                  <>
                    <h6 className="fw-bold mb-3">Negotiation History</h6>
                    <div className="bg-light p-3 rounded">
                      {selectedRFQ.negotiationHistory.map((item, index) => (
                        <div key={index} className="mb-2 pb-2 border-bottom">
                          <div className="d-flex justify-content-between">
                            <strong>Round {item.round}</strong>
                            <small>
                              {new Date(item.createdAt).toLocaleString()}
                            </small>
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
          {selectedRFQ &&
            (selectedRFQ.status === "pending" ||
              selectedRFQ.status === "under_review") && (
              <Button
                variant="success"
                onClick={() => {
                  setShowDetailModal(false);
                  setShowRespondModal(true);
                }}
              >
                <FiSend className="me-2" />
                Send Quote
              </Button>
            )}
          {selectedRFQ?.status === "quoted" && (
            <Button
              variant="warning"
              onClick={() => {
                setShowDetailModal(false);
                setShowNegotiateModal(true);
              }}
            >
              <FiMessageSquare className="me-2" />
              Counter Offer
            </Button>
          )}
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Send Quote Modal */}
      <Modal
        show={showRespondModal}
        onHide={() => setShowRespondModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Send Quote to Buyer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRFQ && (
            <div>
              <Alert variant="info">
                <strong>RFQ: {selectedRFQ.rfqNumber}</strong>
                <p className="mb-0 mt-2">
                  Buyer: {selectedRFQ.buyer?.fullName}
                  <br />
                  Requested: {selectedRFQ.requestedWeightKg} kg @{" "}
                  {formatNaira(selectedRFQ.offeredPricePerKg)}/kg
                </p>
              </Alert>

              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Your Quote Price (per kg) *</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>₦</InputGroup.Text>
                    <Form.Control
                      type="number"
                      step="100"
                      placeholder="Enter your quote price"
                      value={responseData.quotePricePerKg}
                      onChange={(e) =>
                        setResponseData({
                          ...responseData,
                          quotePricePerKg: e.target.value,
                        })
                      }
                      required
                    />
                  </InputGroup>
                  {responseData.quotePricePerKg && (
                    <Form.Text className="text-muted">
                      Total Quote:{" "}
                      {formatNaira(
                        responseData.quotePricePerKg *
                          selectedRFQ.requestedWeightKg
                      )}
                    </Form.Text>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Response Message *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Enter your response to the buyer..."
                    value={responseData.staffResponse}
                    onChange={(e) =>
                      setResponseData({
                        ...responseData,
                        staffResponse: e.target.value,
                      })
                    }
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Internal Notes (Staff only)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Add internal notes..."
                    value={responseData.staffNotes}
                    onChange={(e) =>
                      setResponseData({
                        ...responseData,
                        staffNotes: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Form>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowRespondModal(false)}
          >
            Cancel
          </Button>
          <Button variant="success" onClick={handleRespond}>
            <FiSend className="me-2" />
            Send Quote to Buyer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Counter Offer Modal */}
      <Modal
        show={showNegotiateModal}
        onHide={() => setShowNegotiateModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Send Counter Offer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRFQ && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Original Quote</Form.Label>
                <div className="bg-light p-2 rounded">
                  {formatNaira(selectedRFQ.quotePricePerKg)}/kg
                </div>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Your Counter Offer (per kg) *</Form.Label>
                <InputGroup>
                  <InputGroup.Text>₦</InputGroup.Text>
                  <Form.Control
                    type="number"
                    step="100"
                    placeholder="Enter counter offer price"
                    value={negotiateData.pricePerKg}
                    onChange={(e) =>
                      setNegotiateData({
                        ...negotiateData,
                        pricePerKg: e.target.value,
                      })
                    }
                    required
                  />
                </InputGroup>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Message *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Explain your counter offer..."
                  value={negotiateData.message}
                  onChange={(e) =>
                    setNegotiateData({
                      ...negotiateData,
                      message: e.target.value,
                    })
                  }
                  required
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowNegotiateModal(false)}
          >
            Cancel
          </Button>
          <Button variant="warning" onClick={handleNegotiate}>
            <FiSend className="me-2" />
            Send Counter Offer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default StaffRFQReview;