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
} from "react-bootstrap";
import {
  FiPackage,
  FiSearch,
  FiFilter,
  FiMoreVertical,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiClock,
  FiTrash2,
  FiRefreshCw,
  FiDollarSign,
  FiMapPin,
 
  FiTrendingUp,
} from "react-icons/fi";
import PageHeader from "../../components/PageHeader";
import toast from "react-hot-toast";

const AdminInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveNotes, setApproveNotes] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    supplier: "",
    location: "",
    search: "",
  });
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    pending: 0,
    sold: 0,
    totalValue: 0,
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
        },
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
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/inventory/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();
      if (data.success) {
        setStats(data.available || {});
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/inventory/${id}/approve`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ notes: approveNotes }),
        },
      );
      const data = await response.json();
      if (data.success) {
        toast.success("Inventory approved successfully");
        setShowApproveModal(false);
        fetchInventory();
        fetchStats();
      }
    } catch (error) {
        console.log(error)
      toast.error("Failed to approve inventory");
    }
  };

  const handleReject = async (id) => {
    if (!rejectReason) {
      toast.error("Please provide a rejection reason");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/inventory/${id}/reject`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ rejectionReason: rejectReason }),
        },
      );
      const data = await response.json();
      if (data.success) {
        toast.success("Inventory rejected");
        setShowDetailModal(false);
        fetchInventory();
        fetchStats();
      }
    } catch (error) {
        console.log(error)

      toast.error("Failed to reject inventory");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this inventory?")) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/inventory/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await response.json();
        if (data.success) {
          toast.success("Inventory deleted successfully");
          fetchInventory();
          fetchStats();
        }
      } catch (error) {
        console.log(error)

        toast.error("Failed to delete inventory");
      }
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
      pending_approval: "Pending",
      available: "Available",
      reserved: "Reserved",
      sold: "Sold",
      rejected: "Rejected",
      archived: "Archived",
    };
    return (
      <Badge bg={variants[status] || "secondary"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const statCards = [
    {
      title: "Total Items",
      value: stats.count || 0,
      icon: FiPackage,
      color: "primary",
    },
    {
      title: "Available",
      value: stats.totalWeight || 0,
      unit: "kg",
      icon: FiTrendingUp,
      color: "success",
    },
    {
      title: "Total Value",
      value: `$${((stats.totalValue || 0) / 1000000).toFixed(2)}M`,
      icon: FiDollarSign,
      color: "warning",
    },
    {
      title: "Pending Approval",
      value: inventory.filter((i) => i.status === "pending_approval").length,
      icon: FiClock,
      color: "info",
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
        title="Inventory Management"
        breadcrumbs={[{ label: "Admin" }, { label: "Inventory" }]}
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
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-1 small">{stat.title}</p>
                    <h3 className="fw-bold mb-0">
                      {stat.value}
                      {stat.unit && (
                        <small className="text-muted fs-6"> {stat.unit}</small>
                      )}
                    </h3>
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
                  placeholder="Search by inventory number..."
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
                <option value="">All Status</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="sold">Sold</option>
                <option value="rejected">Rejected</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Control
                type="text"
                placeholder="Filter by location"
                value={filters.location}
                onChange={(e) =>
                  setFilters({ ...filters, location: e.target.value })
                }
              />
            </Col>
            <Col md={2}>
              <Button
                variant="outline-secondary"
                onClick={fetchInventory}
                className="w-100"
              >
                <FiFilter className="me-2" />
                Apply
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Inventory Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>Inventory #</th>
                <th>Supplier</th>
                <th>Weight (kg)</th>
                <th>Purity</th>
                <th>Location</th>
                <th>Price/kg</th>
                <th>Status</th>
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
                    <div>{item.supplier?.fullName || "N/A"}</div>
                    <small className="text-muted">{item.supplier?.email}</small>
                  </td>
                  <td>{item.weightKg} kg</td>
                  <td>{item.purity}%</td>
                  <td>
                    <FiMapPin className="me-1" size={12} />
                    {item.location}
                  </td>
                  <td>
                    <div className="fw-bold text-success">
                      ${item.askingPrice?.toLocaleString()}
                    </div>
                    <small>per kg</small>
                  </td>
                  <td>{getStatusBadge(item.status)}</td>
                  <td>
                    <Dropdown align="end">
                      <Dropdown.Toggle variant="link" className="text-dark p-0">
                        <FiMoreVertical size={18} />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item
                          onClick={() => {
                            setSelectedItem(item);
                            setShowDetailModal(true);
                          }}
                        >
                          <FiEye className="me-2" /> View Details
                        </Dropdown.Item>
                        {item.status === "pending_approval" && (
                          <>
                            <Dropdown.Item
                              onClick={() => {
                                setSelectedItem(item);
                                setShowApproveModal(true);
                              }}
                            >
                              <FiCheckCircle className="me-2 text-success" />{" "}
                              Approve
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() => handleReject(item._id)}
                            >
                              <FiXCircle className="me-2 text-danger" /> Reject
                            </Dropdown.Item>
                          </>
                        )}
                        <Dropdown.Divider />
                        <Dropdown.Item
                          className="text-danger"
                          onClick={() => handleDelete(item._id)}
                        >
                          <FiTrash2 className="me-2" /> Delete
                        </Dropdown.Item>
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
      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Inventory Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <div>
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
                </Row>
              </div>

              <h6 className="fw-bold mb-3">Gold Specifications</h6>
              <Row className="mb-4">
                <Col md={4}>
                  <div className="text-center p-3 bg-light rounded">
                    <small className="text-muted">Weight</small>
                    <h4 className="fw-bold mb-0">{selectedItem.weightKg} kg</h4>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-center p-3 bg-light rounded">
                    <small className="text-muted">Purity</small>
                    <h4 className="fw-bold mb-0">{selectedItem.purity}%</h4>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-center p-3 bg-light rounded">
                    <small className="text-muted">Available</small>
                    <h4 className="fw-bold mb-0">
                      {selectedItem.availableWeightKg} kg
                    </h4>
                  </div>
                </Col>
              </Row>

              <h6 className="fw-bold mb-3">Pricing</h6>
              <Row className="mb-4">
                <Col md={6}>
                  <div className="p-3 bg-light rounded">
                    <small className="text-muted">Price per kg</small>
                    <h4 className="fw-bold text-success mb-0">
                      ${selectedItem.askingPrice?.toLocaleString()}
                    </h4>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="p-3 bg-light rounded">
                    <small className="text-muted">Total Value</small>
                    <h4 className="fw-bold text-primary mb-0">
                      $
                      {(
                        selectedItem.weightKg * selectedItem.askingPrice
                      )?.toLocaleString()}
                    </h4>
                  </div>
                </Col>
              </Row>

              <h6 className="fw-bold mb-3">Location & Logistics</h6>
              <Row>
                <Col md={6}>
                  <p>
                    <strong>Storage Location:</strong>
                    <br />
                    {selectedItem.location}
                  </p>
                </Col>
                <Col md={6}>
                  <p>
                    <strong>Inspection Available:</strong>
                    <br />
                    {selectedItem.inspectionAvailable ? "Yes" : "No"}
                  </p>
                </Col>
              </Row>

              {selectedItem.status === "pending_approval" && (
                <Alert variant="warning" className="mt-3">
                  <strong>Pending Approval</strong>
                  <p className="mb-0 small">
                    This inventory is waiting for your review and approval.
                  </p>
                </Alert>
              )}

              {selectedItem.rejectionReason && (
                <Alert variant="danger" className="mt-3">
                  <strong>Rejection Reason:</strong>
                  <p className="mb-0">{selectedItem.rejectionReason}</p>
                </Alert>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedItem?.status === "pending_approval" && (
            <>
              <Button
                variant="danger"
                onClick={() => {
                  const reason = prompt("Enter rejection reason:");
                  if (reason) {
                    setRejectReason(reason);
                    handleReject(selectedItem._id);
                  }
                }}
              >
                <FiXCircle className="me-2" />
                Reject
              </Button>
              <Button
                variant="success"
                onClick={() => handleApprove(selectedItem._id)}
              >
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
          <Form.Group>
            <Form.Label>Notes (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Add any additional notes..."
              value={approveNotes}
              onChange={(e) => setApproveNotes(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowApproveModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={() => handleApprove(selectedItem?._id)}
          >
            Confirm Approval
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminInventory;
