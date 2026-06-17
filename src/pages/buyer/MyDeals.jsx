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
  Alert,
  ProgressBar,
} from "react-bootstrap";
import {
  FiDollarSign,
  FiSearch,
  FiEye,
  FiCheckCircle,
  FiRefreshCw,
  FiPackage,
  FiUser,
  FiCalendar,
  FiTrendingUp,
  FiStar,
} from "react-icons/fi";
import PageHeader from "../../components/PageHeader";
import { dealsApi } from "../../api/dealsApi";
import toast from "react-hot-toast";

const BuyerMyDeals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingData, setRatingData] = useState({
    rating: 5,
    feedback: "",
  });
  const [filters, setFilters] = useState({
    status: "",
    search: "",
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
    totalValue: 0,
    totalWeight: 0,
  });

  useEffect(() => {
    fetchDeals();
  }, [filters]);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const response = await dealsApi.getMyDeals();
      if (response.success) {
        setDeals(response.deals || []);
        calculateStats(response.deals || []);
      }
    } catch (error) {
      console.error("Failed to fetch deals:", error);
      toast.error("Failed to load deals");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (deals) => {
    const activeStatuses = ["open", "inspection_scheduled", "offer_made", "agreement_signed", "payment_pending", "delivery_scheduled"];
    const stats = {
      total: deals.length,
      active: deals.filter(d => activeStatuses.includes(d.status)).length,
      completed: deals.filter(d => d.status === "closed").length,
      cancelled: deals.filter(d => d.status === "cancelled").length,
      totalValue: deals.reduce((sum, d) => sum + (d.totalAmount || 0), 0),
      totalWeight: deals.reduce((sum, d) => sum + (d.quantityKg || 0), 0),
    };
    setStats(stats);
  };

  const handleRateSupplier = async () => {
    if (!ratingData.rating) {
      toast.error("Please provide a rating");
      return;
    }

    try {
      const response = await dealsApi.rateDeal(selectedDeal._id, {
        supplierRating: ratingData.rating,
        supplierFeedback: ratingData.feedback,
      });
      if (response.success) {
        toast.success("Thank you for your feedback!");
        setShowRatingModal(false);
        setRatingData({ rating: 5, feedback: "" });
        fetchDeals();
      }
    } catch (error) {
        console.log(error)
      toast.error("Failed to submit rating");
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
      icon: FiDollarSign,
      color: "primary",
    },
    {
      title: "Active Deals",
      value: stats.active,
      icon: FiTrendingUp,
      color: "warning",
    },
    {
      title: "Completed",
      value: stats.completed,
      icon: FiCheckCircle,
      color: "success",
    },
    {
      title: "Total Value",
      value: `$${((stats.totalValue || 0) / 1000000).toFixed(2)}M`,
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
        title="My Deals"
        breadcrumbs={[{ label: "Buyer" }, { label: "Deals" }]}
        actions={
          <Button variant="outline-secondary" onClick={fetchDeals}>
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
            <Col md={5}>
              <InputGroup>
                <InputGroup.Text>
                  <FiSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by deal number or supplier name..."
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
                <option value="open">Open</option>
                <option value="inspection_scheduled">Inspection Scheduled</option>
                <option value="payment_pending">Payment Pending</option>
                <option value="delivery_scheduled">Delivery Scheduled</option>
                <option value="closed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button variant="outline-secondary" onClick={fetchDeals} className="w-100">
                <FiRefreshCw className="me-2" />
                Reset
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
                    <small className="text-muted">{deal.supplier?.email}</small>
                  </td>
                  <td>
                    <div className="fw-bold">{deal.quantityKg} kg</div>
                    <small className="text-muted">{deal.purity}% purity</small>
                  </td>
                  <td>
                    <div className="fw-bold text-success">
                      ${deal.totalAmount?.toLocaleString()}
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
                    <div className="d-flex gap-2">
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0"
                        onClick={() => {
                          setSelectedDeal(deal);
                          setShowDetailModal(true);
                        }}
                      >
                        <FiEye size={18} />
                      </Button>
                      {deal.status === "closed" && !deal.supplierRating?.rating && (
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 text-warning"
                          onClick={() => {
                            setSelectedDeal(deal);
                            setShowRatingModal(true);
                          }}
                        >
                          <FiStar size={18} />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {deals.length === 0 && (
            <div className="text-center py-5">
              <FiDollarSign size={48} className="text-muted mb-3" />
              <p className="text-muted">No deals found</p>
              <p className="text-muted small">
                When you accept RFQ quotes, they will appear here as deals.
              </p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Deal Detail Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Deal Details - {selectedDeal?.dealNumber}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDeal && (
            <div>
              {/* Header */}
              <div className="bg-light p-3 rounded mb-4">
                <Row>
                  <Col md={4}>
                    <strong>Status:</strong>
                    <div>{getStatusBadge(selectedDeal.status)}</div>
                  </Col>
                  <Col md={4}>
                    <strong>Created:</strong>
                    <div>{new Date(selectedDeal.createdAt).toLocaleString()}</div>
                  </Col>
                  <Col md={4}>
                    <strong>Last Updated:</strong>
                    <div>{new Date(selectedDeal.updatedAt).toLocaleString()}</div>
                  </Col>
                </Row>
              </div>

              {/* Supplier Information */}
              <h6 className="fw-bold mb-3">Supplier Information</h6>
              <div className="bg-light p-3 rounded mb-4">
                <Row>
                  <Col md={6}>
                    <strong>Name:</strong>
                    <p>{selectedDeal.supplier?.fullName}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Email:</strong>
                    <p>{selectedDeal.supplier?.email}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Phone:</strong>
                    <p>{selectedDeal.supplier?.phone || "N/A"}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Company:</strong>
                    <p>{selectedDeal.supplier?.profile?.companyName || "N/A"}</p>
                  </Col>
                </Row>
              </div>

              {/* Deal Details */}
              <h6 className="fw-bold mb-3">Deal Specifications</h6>
              <div className="bg-light p-3 rounded mb-4">
                <Row>
                  <Col md={4}>
                    <div className="text-center p-2 border rounded">
                      <small className="text-muted">Quantity</small>
                      <h5 className="fw-bold mb-0">{selectedDeal.quantityKg} kg</h5>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="text-center p-2 border rounded">
                      <small className="text-muted">Price per kg</small>
                      <h5 className="fw-bold text-primary mb-0">
                        ${selectedDeal.agreedPricePerKg?.toLocaleString()}
                      </h5>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="text-center p-2 border rounded">
                      <small className="text-muted">Total Amount</small>
                      <h5 className="fw-bold text-success mb-0">
                        ${selectedDeal.totalAmount?.toLocaleString()}
                      </h5>
                    </div>
                  </Col>
                </Row>
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
                        <p>${selectedDeal.payment.amount?.toLocaleString() || 0}</p>
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
                  <div className="bg-light p-3 rounded mb-4">
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

              {/* Timeline */}
              <h6 className="fw-bold mb-3">Deal Timeline</h6>
              <div className="bg-light p-3 rounded">
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

              {/* Ratings */}
              {selectedDeal.supplierRating && (
                <Alert variant="info" className="mt-3">
                  <strong>Supplier Rating:</strong>
                  <div className="mt-1">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        size={16}
                        className={i < selectedDeal.supplierRating.rating ? "text-warning" : "text-muted"}
                        style={{ display: "inline-block", marginRight: "2px" }}
                      />
                    ))}
                    <p className="mt-1 small">{selectedDeal.supplierRating.feedback}</p>
                  </div>
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

      {/* Rating Modal */}
      <Modal show={showRatingModal} onHide={() => setShowRatingModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Rate Supplier</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>How was your experience with <strong>{selectedDeal?.supplier?.fullName}</strong>?</p>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Rating *</Form.Label>
              <div className="d-flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FiStar
                    key={star}
                    size={30}
                    className={star <= ratingData.rating ? "text-warning" : "text-muted"}
                    style={{ cursor: "pointer" }}
                    onClick={() => setRatingData({ ...ratingData, rating: star })}
                  />
                ))}
              </div>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Feedback (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Share your experience with this supplier..."
                value={ratingData.feedback}
                onChange={(e) => setRatingData({ ...ratingData, feedback: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRatingModal(false)}>
            Skip
          </Button>
          <Button variant="warning" onClick={handleRateSupplier}>
            Submit Rating
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

export default BuyerMyDeals;