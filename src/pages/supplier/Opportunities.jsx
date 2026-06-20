/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
/* eslint-disable no-unused-vars */
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
  FiPackage,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiEye,
  FiRefreshCw,
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiTrendingUp,
  FiUpload,
} from "react-icons/fi";
import PageHeader from "../../components/PageHeader";
import { supplierApi } from "../../api/supplierApi";
import toast from "react-hot-toast";

const SupplierOpportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    weightKg: "",
    purity: "",
    location: "",
    askingPrice: "",
    goldType: "refined",
    form: "bars",
    photos: [],
    documents: [],
  });
  const [filters, setFilters] = useState({
    status: "",
    search: "",
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
}, [filters]);

useEffect(() => {
  const statsData = {
    total: opportunities.length,

    pending: opportunities.filter(
      (o) => o.status === "pending"
    ).length,

    approved: opportunities.filter(
      (o) => o.status === "approved"
    ).length,

    rejected: opportunities.filter(
      (o) => o.status === "rejected"
    ).length,

    totalWeight: opportunities.reduce(
      (sum, o) => sum + (Number(o.weightKg) || 0),
      0
    ),

    totalValue: opportunities.reduce(
      (sum, o) =>
        sum +
        (Number(o.weightKg) || 0) *
        (Number(o.askingPrice) || 0),
      0
    ),
  };

  setStats(statsData);
}, [opportunities]);

  // Fetch opportunities using the same pattern as admin
  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.search) queryParams.append("search", filters.search);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/opportunities/my?${queryParams}`,
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

 
  // Calculate stats from opportunities as fallback
  const calculateStatsFromOpportunities = () => {
    if (opportunities.length > 0) {
      const statsData = {
        total: opportunities.length,
        pending: opportunities.filter(o => o.status === "pending").length,
        approved: opportunities.filter(o => o.status === "approved").length,
        rejected: opportunities.filter(o => o.status === "rejected").length,
        totalWeight: opportunities.reduce((sum, o) => sum + (o.weightKg || 0), 0),
        totalValue: opportunities.reduce((sum, o) => sum + ((o.weightKg || 0) * (o.askingPrice || 0)), 0),
      };
      setStats(statsData);
    }
  };

  const handleCreateOpportunity = async () => {
    if (
      !formData.title ||
      !formData.weightKg ||
      !formData.purity ||
      !formData.location ||
      !formData.askingPrice
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/opportunities`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      const data = await response.json();
      if (data.success) {
        toast.success("Opportunity created successfully");
        setShowCreateModal(false);
        setFormData({
          title: "",
          description: "",
          weightKg: "",
          purity: "",
          location: "",
          askingPrice: "",
          goldType: "refined",
          form: "bars",
          photos: [],
          documents: [],
        });
        fetchOpportunities();
      }
    } catch (error) {
      console.error("Create opportunity error:", error);
      toast.error("Failed to create opportunity");
    }
  };

  const handleDeleteOpportunity = async (id) => {
    if (window.confirm("Are you sure you want to delete this opportunity?")) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/opportunities/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        if (data.success) {
          toast.success("Opportunity deleted");
          fetchOpportunities();
        }
      } catch (error) {
        console.error("Delete opportunity error:", error);
        toast.error("Failed to delete opportunity");
      }
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
    return (
      <Badge bg={variants[status] || "secondary"}>
        {labels[status] || status}
      </Badge>
    );
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
        title="Gold Opportunities"
        breadcrumbs={[{ label: "Supplier" }, { label: "Opportunities" }]}
        actions={
          <Button variant="warning" onClick={() => setShowCreateModal(true)}>
            <FiPlus className="me-2" />
            New Opportunity
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
                  placeholder="Search by title or location..."
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
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button
                variant="outline-secondary"
                onClick={fetchOpportunities}
                className="w-100"
              >
                <FiRefreshCw className="me-2" />
                Reset
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Opportunities Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>Title</th>
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
                  <td>{opp.weightKg} kg</td>
                  <td>{opp.purity}%</td>
                  <td>
                    <FiMapPin className="me-1" size={12} />
                    {opp.location}
                  </td>
                  <td>
                    <div className="fw-bold text-success">
                      #{opp.askingPrice?.toLocaleString()}
                    </div>
                  </td>
                  <td>{getStatusBadge(opp.status)}</td>
                  <td>
                    <small className="text-muted">
                      {new Date(opp.createdAt).toLocaleDateString()}
                    </small>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0"
                        onClick={() => {
                          setSelectedOpportunity(opp);
                          setShowDetailModal(true);
                        }}
                      >
                        <FiEye size={18} />
                      </Button>
                      {opp.status === "pending" && (
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 text-danger"
                          onClick={() => handleDeleteOpportunity(opp._id)}
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
          {opportunities.length === 0 && (
            <div className="text-center py-5">
              <FiPackage size={48} className="text-muted mb-3" />
              <p className="text-muted">No opportunities found</p>
              <Button
                variant="warning"
                onClick={() => setShowCreateModal(true)}
              >
                <FiPlus className="me-2" />
                Create Your First Opportunity
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Create Opportunity Modal */}
      <Modal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Create Gold Opportunity</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Title *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., High Purity Gold Bars"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Describe your gold opportunity..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Weight (kg) *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    placeholder="Enter weight in kg"
                    value={formData.weightKg}
                    onChange={(e) =>
                      setFormData({ ...formData, weightKg: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Purity (%) *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    placeholder="e.g., 99.99"
                    value={formData.purity}
                    onChange={(e) =>
                      setFormData({ ...formData, purity: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Location *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="City, Country"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Asking Price (per kg) *</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>#</InputGroup.Text>
                    <Form.Control
                      type="number"
                      placeholder="Enter price per kg"
                      value={formData.askingPrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          askingPrice: e.target.value,
                        })
                      }
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Gold Type</Form.Label>
                  <Form.Select
                    value={formData.goldType}
                    onChange={(e) =>
                      setFormData({ ...formData, goldType: e.target.value })
                    }
                  >
                    <option value="refined">Refined</option>
                    <option value="doré">Doré</option>
                    <option value="scrap">Scrap</option>
                    <option value="bars">Bars</option>
                    <option value="nuggets">Nuggets</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Form</Form.Label>
                  <Form.Select
                    value={formData.form}
                    onChange={(e) =>
                      setFormData({ ...formData, form: e.target.value })
                    }
                  >
                    <option value="bars">Bars</option>
                    <option value="coins">Coins</option>
                    <option value="granules">Granules</option>
                    <option value="powder">Powder</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Alert variant="info" className="mt-2">
                  <small>
                    Your opportunity will be reviewed by our team before being
                    listed.
                  </small>
                </Alert>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button variant="warning" onClick={handleCreateOpportunity}>
            <FiUpload className="me-2" />
            Submit Opportunity
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Opportunity Detail Modal */}
      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Opportunity Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOpportunity && (
            <div>
              <div className="bg-light p-3 rounded mb-4">
                <Row>
                  <Col md={6}>
                    <strong>Status:</strong>
                    <div>{getStatusBadge(selectedOpportunity.status)}</div>
                  </Col>
                  <Col md={6}>
                    <strong>Submitted:</strong>
                    <div>
                      {new Date(selectedOpportunity.createdAt).toLocaleString()}
                    </div>
                  </Col>
                </Row>
              </div>

              <h6 className="fw-bold mb-3">Gold Details</h6>
              <div className="bg-light p-3 rounded mb-4">
                <Row>
                  <Col md={4}>
                    <div className="text-center">
                      <small className="text-muted">Weight</small>
                      <h4 className="fw-bold mb-0">
                        {selectedOpportunity.weightKg} kg
                      </h4>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="text-center">
                      <small className="text-muted">Purity</small>
                      <h4 className="fw-bold mb-0">
                        {selectedOpportunity.purity}%
                      </h4>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="text-center">
                      <small className="text-muted">Asking Price</small>
                      <h4 className="fw-bold text-success mb-0">
                        #{selectedOpportunity.askingPrice?.toLocaleString()}/kg
                      </h4>
                    </div>
                  </Col>
                </Row>
              </div>

              <h6 className="fw-bold mb-3">Additional Information</h6>
              <div className="bg-light p-3 rounded">
                <Row>
                  <Col md={6}>
                    <strong>Location:</strong>
                    <p>{selectedOpportunity.location}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Gold Type:</strong>
                    <p>{selectedOpportunity.goldType || "Not specified"}</p>
                  </Col>
                  <Col md={12}>
                    <strong>Description:</strong>
                    <p>
                      {selectedOpportunity.description ||
                        "No description provided"}
                    </p>
                  </Col>
                </Row>
              </div>

              {selectedOpportunity.status === "rejected" &&
                selectedOpportunity.rejectionReason && (
                  <Alert variant="danger" className="mt-3">
                    <strong>Rejection Reason:</strong>
                    <p className="mb-0">
                      {selectedOpportunity.rejectionReason}
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
    </div>
  );
};

export default SupplierOpportunities;