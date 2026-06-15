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
  ProgressBar,
} from "react-bootstrap";
import {
  FiPackage,
  FiSearch,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiRefreshCw,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiMapPin,
} from "react-icons/fi";
import PageHeader from "../../components/PageHeader";
import { inventoryApi } from "../../api/inventoryApi";
import toast from "react-hot-toast";

const SupplierInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editFormData, setEditFormData] = useState({
    askingPrice: "",
    location: "",
    notes: "",
  });
  const [filters, setFilters] = useState({
    status: "",
    search: "",
  });
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    reserved: 0,
    sold: 0,
    pendingApproval: 0,
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
      const response = await inventoryApi.getSupplierInventory();
      if (response.success) {
        setInventory(response.inventory || []);
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
      const response = await inventoryApi.getStats();
      if (response.success) {
        setStats({
          total: response.total || 0,
          available: response.available?.count || 0,
          reserved: response.reserved?.count || 0,
          sold: response.sold?.count || 0,
          pendingApproval: response.pending_approval?.count || 0,
          totalValue: response.available?.totalValue || 0,
          totalWeight: response.available?.totalWeight || 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const handleUpdateInventory = async () => {
    if (!editFormData.askingPrice) {
      toast.error("Please enter a price");
      return;
    }

    try {
      const response = await inventoryApi.updateInventory(selectedItem._id, {
        askingPrice: parseFloat(editFormData.askingPrice),
        location: editFormData.location,
        notes: editFormData.notes,
      });
      if (response.success) {
        toast.success("Inventory updated successfully");
        setShowEditModal(false);
        fetchInventory();
        fetchStats();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update inventory",
      );
    }
  };

  const handleDeleteInventory = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this inventory? This action cannot be undone.",
      )
    ) {
      try {
        const response = await inventoryApi.deleteInventory(id);
        if (response.success) {
          toast.success("Inventory deleted");
          fetchInventory();
          fetchStats();
        }
      } catch (error) {
        console.log(error);
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
      pending_approval: "Pending Approval",
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

  const getPurityBadge = (purity) => {
    if (purity >= 99.9) return <Badge bg="success">Investment Grade</Badge>;
    if (purity >= 99) return <Badge bg="info">High Purity</Badge>;
    return <Badge bg="secondary">Standard</Badge>;
  };

  const statCards = [
    {
      title: "Total Inventory",
      value: stats.total,
      icon: FiPackage,
      color: "primary",
    },
    {
      title: "Available",
      value: stats.available,
      icon: FiCheckCircle,
      color: "success",
    },
    {
      title: "Pending Approval",
      value: stats.pendingApproval,
      icon: FiClock,
      color: "warning",
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
        title="My Inventory"
        breadcrumbs={[{ label: "Supplier" }, { label: "Inventory" }]}
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
            <Col md={6}>
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
            <Col md={4}>
              <Form.Select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
              >
                <option value="">All Status</option>
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="sold">Sold</option>
                <option value="pending_approval">Pending Approval</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button
                variant="outline-secondary"
                onClick={fetchInventory}
                className="w-100"
              >
                <FiRefreshCw className="me-2" />
                Reset
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Inventory Summary Card */}
      {stats.available > 0 && (
        <Card className="border-0 shadow-sm mb-4 bg-primary bg-opacity-10">
          <Card.Body>
            <Row className="align-items-center">
              <Col md={8}>
                <h5 className="fw-bold mb-2">Inventory Summary</h5>
                <p className="mb-0">
                  You have <strong>{stats.available} items</strong> available
                  for sale totaling <strong>{stats.totalWeight} kg</strong> of
                  gold valued at
                  <strong>
                    {" "}
                    ${((stats.totalValue || 0) / 1000000).toFixed(2)}M
                  </strong>
                </p>
              </Col>
              <Col md={4} className="text-md-end">
                <ProgressBar
                  now={(stats.available / stats.total) * 100}
                  label={`${Math.round((stats.available / stats.total) * 100)}% Available`}
                  variant="success"
                  style={{ height: "30px" }}
                />
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Inventory Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>Inventory #</th>
                <th>Gold Details</th>
                <th>Quantity</th>
                <th>Location</th>
                <th>Price/kg</th>
                <th>Status</th>
                <th>Listed Date</th>
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
                    <div>{item.purity}% purity</div>
                    {getPurityBadge(item.purity)}
                    <div className="small text-muted mt-1">
                      {item.goldType || "Refined"} - {item.form || "Bars"}
                    </div>
                  </td>
                  <td>
                    <div className="fw-bold">{item.weightKg} kg</div>
                    <small>Available: {item.availableWeightKg} kg</small>
                    <ProgressBar
                      now={(item.availableWeightKg / item.weightKg) * 100}
                      variant="success"
                      style={{ height: "3px", marginTop: "5px" }}
                    />
                  </td>
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
                    <small className="text-muted">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </small>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0"
                        onClick={() => {
                          setSelectedItem(item);
                          setShowDetailModal(true);
                        }}
                      >
                        <FiEye size={18} />
                      </Button>
                      {item.status === "available" && (
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0"
                          onClick={() => {
                            setSelectedItem(item);
                            setEditFormData({
                              askingPrice: item.askingPrice,
                              location: item.location,
                              notes: item.notes || "",
                            });
                            setShowEditModal(true);
                          }}
                        >
                          <FiEdit2 size={18} />
                        </Button>
                      )}
                      {(item.status === "pending_approval" ||
                        item.status === "available") && (
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 text-danger"
                          onClick={() => handleDeleteInventory(item._id)}
                        >
                          <FiTrash2 size={18} />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {inventory.length === 0 && (
            <div className="text-center py-5">
              <FiPackage size={48} className="text-muted mb-3" />
              <p className="text-muted">No inventory items found</p>
              <p className="text-muted small">
                Once your opportunities are approved, they will appear here as
                inventory.
              </p>
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
                  <Col md={6}>
                    <strong>Listed Date:</strong>
                    <p>{new Date(selectedItem.createdAt).toLocaleString()}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Last Updated:</strong>
                    <p>{new Date(selectedItem.updatedAt).toLocaleString()}</p>
                  </Col>
                </Row>
              </div>

              <h6 className="fw-bold mb-3">Gold Specifications</h6>
              <div className="bg-light p-3 rounded mb-4">
                <Row>
                  <Col md={4}>
                    <div className="text-center p-2 border rounded">
                      <small className="text-muted">Total Weight</small>
                      <h4 className="fw-bold mb-0">
                        {selectedItem.weightKg} kg
                      </h4>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="text-center p-2 border rounded">
                      <small className="text-muted">Available Weight</small>
                      <h4 className="fw-bold mb-0">
                        {selectedItem.availableWeightKg} kg
                      </h4>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="text-center p-2 border rounded">
                      <small className="text-muted">Purity</small>
                      <h4 className="fw-bold mb-0">{selectedItem.purity}%</h4>
                      {getPurityBadge(selectedItem.purity)}
                    </div>
                  </Col>
                </Row>
              </div>

              <h6 className="fw-bold mb-3">Pricing & Location</h6>
              <div className="bg-light p-3 rounded mb-4">
                <Row>
                  <Col md={6}>
                    <strong>Price per kg:</strong>
                    <h5 className="text-success mb-0">
                      ${selectedItem.askingPrice?.toLocaleString()}
                    </h5>
                  </Col>
                  <Col md={6}>
                    <strong>Total Value:</strong>
                    <h5 className="text-primary mb-0">
                      $
                      {(
                        selectedItem.weightKg * selectedItem.askingPrice
                      )?.toLocaleString()}
                    </h5>
                  </Col>
                  <Col md={12} className="mt-3">
                    <strong>Location:</strong>
                    <p>{selectedItem.location}</p>
                  </Col>
                </Row>
              </div>

              {selectedItem.notes && (
                <Alert variant="info">
                  <strong>Notes:</strong>
                  <p className="mb-0">{selectedItem.notes}</p>
                </Alert>
              )}

              {selectedItem.status === "sold" && selectedItem.buyer && (
                <Alert variant="success">
                  <strong>Sold to:</strong>
                  <p className="mb-0">
                    {selectedItem.buyer?.fullName} on{" "}
                    {new Date(selectedItem.soldAt).toLocaleDateString()}
                  </p>
                </Alert>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Inventory Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Inventory</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Price per kg ($)</Form.Label>
                <Form.Control
                  type="number"
                  step="100"
                  value={editFormData.askingPrice}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      askingPrice: e.target.value,
                    })
                  }
                />
                <Form.Text className="text-muted">
                  Current price: ${selectedItem.askingPrice?.toLocaleString()}
                  /kg
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Location</Form.Label>
                <Form.Control
                  type="text"
                  value={editFormData.location}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      location: e.target.value,
                    })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={editFormData.notes}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, notes: e.target.value })
                  }
                  placeholder="Additional notes about this inventory..."
                />
              </Form.Group>

              <Alert variant="warning" className="mt-3">
                <small>
                  <strong>Note:</strong> Changes to price and location will be
                  visible to buyers immediately.
                </small>
              </Alert>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="warning" onClick={handleUpdateInventory}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SupplierInventory;
