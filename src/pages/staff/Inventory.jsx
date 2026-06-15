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
  FiDollarSign,
  FiMapPin,
  FiUser,
  FiCalendar,
  FiClock,
  FiTrendingUp,
  FiAward,
  
} from "react-icons/fi";
import PageHeader from "../../components/PageHeader";
import toast from "react-hot-toast";

const StaffInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [approveNotes, setApproveNotes] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [filters, setFilters] = useState({
    status: "pending_approval",
    supplier: "",
    location: "",
    search: "",
  });
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    totalValue: 0,
    totalWeight: 0,
  });

  useEffect(() => {
    fetchInventory();
    fetchStats();
  }, [filters]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.supplier) queryParams.append("supplier", filters.supplier);
      if (filters.location) queryParams.append("location", filters.location);
      if (filters.search) queryParams.append("search", filters.search);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/inventory?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setInventory(data.inventory || []);
      }
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/inventory/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setStats({
          pending: data.pendingCount || 0,
          approved: data.approvedCount || 0,
          rejected: data.rejectedCount || 0,
          totalValue: data.totalValue || 0,
          totalWeight: data.totalWeight || 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const handleApprove = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/inventory/${selectedItem._id}/approve`,
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
        toast.success("Inventory approved successfully");
        setShowApproveModal(false);
        setApproveNotes("");
        fetchInventory();
        fetchStats();
      }
    } catch (error) {
        console.log(error)
      toast.error("Failed to approve inventory");
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
        `${import.meta.env.VITE_API_URL}/inventory/${selectedItem._id}/reject`,
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
        toast.success("Inventory rejected");
        setShowRejectModal(false);
        setRejectReason("");
        fetchInventory();
        fetchStats();
      }
    } catch (error) {
        console.log(error)
      toast.error("Failed to reject inventory");
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending_approval: "warning",
      available: "success",
      reserved: "info",
      sold: "secondary",
      rejected: "danger",
      archived: "dark",
    };
    const labels = {
      pending_approval: "Pending Approval",
      available: "Available",
      reserved: "Reserved",
      sold: "Sold",
      rejected: "Rejected",
      archived: "Archived",
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
      title: "Pending Approval",
      value: stats.pending,
      icon: FiClock,
      color: "warning",
      trend: "+3",
    },
    {
      title: "Approved",
      value: stats.approved,
      icon: FiCheckCircle,
      color: "success",
      trend: "+12",
    },
    {
      title: "Total Value",
      value: `$${((stats.totalValue || 0) / 1000000).toFixed(2)}M`,
      icon: FiDollarSign,
      color: "primary",
    },
    {
      title: "Total Weight",
      value: `${(stats.totalWeight || 0).toFixed(1)} kg`,
      icon: FiPackage,
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
        title="Inventory Management"
        breadcrumbs={[{ label: "Staff" }, { label: "Inventory" }]}
        actions={
          <Button variant="outline-secondary" onClick={fetchInventory}>
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
                    {stat.trend && (
                      <small className="text-success d-flex align-items-center gap-1 mt-1">
                        <FiTrendingUp size={12} />
                        {stat.trend} this week
                      </small>
                    )}
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
                  placeholder="Search by inventory number or supplier..."
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
                <option value="pending_approval">Pending Approval</option>
                <option value="available">Available</option>
                <option value="rejected">Rejected</option>
                <option value="all">All Inventory</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Control
                type="text"
                placeholder="Filter by location"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              />
            </Col>
            <Col md={2}>
              <Button variant="outline-secondary" onClick={fetchInventory} className="w-100">
                <FiFilter className="me-2" />
                Apply
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabs */}
      <Tabs defaultActiveKey="pending" className="mb-4" onSelect={(k) => setFilters({ ...filters, status: k })}>
        <Tab eventKey="pending_approval" title={`Pending (${stats.pending})`} />
        <Tab eventKey="available" title={`Approved (${stats.approved})`} />
        <Tab eventKey="rejected" title={`Rejected (${stats.rejected})`} />
      </Tabs>

      {/* Inventory Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>Inventory #</th>
                <th>Supplier</th>
                <th>Gold Details</th>
                <th>Location</th>
                <th>Price</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item._id}>
                  <td>
                    <div className="fw-bold">{item.inventoryNumber}</div>
                    <small className="text-muted">{item._id?.slice(-6)}</small>
                  </td>
                  <td>
                    <div>
                      <FiUser className="me-1" size={12} />
                      {item.supplier?.fullName || "N/A"}
                    </div>
                    <small className="text-muted">{item.supplier?.email}</small>
                  </td>
                  <td>
                    <div className="fw-bold">{item.weightKg} kg</div>
                    <div className="small">
                      <FiAward className="me-1" size={12} />
                      {item.purity}% purity
                    </div>
                    {getPurityBadge(item.purity)}
                  </td>
                  <td>
                    <FiMapPin className="me-1" size={12} />
                    {item.location}
                  </td>
                  <td>
                    <div className="fw-bold text-success">
                      ${item.askingPrice?.toLocaleString()}/kg
                    </div>
                    <small>Total: ${(item.weightKg * item.askingPrice)?.toLocaleString()}</small>
                  </td>
                  <td>{getStatusBadge(item.status)}</td>
                  <td>
                    <small className="text-muted">
                      <FiCalendar className="me-1" size={12} />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </small>
                  </td>
                  <td>
                    <Dropdown align="end">
                      <Dropdown.Toggle variant="link" className="text-dark p-0">
                        <FiMoreVertical size={18} />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => {
                          setSelectedItem(item);
                          setShowDetailModal(true);
                        }}>
                          <FiEye className="me-2" /> View Details
                        </Dropdown.Item>
                        {item.status === "pending_approval" && (
                          <>
                            <Dropdown.Item onClick={() => {
                              setSelectedItem(item);
                              setShowApproveModal(true);
                            }}>
                              <FiCheckCircle className="me-2 text-success" /> Approve
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => {
                              setSelectedItem(item);
                              setShowRejectModal(true);
                            }}>
                              <FiXCircle className="me-2 text-danger" /> Reject
                            </Dropdown.Item>
                          </>
                        )}
                        {item.status === "available" && (
                          <Dropdown.Item>
                            <FiEdit2 className="me-2" /> Edit Details
                          </Dropdown.Item>
                        )}
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {inventory.length === 0 && (
            <div className="text-center py-5">
              <FiPackage size={48} className="text-muted mb-3" />
              <p className="text-muted">No inventory items found</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Inventory Detail Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Inventory Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <div>
              {/* Header */}
              <div className="bg-light p-3 rounded mb-4">
                <Row>
                  <Col md={6}>
                    <strong>Inventory Number:</strong>
                    <p>{selectedItem.inventoryNumber}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Status:</strong>
                    <p>{getStatusBadge(selectedItem.status)}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Submitted:</strong>
                    <p>{new Date(selectedItem.createdAt).toLocaleString()}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Last Updated:</strong>
                    <p>{new Date(selectedItem.updatedAt).toLocaleString()}</p>
                  </Col>
                </Row>
              </div>

              {/* Supplier Information */}
              <h6 className="fw-bold mb-3">Supplier Information</h6>
              <div className="bg-light p-3 rounded mb-4">
                <Row>
                  <Col md={6}>
                    <strong>Name:</strong>
                    <p>{selectedItem.supplier?.fullName}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Email:</strong>
                    <p>{selectedItem.supplier?.email}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Phone:</strong>
                    <p>{selectedItem.supplier?.phone || "N/A"}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Company:</strong>
                    <p>{selectedItem.supplier?.profile?.companyName || "N/A"}</p>
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
                      <h4 className="fw-bold mb-0">{selectedItem.weightKg} kg</h4>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="text-center p-2 border rounded">
                      <small className="text-muted">Purity</small>
                      <h4 className="fw-bold mb-0">{selectedItem.purity}%</h4>
                      {getPurityBadge(selectedItem.purity)}
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="text-center p-2 border rounded">
                      <small className="text-muted">Available</small>
                      <h4 className="fw-bold mb-0">{selectedItem.availableWeightKg} kg</h4>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Pricing */}
              <h6 className="fw-bold mb-3">Pricing Information</h6>
              <div className="bg-light p-3 rounded mb-4">
                <Row>
                  <Col md={6}>
                    <div className="p-2">
                      <small className="text-muted">Price per kg</small>
                      <h4 className="fw-bold text-success mb-0">
                        ${selectedItem.askingPrice?.toLocaleString()}
                      </h4>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="p-2">
                      <small className="text-muted">Total Value</small>
                      <h4 className="fw-bold text-primary mb-0">
                        ${(selectedItem.weightKg * selectedItem.askingPrice)?.toLocaleString()}
                      </h4>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Location & Logistics */}
              <h6 className="fw-bold mb-3">Location & Logistics</h6>
              <div className="bg-light p-3 rounded mb-4">
                <Row>
                  <Col md={6}>
                    <strong>Storage Location:</strong>
                    <p>{selectedItem.location}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Inspection Available:</strong>
                    <p>{selectedItem.inspectionAvailable ? "Yes" : "No"}</p>
                  </Col>
                  <Col md={12}>
                    <strong>Available Until:</strong>
                    <p>{selectedItem.availableUntil ? new Date(selectedItem.availableUntil).toLocaleDateString() : "Not specified"}</p>
                  </Col>
                </Row>
              </div>

              {/* Notes */}
              {selectedItem.notes && (
                <Alert variant="info">
                  <strong>Additional Notes:</strong>
                  <p className="mb-0">{selectedItem.notes}</p>
                </Alert>
              )}

              {/* Rejection Reason */}
              {selectedItem.status === "rejected" && selectedItem.rejectionReason && (
                <Alert variant="danger">
                  <strong>Rejection Reason:</strong>
                  <p className="mb-0">{selectedItem.rejectionReason}</p>
                </Alert>
              )}

              {/* Approval Info */}
              {selectedItem.status === "available" && selectedItem.approvedBy && (
                <Alert variant="success">
                  <strong>Approved By:</strong>
                  <p className="mb-0">
                    {selectedItem.approvedBy?.fullName} on {new Date(selectedItem.approvedAt).toLocaleString()}
                  </p>
                </Alert>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedItem?.status === "pending_approval" && (
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
          <Modal.Title>Approve Inventory</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to approve this inventory?</p>
          <p className="text-muted small">
            Once approved, this inventory will be visible to buyers.
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
          <Modal.Title>Reject Inventory</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Please provide a reason for rejection:</p>
          <Form.Group className="mb-3">
            <Form.Label>Rejection Reason *</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Explain why this inventory is being rejected..."
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

export default StaffInventory;