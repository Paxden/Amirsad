/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
import  { useState, useEffect } from "react";
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
  Tabs,
  Tab,
} from "react-bootstrap";
import {
  FiFileText,
  FiSearch,
  FiFilter,
  FiMoreVertical,
  FiCheckCircle,
  FiClock,
  FiEye,
  FiEdit2,
  FiRefreshCw,
  FiDollarSign,
  FiUser,
  FiCalendar,
  
  FiSend,
  
} from "react-icons/fi";
import PageHeader from "../../components/PageHeader";
import toast from "react-hot-toast";

const AdminRFQs = () => {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRFQ, setSelectedRFQ] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRespondModal, setShowRespondModal] = useState(false);
  const [responseData, setResponseData] = useState({
    quotePricePerKg: "",
    staffResponse: "",
    staffNotes: "",
  });
  const [filters, setFilters] = useState({
    status: "",
    buyer: "",
    supplier: "",
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
    fetchStats();
  }, [filters]);

  const fetchRFQs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.buyer) queryParams.append("buyer", filters.buyer);
      if (filters.supplier) queryParams.append("supplier", filters.supplier);
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
      }
    } catch (error) {
      console.error("Failed to fetch RFQs:", error);
      toast.error("Failed to load RFQs");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/rfqs/admin/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats || {});
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
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
          body: JSON.stringify(responseData),
        }
      );
      const data = await response.json();
      if (data.success) {
        toast.success("Response sent to buyer");
        setShowRespondModal(false);
        setResponseData({ quotePricePerKg: "", staffResponse: "", staffNotes: "" });
        fetchRFQs();
        fetchStats();
      }
    } catch (error) {
        console.log(error);
        
      toast.error("Failed to send response");
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
      closed: "secondary",
      cancelled: "danger",
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
      closed: "Closed",
      cancelled: "Cancelled",
    };
    return <Badge bg={variants[status] || "secondary"}>{labels[status] || status}</Badge>;
  };

  const getPriorityBadge = (rfq) => {
    const totalValue = rfq.offeredTotalPrice || 0;
    if (totalValue > 100000) return <Badge bg="danger">High Value</Badge>;
    if (totalValue > 50000) return <Badge bg="warning">Medium Value</Badge>;
    return <Badge bg="info">Standard</Badge>;
  };

  const statCards = [
    {
      title: "Total RFQs",
      value: stats.totalRFQs || 0,
      icon: FiFileText,
      color: "primary",
    },
    {
      title: "Pending",
      value: stats.pendingCount || 0,
      icon: FiClock,
      color: "warning",
    },
    {
      title: "Accepted",
      value: stats.acceptedRFQs || 0,
      icon: FiCheckCircle,
      color: "success",
    },
    {
      title: "Total Value",
      value: `$${((stats.totalValue || 0) / 1000000).toFixed(2)}M`,
      icon: FiDollarSign,
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
        title="RFQ Management"
        breadcrumbs={[{ label: "Admin" }, { label: "RFQs" }]}
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
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <FiSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by RFQ number..."
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
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="quoted">Quoted</option>
                <option value="negotiation">Negotiation</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Control
                type="text"
                placeholder="Buyer name"
                value={filters.buyer}
                onChange={(e) => setFilters({ ...filters, buyer: e.target.value })}
              />
            </Col>
            <Col md={2}>
              <Button variant="outline-secondary" onClick={fetchRFQs} className="w-100">
                <FiFilter className="me-2" />
                Apply
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* RFQ Tabs */}
      <Tabs
        defaultActiveKey="all"
        className="mb-4"
        onSelect={(key) => setFilters({ ...filters, status: key === "all" ? "" : key })}
      >
        <Tab eventKey="all" title="All RFQs" />
        <Tab eventKey="pending" title="Pending" />
        <Tab eventKey="under_review" title="Under Review" />
        <Tab eventKey="quoted" title="Quoted" />
        <Tab eventKey="accepted" title="Accepted" />
      </Tabs>

      {/* RFQ Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>RFQ #</th>
                <th>Buyer</th>
                <th>Supplier</th>
                <th>Weight (kg)</th>
                <th>Offer Price</th>
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
                  </td>
                  <td>
                    <div>
                      <FiUser className="me-1" size={12} />
                      {rfq.buyer?.fullName || "N/A"}
                    </div>
                    <small className="text-muted">{rfq.buyer?.email}</small>
                  </td>
                  <td>
                    <div>{rfq.supplier?.fullName || "N/A"}</div>
                    <small className="text-muted">{rfq.inventory?.inventoryNumber}</small>
                  </td>
                  <td>
                    <div className="fw-bold">{rfq.requestedWeightKg} kg</div>
                    <small className="text-muted">Requested</small>
                  </td>
                  <td>
                    <div className="fw-bold text-primary">
                      ${rfq.offeredPricePerKg?.toLocaleString()}/kg
                    </div>
                    <small>Total: ${(rfq.offeredTotalPrice || 0).toLocaleString()}</small>
                  </td>
                  <td>
                    {getStatusBadge(rfq.status)}
                    <div className="mt-1">{getPriorityBadge(rfq)}</div>
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
                        <Dropdown.Item onClick={() => {
                          setSelectedRFQ(rfq);
                          setShowDetailModal(true);
                        }}>
                          <FiEye className="me-2" /> View Details
                        </Dropdown.Item>
                        {(rfq.status === "pending" || rfq.status === "under_review") && (
                          <Dropdown.Item onClick={() => {
                            setSelectedRFQ(rfq);
                            setShowRespondModal(true);
                          }}>
                            <FiSend className="me-2 text-success" /> Send Quote
                          </Dropdown.Item>
                        )}
                        {rfq.status === "quoted" && (
                          <Dropdown.Item>
                            <FiEdit2 className="me-2 text-warning" /> Update Quote
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
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>RFQ Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRFQ && (
            <div>
              <div className="bg-light p-3 rounded mb-4">
                <Row>
                  <Col md={6}>
                    <strong>RFQ Number:</strong>
                    <p>{selectedRFQ.rfqNumber}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Status:</strong>
                    <p>{getStatusBadge(selectedRFQ.status)}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Created:</strong>
                    <p>{new Date(selectedRFQ.createdAt).toLocaleString()}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Valid Until:</strong>
                    <p>{new Date(selectedRFQ.validUntil).toLocaleDateString()}</p>
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

              <h6 className="fw-bold mb-3">RFQ Details</h6>
              <div className="bg-light p-3 rounded mb-4">
                <Row>
                  <Col md={4}>
                    <div className="text-center">
                      <small className="text-muted">Requested Weight</small>
                      <h5 className="fw-bold mb-0">{selectedRFQ.requestedWeightKg} kg</h5>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="text-center">
                      <small className="text-muted">Offer Price/kg</small>
                      <h5 className="fw-bold text-primary mb-0">
                        ${selectedRFQ.offeredPricePerKg?.toLocaleString()}
                      </h5>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="text-center">
                      <small className="text-muted">Total Value</small>
                      <h5 className="fw-bold text-success mb-0">
                        ${(selectedRFQ.offeredTotalPrice || 0).toLocaleString()}
                      </h5>
                    </div>
                  </Col>
                </Row>
              </div>

              <h6 className="fw-bold mb-3">Delivery Preferences</h6>
              <div className="bg-light p-3 rounded mb-4">
                <Row>
                  <Col md={6}>
                    <strong>Delivery Terms:</strong>
                    <p>{selectedRFQ.deliveryTerms || "Not specified"}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Inspection Required:</strong>
                    <p>{selectedRFQ.inspectionRequired ? "Yes" : "No"}</p>
                  </Col>
                  <Col md={12}>
                    <strong>Message from Buyer:</strong>
                    <p className="mb-0">{selectedRFQ.message || "No message"}</p>
                  </Col>
                </Row>
              </div>

              {selectedRFQ.staffResponse && (
                <Alert variant="info">
                  <strong>Staff Response:</strong>
                  <p className="mb-0">{selectedRFQ.staffResponse}</p>
                  {selectedRFQ.quotePricePerKg && (
                    <small className="text-muted">
                      Quoted Price: ${selectedRFQ.quotePricePerKg}/kg
                    </small>
                  )}
                </Alert>
              )}

              {selectedRFQ.status === "accepted" && (
                <Alert variant="success">
                  <FiCheckCircle className="me-2" />
                  <strong>RFQ Accepted!</strong>
                  <p className="mb-0">This RFQ has been accepted and converted to a deal.</p>
                </Alert>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedRFQ?.status === "pending" && (
            <Button variant="success" onClick={() => {
              setShowDetailModal(false);
              setShowRespondModal(true);
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

      {/* Respond Modal */}
      <Modal show={showRespondModal} onHide={() => setShowRespondModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Respond to RFQ</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRFQ && (
            <div>
              <Alert variant="info">
                <strong>RFQ: {selectedRFQ.rfqNumber}</strong>
                <p className="mb-0 mt-2">
                  Buyer: {selectedRFQ.buyer?.fullName}<br />
                  Requested: {selectedRFQ.requestedWeightKg} kg @ ${selectedRFQ.offeredPricePerKg}/kg
                </p>
              </Alert>

              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Quote Price (per kg) *</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>$</InputGroup.Text>
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
                      Total Quote: ${(responseData.quotePricePerKg * selectedRFQ.requestedWeightKg).toLocaleString()}
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
                    onChange={(e) => setResponseData({ ...responseData, staffResponse: e.target.value })}
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
                    onChange={(e) => setResponseData({ ...responseData, staffNotes: e.target.value })}
                  />
                </Form.Group>
              </Form>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRespondModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleRespond}>
            <FiSend className="me-2" />
            Send Quote to Buyer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminRFQs;