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
  FiPackage,
  FiSearch,
  FiFilter,
  FiMoreVertical,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiEdit2,
  FiRefreshCw,
  FiMapPin,
  FiUser,
  FiCalendar,
  FiClock,
  FiTrendingUp,
  FiDownload,
} from "react-icons/fi";
import PageHeader from "../../components/PageHeader";
import toast from "react-hot-toast";

const AdminOpportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [approveNotes, setApproveNotes] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    supplier: "",
    search: "",
    dateRange: "",
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalWeight: 0,
    totalValue: 0,
  });

  useEffect(() => {
    fetchOpportunities();
    fetchStats();
  }, [filters]);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.supplier) queryParams.append("supplier", filters.supplier);
      if (filters.search) queryParams.append("search", filters.search);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/opportunities?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setOpportunities(data.opportunities || []);
      }
    } catch (error) {
      console.error("Failed to fetch opportunities:", error);
      toast.error("Failed to load opportunities");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/opportunities/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
       console.log("Stats response status:", response.status); // Debug log
      const data = await response.json();
        console.log("Stats data:", data); 
      if (data.success) {
        setStats(data.stats || {});
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const handleApprove = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/opportunities/${selectedOpportunity._id}/approve`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ notes: approveNotes }),
        }
      );
      const data = await response.json();
      if (data.success) {
        toast.success("Opportunity approved successfully");
        setShowApproveModal(false);
        setApproveNotes("");
        fetchOpportunities();
        fetchStats();
      }
    } catch (error) {
        console.log(error)
      toast.error("Failed to approve opportunity");
    }
  };

  const handleReject = async () => {
    if (!rejectReason) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/opportunities/${selectedOpportunity._id}/reject`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ rejectionReason: rejectReason }),
        }
      );
      const data = await response.json();
      if (data.success) {
        toast.success("Opportunity rejected");
        setShowRejectModal(false);
        setRejectReason("");
        fetchOpportunities();
        fetchStats();
      }
    } catch (error) {
        console.log(error)

      toast.error("Failed to reject opportunity");
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: "warning",
      under_review: "info",
      approved: "success",
      rejected: "danger",
      expired: "secondary",
    };
    const labels = {
      pending: "Pending",
      under_review: "Under Review",
      approved: "Approved",
      rejected: "Rejected",
      expired: "Expired",
    };
    return <Badge bg={variants[status] || "secondary"}>{labels[status] || status}</Badge>;
  };

  const getPurityBadge = (purity) => {
    if (purity >= 99.9) return <Badge bg="success">Investment Grade</Badge>;
    if (purity >= 99) return <Badge bg="info">High Purity</Badge>;
    return <Badge bg="secondary">Standard</Badge>;
  };

  const statCards = [
    {
      title: "Total Opportunities",
      value: stats.total || 0,
      icon: FiPackage,
      color: "primary",
    },
    {
      title: "Pending Review",
      value: stats.pending || 0,
      icon: FiClock,
      color: "warning",
    },
    {
      title: "Approved",
      value: stats.approved || 0,
      icon: FiCheckCircle,
      color: "success",
    },
    {
      title: "Total Weight",
      value: `${(stats.totalWeight || 0).toFixed(1)} kg`,
      icon: FiTrendingUp,
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
        title="Opportunity Management"
        breadcrumbs={[{ label: "Admin" }, { label: "Opportunities" }]}
        actions={
          <div className="d-flex gap-2">
            <Button variant="outline-secondary" onClick={fetchOpportunities}>
              <FiRefreshCw className="me-2" />
              Refresh
            </Button>
            <Button variant="outline-primary" onClick={() => toast.info("Export feature coming soon")}>
              <FiDownload className="me-2" />
              Export
            </Button>
          </div>
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
                  placeholder="Search by title or supplier..."
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
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Control
                type="text"
                placeholder="Supplier name"
                value={filters.supplier}
                onChange={(e) => setFilters({ ...filters, supplier: e.target.value })}
              />
            </Col>
            <Col md={2}>
              <Button variant="outline-secondary" onClick={fetchOpportunities} className="w-100">
                <FiFilter className="me-2" />
                Apply
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabs */}
      <Tabs defaultActiveKey="pending" className="mb-4" onSelect={(k) => setFilters({ ...filters, status: k })}>
        <Tab eventKey="pending" title={`Pending (${stats.pending || 0})`} />
        <Tab eventKey="approved" title={`Approved (${stats.approved || 0})`} />
        <Tab eventKey="rejected" title={`Rejected (${stats.rejected || 0})`} />
        <Tab eventKey="" title="All Opportunities" />
      </Tabs>

      {/* Opportunities Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>Title</th>
                <th>Supplier</th>
                <th>Weight (kg)</th>
                <th>Purity</th>
                <th>Location</th>
                <th>Price/kg</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map((opp) => (
                <tr key={opp._id}>
                  <td>
                    <div className="fw-bold">{opp.title}</div>
                    <small className="text-muted">{opp._id?.slice(-6)}</small>
                  </td>
                  <td>
                    <div>
                      <FiUser className="me-1" size={12} />
                      {opp.supplier?.fullName || "N/A"}
                    </div>
                   
                  </td>
                  <td>
                    <div className="fw-bold">{opp.weightKg} kg</div>
                    <small className="text-muted">Available</small>
                  </td>
                  <td>
                    <div>{opp.purity}%</div>
                    {getPurityBadge(opp.purity)}
                  </td>
                  <td>
                    <FiMapPin className="me-1" size={12} />
                    {opp.location}
                  </td>
                  <td>
                    <div className="fw-bold text-success">
                      #{opp.askingPrice?.toLocaleString()}
                    </div>
                    <small>per kg</small>
                  </td>
                  <td>{getStatusBadge(opp.status)}</td>
                  <td>
                    <small className="text-muted">
                      <FiCalendar className="me-1" size={12} />
                      {new Date(opp.createdAt).toLocaleDateString()}
                    </small>
                  </td>
                  <td>
                    <Dropdown align="end">
                      <Dropdown.Toggle variant="link" className="text-dark p-0">
                        <FiMoreVertical size={18} />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => {
                          setSelectedOpportunity(opp);
                          setShowDetailModal(true);
                        }}>
                          <FiEye className="me-2" /> View Details
                        </Dropdown.Item>
                        {opp.status === "pending" && (
                          <>
                            <Dropdown.Item onClick={() => {
                              setSelectedOpportunity(opp);
                              setShowApproveModal(true);
                            }}>
                              <FiCheckCircle className="me-2 text-success" /> Approve
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => {
                              setSelectedOpportunity(opp);
                              setShowRejectModal(true);
                            }}>
                              <FiXCircle className="me-2 text-danger" /> Reject
                            </Dropdown.Item>
                          </>
                        )}
                        {opp.status === "approved" && (
                          <Dropdown.Item>
                            <FiEdit2 className="me-2" /> Edit Details
                          </Dropdown.Item>
                        )}
                        <Dropdown.Divider />
                        <Dropdown.Item className="text-danger" onClick={() => {
                          if (window.confirm("Delete this opportunity?")) {
                            // Handle delete
                          }
                        }}>
                          <FiXCircle className="me-2" /> Delete
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {opportunities.length === 0 && (
            <div className="text-center py-5">
              <FiPackage size={48} className="text-muted mb-3" />
              <p className="text-muted">No opportunities found</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Opportunity Detail Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Opportunity Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOpportunity && (
            <div>
              {/* Header */}
              <div className="bg-light p-3 rounded mb-4">
                <Row>
                  <Col md={6}>
                    <strong>Title:</strong>
                    <p>{selectedOpportunity.title}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Status:</strong>
                    <p>{getStatusBadge(selectedOpportunity.status)}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Submitted:</strong>
                    <p>{new Date(selectedOpportunity.createdAt).toLocaleString()}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Last Updated:</strong>
                    <p>{new Date(selectedOpportunity.updatedAt).toLocaleString()}</p>
                  </Col>
                </Row>
              </div>

              {/* Supplier Information */}
              <h6 className="fw-bold mb-3">Supplier Information</h6>
              <div className="bg-light p-3 rounded mb-4">
                <Row>
                  <Col md={6}>
                    <strong>Name:</strong>
                    <p>{selectedOpportunity.supplier?.fullName}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Email:</strong>
                    <p>{selectedOpportunity.supplier?.email}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Phone:</strong>
                    <p>{selectedOpportunity.supplier?.phone || "N/A"}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Company:</strong>
                    <p>{selectedOpportunity.supplier?.profile?.companyName || "N/A"}</p>
                  </Col>
                </Row>
              </div>

              {/* Gold Specifications */}
              <h6 className="fw-bold mb-3">Gold Specifications</h6>
              <div className="bg-light p-3 rounded mb-4">
                <Row>
                  <Col md={4}>
                    <div className="text-center p-2 border rounded">
                      <small className="text-muted">Weight</small>
                      <h4 className="fw-bold mb-0">{selectedOpportunity.weightKg} kg</h4>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="text-center p-2 border rounded">
                      <small className="text-muted">Purity</small>
                      <h4 className="fw-bold mb-0">{selectedOpportunity.purity}%</h4>
                      {getPurityBadge(selectedOpportunity.purity)}
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="text-center p-2 border rounded">
                      <small className="text-muted">Price per kg</small>
                      <h4 className="fw-bold text-success mb-0">
                        #{selectedOpportunity.askingPrice?.toLocaleString()}
                      </h4>
                    </div>
                  </Col>
                </Row>
              </div>

              <h6 className="fw-bold mb-3">Additional Information</h6>
              <div className="bg-light p-3 rounded mb-4">
                <Row>
                  <Col md={6}>
                    <strong>Location:</strong>
                    <p>{selectedOpportunity.location}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Gold Type:</strong>
                    <p>{selectedOpportunity.goldType || "Not specified"}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Form:</strong>
                    <p>{selectedOpportunity.form || "Not specified"}</p>
                  </Col>
                  <Col md={12}>
                    <strong>Description:</strong>
                    <p>{selectedOpportunity.description || "No description provided"}</p>
                  </Col>
                </Row>
              </div>

              {/* Rejection Reason */}
              {selectedOpportunity.status === "rejected" && selectedOpportunity.rejectionReason && (
                <Alert variant="danger">
                  <strong>Rejection Reason:</strong>
                  <p className="mb-0">{selectedOpportunity.rejectionReason}</p>
                </Alert>
              )}

              {/* Approval Info */}
              {selectedOpportunity.status === "approved" && selectedOpportunity.approvedBy && (
                <Alert variant="success">
                  <strong>Approved By:</strong>
                  <p className="mb-0">
                    {selectedOpportunity.approvedBy?.fullName} on {new Date(selectedOpportunity.approvedAt).toLocaleString()}
                  </p>
                </Alert>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedOpportunity?.status === "pending" && (
            <>
              <Button variant="danger" onClick={() => {
                setShowDetailModal(false);
                setShowRejectModal(true);
              }}>
                <FiXCircle className="me-2" />
                Reject
              </Button>
              <Button variant="success" onClick={() => {
                setShowDetailModal(false);
                setShowApproveModal(true);
              }}>
                <FiCheckCircle className="me-2" />
                Approve
              </Button>
            </>
          )}
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Approve Modal */}
      <Modal show={showApproveModal} onHide={() => setShowApproveModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Approve Opportunity</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to approve this opportunity?</p>
          <p className="text-muted small">
            This will create an inventory listing that will be visible to buyers.
          </p>
          <Form.Group className="mb-3">
            <Form.Label>Approval Notes (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="Add any additional notes..."
              value={approveNotes}
              onChange={(e) => setApproveNotes(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowApproveModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleApprove}>
            <FiCheckCircle className="me-2" />
            Confirm Approval
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reject Modal */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reject Opportunity</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Please provide a reason for rejection:</p>
          <Form.Group className="mb-3">
            <Form.Label>Rejection Reason *</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Explain why this opportunity is being rejected..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleReject}>
            <FiXCircle className="me-2" />
            Confirm Rejection
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminOpportunities;