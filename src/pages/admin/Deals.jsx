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
  ProgressBar,
} from "react-bootstrap";
import {
  FiSearch,
  FiFilter,
  FiMoreVertical,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiEdit2,
  FiRefreshCw,
  FiCalendar,
  FiUser,
  FiPackage,
  FiTrendingUp,
  FiDownload,
  FiFileText,
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

const AdminDeals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: "",
    notes: "",
  });
  const [filters, setFilters] = useState({
    status: "",
    supplier: "",
    buyer: "",
    search: "",
    dateRange: "",
  });
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    totalValue: 0,
    totalWeight: 0,
  });

  useEffect(() => {
    fetchDeals();
  }, [filters]);

  // Calculate stats from deals data
  const calculateStats = (dealsData) => {
    if (dealsData && dealsData.length > 0) {
      const inProgressStatuses = ["inspection_scheduled", "offer_made", "agreement_signed"];
      const totalValue = dealsData.reduce((sum, d) => sum + (d.totalAmount || 0), 0);
      const totalWeight = dealsData.reduce((sum, d) => sum + (d.quantityKg || 0), 0);
      
      setStats({
        total: dealsData.length,
        open: dealsData.filter(d => d.status === "open").length,
        inProgress: dealsData.filter(d => inProgressStatuses.includes(d.status)).length,
        completed: dealsData.filter(d => d.status === "closed").length,
        cancelled: dealsData.filter(d => d.status === "cancelled").length,
        totalValue: totalValue,
        totalWeight: totalWeight,
      });
    } else {
      setStats({
        total: 0,
        open: 0,
        inProgress: 0,
        completed: 0,
        cancelled: 0,
        totalValue: 0,
        totalWeight: 0,
      });
    }
  };

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.supplier) queryParams.append("supplierId", filters.supplier);
      if (filters.buyer) queryParams.append("buyerId", filters.buyer);
      if (filters.search) queryParams.append("search", filters.search);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/deals?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setDeals(data.deals || []);
        calculateStats(data.deals || []);
      }
    } catch (error) {
      console.error("Failed to fetch deals:", error);
      toast.error("Failed to load deals");
      setDeals([]);
      calculateStats([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!updateData.status) {
      toast.error("Please select a status");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/deals/${selectedDeal._id}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: updateData.status,
            notes: updateData.notes,
          }),
        }
      );
      const data = await response.json();
      if (data.success) {
        toast.success("Deal status updated successfully");
        setShowUpdateModal(false);
        setUpdateData({ status: "", notes: "" });
        fetchDeals();
      }
    } catch (error) {
      console.error("Failed to update deal status:", error);
      toast.error("Failed to update deal status");
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      open: "primary",
      inspection_scheduled: "info",
      inspection_completed: "info",
      inspection_passed: "success",
      inspection_failed: "danger",
      offer_made: "warning",
      offer_accepted: "success",
      agreement_signed: "success",
      payment_pending: "warning",
      payment_received: "info",
      delivery_scheduled: "primary",
      delivery_completed: "success",
      closed: "success",
      cancelled: "danger",
      disputed: "danger",
    };
    const labels = {
      open: "Open",
      inspection_scheduled: "Inspection Scheduled",
      inspection_completed: "Inspection Completed",
      inspection_passed: "Inspection Passed",
      inspection_failed: "Inspection Failed",
      offer_made: "Offer Made",
      offer_accepted: "Offer Accepted",
      agreement_signed: "Agreement Signed",
      payment_pending: "Payment Pending",
      payment_received: "Payment Received",
      delivery_scheduled: "Delivery Scheduled",
      delivery_completed: "Delivery Completed",
      closed: "Closed",
      cancelled: "Cancelled",
      disputed: "Disputed",
    };
    return <Badge bg={variants[status] || "secondary"}>{labels[status] || status}</Badge>;
  };

  const getProgressPercentage = (deal) => {
    const stages = [
      "open",
      "inspection_scheduled",
      "inspection_passed",
      "offer_accepted",
      "agreement_signed",
      "payment_received",
      "delivery_completed",
      "closed",
    ];
    const currentIndex = stages.indexOf(deal.status);
    if (currentIndex === -1) return 0;
    return ((currentIndex + 1) / stages.length) * 100;
  };

  const statCards = [
    {
      title: "Total Deals",
      value: stats.total,
      icon: FaHashtag,
      color: "primary",
      trend: "+12%",
    },
    {
      title: "Total Value",
      value: formatNairaMillions(stats.totalValue || 0),
      icon: FiTrendingUp,
      color: "success",
      trend: "+8%",
    },
    {
      title: "Total Weight",
      value: `${(stats.totalWeight || 0).toFixed(1)} kg`,
      icon: FiPackage,
      color: "warning",
      trend: "+5%",
    },
    {
      title: "Completion Rate",
      value: stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : 0,
      unit: "%",
      icon: FiCheckCircle,
      color: "info",
      trend: "+3%",
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
        title="Deals Management"
        breadcrumbs={[{ label: "Admin" }, { label: "Deals" }]}
        actions={
          <div className="d-flex gap-2">
            <Button variant="outline-secondary" onClick={fetchDeals}>
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
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="text-muted mb-1 small">{stat.title}</p>
                    <h3 className="fw-bold mb-0">
                      {stat.value}
                      {stat.unit && <small className="text-muted fs-6"> {stat.unit}</small>}
                    </h3>
                    {stat.trend && (
                      <small className="text-success d-flex align-items-center gap-1 mt-1">
                        <FiTrendingUp size={12} />
                        {stat.trend}
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

      {/* Deal Status Summary */}
      <Row className="g-4 mb-4">
        <Col xs={12}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h6 className="fw-bold mb-3">Deal Pipeline</h6>
              <Row>
                <Col md={2}>
                  <div className="text-center">
                    <div className="text-muted small">Open</div>
                    <h5 className="fw-bold text-primary mb-0">{stats.open}</h5>
                  </div>
                </Col>
                <Col md={2}>
                  <div className="text-center">
                    <div className="text-muted small">In Progress</div>
                    <h5 className="fw-bold text-warning mb-0">{stats.inProgress}</h5>
                  </div>
                </Col>
                <Col md={2}>
                  <div className="text-center">
                    <div className="text-muted small">Completed</div>
                    <h5 className="fw-bold text-success mb-0">{stats.completed}</h5>
                  </div>
                </Col>
                <Col md={2}>
                  <div className="text-center">
                    <div className="text-muted small">Cancelled</div>
                    <h5 className="fw-bold text-danger mb-0">{stats.cancelled}</h5>
                  </div>
                </Col>
                <Col md={4}>
                  <ProgressBar className="mt-2">
                    <ProgressBar variant="primary" now={stats.total > 0 ? (stats.open / stats.total) * 100 : 0} label="Open" />
                    <ProgressBar variant="warning" now={stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0} label="In Progress" />
                    <ProgressBar variant="success" now={stats.total > 0 ? (stats.completed / stats.total) * 100 : 0} label="Completed" />
                    <ProgressBar variant="danger" now={stats.total > 0 ? (stats.cancelled / stats.total) * 100 : 0} label="Cancelled" />
                  </ProgressBar>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={3}>
              <InputGroup>
                <InputGroup.Text>
                  <FiSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by deal # or customer..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </InputGroup>
            </Col>
            <Col md={2}>
              <Form.Select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="inspection_scheduled">Inspection Scheduled</option>
                <option value="offer_made">Offer Made</option>
                <option value="agreement_signed">Agreement Signed</option>
                <option value="payment_received">Payment Received</option>
                <option value="delivery_completed">Delivery Completed</option>
                <option value="closed">Closed</option>
                <option value="cancelled">Cancelled</option>
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
              <Button variant="outline-secondary" onClick={fetchDeals} className="w-100">
                <FiFilter className="me-2" />
                Apply
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Deals Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>Deal #</th>
                <th>Supplier</th>
                <th>Buyer</th>
                <th>Quantity</th>
                <th>Total Value</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deals.map((deal) => (
                <tr key={deal._id}>
                  <td>
                    <div className="fw-bold">{deal.dealNumber}</div>
                    <small className="text-muted">{deal._id?.slice(-6)}</small>
                  </td>
                  <td>
                    <div>
                      <FiUser className="me-1" size={12} />
                      {deal.supplier?.fullName || "N/A"}
                    </div>
                  
                  </td>
                  <td>
                    <div>{deal.buyer?.fullName || "N/A"}</div>
                    
                  </td>
                  <td>
                    <div className="fw-bold">{deal.quantityKg} kg</div>
                    <small className="text-muted">{deal.purity}% purity</small>
                  </td>
                  <td>
                    <div className="fw-bold text-success">
                      {formatNaira(deal.totalAmount)}
                    </div>
                    <small>{deal.currency}</small>
                  </td>
                  <td>{getStatusBadge(deal.status)}</td>
                  <td>
                    <div className="min-width-100">
                      <ProgressBar 
                        now={getProgressPercentage(deal)} 
                        variant="success" 
                        style={{ height: "6px" }}
                      />
                      <small className="text-muted">{Math.round(getProgressPercentage(deal))}%</small>
                    </div>
                  </td>
                  <td>
                    <small className="text-muted">
                      <FiCalendar className="me-1" size={12} />
                      {new Date(deal.createdAt).toLocaleDateString()}
                    </small>
                  </td>
                  <td>
                    <Dropdown align="end">
                      <Dropdown.Toggle variant="link" className="text-dark p-0">
                        <FiMoreVertical size={18} />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => {
                          setSelectedDeal(deal);
                          setShowDetailModal(true);
                        }}>
                          <FiEye className="me-2" /> View Details
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => {
                          setSelectedDeal(deal);
                          setUpdateData({ status: deal.status, notes: "" });
                          setShowUpdateModal(true);
                        }}>
                          <FiEdit2 className="me-2 text-warning" /> Update Status
                        </Dropdown.Item>
                        {deal.status !== "closed" && deal.status !== "cancelled" && (
                          <Dropdown.Divider />
                        )}
                        {deal.status !== "closed" && deal.status !== "cancelled" && (
                          <Dropdown.Item 
                            className="text-danger"
                            onClick={() => {
                              const reason = prompt("Enter cancellation reason:");
                              if (reason) {
                                // handle cancellation
                              }
                            }}
                          >
                            <FiXCircle className="me-2" /> Cancel Deal
                          </Dropdown.Item>
                        )}
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {deals.length === 0 && (
            <div className="text-center py-5">
              <FaHashtag size={48} className="text-muted mb-3" />
              <p className="text-muted">No deals found</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Deal Detail Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Deal Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDeal && (
            <div>
              {/* Header */}
              <div className="bg-light p-3 rounded mb-4">
                <Row>
                  <Col md={6}>
                    <strong>Deal Number:</strong>
                    <p>{selectedDeal.dealNumber}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Status:</strong>
                    <p>{getStatusBadge(selectedDeal.status)}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Created:</strong>
                    <p>{new Date(selectedDeal.createdAt).toLocaleString()}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Last Updated:</strong>
                    <p>{new Date(selectedDeal.updatedAt).toLocaleString()}</p>
                  </Col>
                </Row>
              </div>

              {/* Parties */}
              <h6 className="fw-bold mb-3">Parties Involved</h6>
              <div className="bg-light p-3 rounded mb-4">
                <Row>
                  <Col md={6}>
                    <strong>Supplier:</strong>
                    <div className="mt-2">
                      <div className="fw-bold">{selectedDeal.supplier?.fullName}</div>
                      <div className="small text-muted">
                       
                      </div>
                      <div className="small text-muted">
                        <FiPackage className="me-1" size={12} />
                        Inventory: {selectedDeal.inventory?.inventoryNumber}
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <strong>Buyer:</strong>
                    <div className="mt-2">
                      <div className="fw-bold">{selectedDeal.buyer?.fullName}</div>
                      <div className="small text-muted">
                       
                      </div>
                      <div className="small text-muted">
                        <FiFileText className="me-1" size={12} />
                        RFQ: {selectedDeal.rfq?.rfqNumber}
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Deal Details */}
              <h6 className="fw-bold mb-3">Deal Specifications</h6>
              <div className="bg-light p-3 rounded mb-4">
                <Row>
                  <Col md={4}>
                    <div className="text-center">
                      <small className="text-muted">Quantity</small>
                      <h5 className="fw-bold mb-0">{selectedDeal.quantityKg} kg</h5>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="text-center">
                      <small className="text-muted">Price per kg</small>
                      <h5 className="fw-bold text-primary mb-0">
                        {formatNaira(selectedDeal.agreedPricePerKg)}
                      </h5>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="text-center">
                      <small className="text-muted">Total Amount</small>
                      <h5 className="fw-bold text-success mb-0">
                        {formatNaira(selectedDeal.totalAmount)}
                      </h5>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Timeline */}
              <h6 className="fw-bold mb-3">Deal Timeline</h6>
              <div className="bg-light p-3 rounded mb-4">
                {selectedDeal.statusHistory && selectedDeal.statusHistory.length > 0 ? (
                  <div className="timeline">
                    {selectedDeal.statusHistory.map((history, index) => (
                      <div key={index} className="timeline-item mb-3">
                        <div className="d-flex justify-content-between">
                          <strong>{getStatusBadge(history.status)}</strong>
                          <small>{new Date(history.changedAt).toLocaleString()}</small>
                        </div>
                        {history.notes && <div className="small text-muted mt-1">{history.notes}</div>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted mb-0">No timeline entries</p>
                )}
              </div>

              {/* Payment Status */}
              {selectedDeal.payment && (
                <>
                  <h6 className="fw-bold mb-3">Payment Information</h6>
                  <div className="bg-light p-3 rounded mb-4">
                    <Row>
                      <Col md={4}>
                        <strong>Status:</strong>
                        <Badge bg={selectedDeal.payment.status === "paid" ? "success" : "warning"} className="ms-2">
                          {selectedDeal.payment.status}
                        </Badge>
                      </Col>
                      <Col md={4}>
                        <strong>Amount Paid:</strong>
                        <p>{formatNaira(selectedDeal.payment.amount || 0)}</p>
                      </Col>
                      {selectedDeal.payment.paidAt && (
                        <Col md={4}>
                          <strong>Paid Date:</strong>
                          <p>{new Date(selectedDeal.payment.paidAt).toLocaleDateString()}</p>
                        </Col>
                      )}
                    </Row>
                  </div>
                </>
              )}

              {/* Delivery Information */}
              {selectedDeal.delivery && (
                <>
                  <h6 className="fw-bold mb-3">Delivery Information</h6>
                  <div className="bg-light p-3 rounded">
                    <Row>
                      <Col md={6}>
                        <strong>Method:</strong>
                        <p>{selectedDeal.delivery.method || "Not specified"}</p>
                      </Col>
                      <Col md={6}>
                        <strong>Scheduled Date:</strong>
                        <p>{selectedDeal.delivery.scheduledDate ? new Date(selectedDeal.delivery.scheduledDate).toLocaleDateString() : "Not scheduled"}</p>
                      </Col>
                      {selectedDeal.delivery.trackingNumber && (
                        <Col md={12}>
                          <strong>Tracking Number:</strong>
                          <p>{selectedDeal.delivery.trackingNumber}</p>
                        </Col>
                      )}
                    </Row>
                  </div>
                </>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
          <Button variant="warning" onClick={() => {
            setShowDetailModal(false);
            setShowUpdateModal(true);
          }}>
            <FiEdit2 className="me-2" />
            Update Status
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Update Status Modal */}
      <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Deal Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDeal && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Current Status</Form.Label>
                <div>{getStatusBadge(selectedDeal.status)}</div>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>New Status *</Form.Label>
                <Form.Select
                  value={updateData.status}
                  onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                >
                  <option value="">Select Status</option>
                  <option value="inspection_scheduled">Inspection Scheduled</option>
                  <option value="inspection_passed">Inspection Passed</option>
                  <option value="offer_accepted">Offer Accepted</option>
                  <option value="agreement_signed">Agreement Signed</option>
                  <option value="payment_received">Payment Received</option>
                  <option value="delivery_completed">Delivery Completed</option>
                  <option value="closed">Closed</option>
                  <option value="cancelled">Cancelled</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Add notes about this status update..."
                  value={updateData.notes}
                  onChange={(e) => setUpdateData({ ...updateData, notes: e.target.value })}
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateStatus}>
            Update Status
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .timeline-item {
          position: relative;
          padding-left: 20px;
        }
        .timeline-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 8px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--primary-color);
        }
        .timeline-item::after {
          content: '';
          position: absolute;
          left: 3px;
          top: 16px;
          width: 2px;
          height: calc(100% - 8px);
          background: var(--border-color);
        }
        .timeline-item:last-child::after {
          display: none;
        }
        .min-width-100 {
          min-width: 100px;
        }
      `}</style>
    </div>
  );
};

export default AdminDeals;