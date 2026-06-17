/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
import  { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Form,
  Modal,
  InputGroup,
  Badge,
  Alert,
  Pagination,
} from "react-bootstrap";
import {
  FiPackage,
  FiSearch,
  FiFilter,
  FiEye,
  FiShoppingCart,
  FiMapPin,
  FiRefreshCw,
  FiSend,
  FiClock,
} from "react-icons/fi";
import PageHeader from "../../components/PageHeader";
import { inventoryApi } from "../../api/inventoryApi";
import { rfqApi } from "../../api/rfqApi";
import toast from "react-hot-toast";

const BuyerInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRFQModal, setShowRFQModal] = useState(false);
  const [rfqData, setRfqData] = useState({
    requestedWeightKg: "",
    offeredPricePerKg: "",
    message: "",
  });
  const [filters, setFilters] = useState({
    search: "",
    minPurity: "",
    maxPurity: "",
    minWeight: "",
    maxWeight: "",
    location: "",
    goldType: "",
    minPrice: "",
    maxPrice: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    fetchInventory();
  }, [filters, pagination.page, sortBy, sortOrder]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortOrder,
        status: "available",
      };
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === "" || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await inventoryApi.getAvailableInventory(params);
      if (response.success) {
        setInventory(response.inventory || []);
        setPagination({
          ...pagination,
          total: response.total || 0,
          pages: response.pages || 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRFQ = async () => {
    if (!rfqData.requestedWeightKg || !rfqData.offeredPricePerKg) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (parseFloat(rfqData.requestedWeightKg) > selectedItem.availableWeightKg) {
      toast.error(`Requested weight exceeds available (${selectedItem.availableWeightKg} kg)`);
      return;
    }

    try {
      const response = await rfqApi.createRFQ({
        inventoryId: selectedItem._id,
        requestedWeightKg: parseFloat(rfqData.requestedWeightKg),
        offeredPricePerKg: parseFloat(rfqData.offeredPricePerKg),
        message: rfqData.message,
      });
      
      if (response.success) {
        toast.success("RFQ submitted successfully! You'll receive a quote shortly.");
        setShowRFQModal(false);
        setRfqData({ requestedWeightKg: "", offeredPricePerKg: "", message: "" });
        fetchInventory();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit RFQ");
    }
  };

  const getPurityBadge = (purity) => {
    if (purity >= 99.9) return <Badge bg="success">Investment Grade</Badge>;
    if (purity >= 99) return <Badge bg="info">High Purity</Badge>;
    if (purity >= 95) return <Badge bg="warning">Good Purity</Badge>;
    return <Badge bg="secondary">Standard</Badge>;
  };

  const handlePageChange = (page) => {
    setPagination({ ...pagination, page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      minPurity: "",
      maxPurity: "",
      minWeight: "",
      maxWeight: "",
      location: "",
      goldType: "",
      minPrice: "",
      maxPrice: "",
    });
    setPagination({ ...pagination, page: 1 });
  };

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
        title="Buy Gold"
        breadcrumbs={[{ label: "Buyer" }, { label: "Gold Inventory" }]}
        actions={
          <Button variant="outline-secondary" onClick={fetchInventory}>
            <FiRefreshCw className="me-2" />
            Refresh
          </Button>
        }
      />

      {/* Filters */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="fw-bold mb-0">
              <FiFilter className="me-2" />
              Filters
            </h6>
            <Button variant="link" size="sm" onClick={clearFilters} className="text-decoration-none">
              Clear All
            </Button>
          </div>
          <Row className="g-3">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <FiSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by location..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </InputGroup>
            </Col>
            <Col md={2}>
              <Form.Control
                type="number"
                placeholder="Min Purity %"
                value={filters.minPurity}
                onChange={(e) => setFilters({ ...filters, minPurity: e.target.value })}
              />
            </Col>
            <Col md={2}>
              <Form.Control
                type="number"
                placeholder="Max Purity %"
                value={filters.maxPurity}
                onChange={(e) => setFilters({ ...filters, maxPurity: e.target.value })}
              />
            </Col>
            <Col md={2}>
              <Form.Control
                type="number"
                placeholder="Min Weight (kg)"
                value={filters.minWeight}
                onChange={(e) => setFilters({ ...filters, minWeight: e.target.value })}
              />
            </Col>
            <Col md={2}>
              <Form.Control
                type="number"
                placeholder="Max Weight (kg)"
                value={filters.maxWeight}
                onChange={(e) => setFilters({ ...filters, maxWeight: e.target.value })}
              />
            </Col>
            <Col md={2}>
              <Form.Control
                type="text"
                placeholder="Location"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              />
            </Col>
            <Col md={2}>
              <Form.Select
                value={filters.goldType}
                onChange={(e) => setFilters({ ...filters, goldType: e.target.value })}
              >
                <option value="">All Types</option>
                <option value="refined">Refined</option>
                <option value="doré">Doré</option>
                <option value="bars">Bars</option>
                <option value="nuggets">Nuggets</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Control
                type="number"
                placeholder="Min Price ($)"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              />
            </Col>
            <Col md={2}>
              <Form.Control
                type="number"
                placeholder="Max Price ($)"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              />
            </Col>
            <Col md={2}>
              <Button variant="warning" onClick={fetchInventory} className="w-100">
                Apply Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Sort Options */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="text-muted small">
          Showing {inventory.length} of {pagination.total} items
        </span>
        <div className="d-flex gap-2">
          <Form.Select
            size="sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ width: "150px" }}
          >
            <option value="createdAt">Newest</option>
            <option value="askingPrice">Price</option>
            <option value="purity">Purity</option>
            <option value="weightKg">Weight</option>
          </Form.Select>
          <Form.Select
            size="sm"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            style={{ width: "100px" }}
          >
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </Form.Select>
        </div>
      </div>

      {/* Inventory Grid */}
      <Row className="g-4">
        {inventory.map((item) => (
          <Col md={6} lg={4} xl={3} key={item._id}>
            <Card className="h-100 border-0 shadow-sm hover-card">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h6 className="fw-bold mb-1">{item.inventoryNumber}</h6>
                    <small className="text-muted d-flex align-items-center">
                      <FiMapPin size={12} className="me-1" />
                      {item.location}
                    </small>
                  </div>
                  <Badge bg="success">Available</Badge>
                </div>

                <div className="text-center py-3 border-bottom mb-3">
                  <div className="d-flex justify-content-center align-items-center gap-4">
                    <div>
                      <div className="text-muted small">Weight</div>
                      <div className="fw-bold fs-5">{item.availableWeightKg} kg</div>
                    </div>
                    <div>
                      <div className="text-muted small">Purity</div>
                      <div className="fw-bold fs-5">{item.purity}%</div>
                    </div>
                  </div>
                  {getPurityBadge(item.purity)}
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small">Price per kg</span>
                    <span className="fw-bold text-success">
                      ${item.askingPrice?.toLocaleString()}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small">Total Value</span>
                    <span className="fw-bold text-primary">
                      ${(item.availableWeightKg * item.askingPrice)?.toLocaleString()}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted small">Supplier</span>
                    <span className="small">{item.supplier?.fullName || "N/A"}</span>
                  </div>
                </div>

                <div className="d-grid gap-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => {
                      setSelectedItem(item);
                      setShowDetailModal(true);
                    }}
                  >
                    <FiEye className="me-1" />
                    View Details
                  </Button>
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => {
                      setSelectedItem(item);
                      setRfqData({
                        requestedWeightKg: item.availableWeightKg,
                        offeredPricePerKg: item.askingPrice,
                        message: `I am interested in purchasing ${item.availableWeightKg}kg of gold with ${item.purity}% purity.`,
                      });
                      setShowRFQModal(true);
                    }}
                  >
                    <FiShoppingCart className="me-1" />
                    Request Quote
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {inventory.length === 0 && (
        <div className="text-center py-5">
          <FiPackage size={48} className="text-muted mb-3" />
          <h5 className="fw-bold mb-2">No Inventory Available</h5>
          <p className="text-muted">
            There are currently no gold inventory items matching your criteria.
            {Object.values(filters).some(f => f) && " Try adjusting your filters."}
          </p>
          {Object.values(filters).some(f => f) && (
            <Button variant="outline-secondary" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            <Pagination.Prev
              disabled={pagination.page === 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            />
            {[...Array(Math.min(pagination.pages, 5))].map((_, i) => {
              let pageNumber;
              if (pagination.pages <= 5) {
                pageNumber = i + 1;
              } else if (pagination.page <= 3) {
                pageNumber = i + 1;
              } else if (pagination.page >= pagination.pages - 2) {
                pageNumber = pagination.pages - 4 + i;
              } else {
                pageNumber = pagination.page - 2 + i;
              }
              return (
                <Pagination.Item
                  key={pageNumber}
                  active={pageNumber === pagination.page}
                  onClick={() => handlePageChange(pageNumber)}
                >
                  {pageNumber}
                </Pagination.Item>
              );
            })}
            <Pagination.Next
              disabled={pagination.page === pagination.pages}
              onClick={() => handlePageChange(pagination.page + 1)}
            />
          </Pagination>
        </div>
      )}

      {/* Detail Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Gold Inventory Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <div>
              <div className="bg-light p-3 rounded mb-4">
                <Row>
                  <Col md={6}>
                    <strong>Inventory #:</strong>
                    <p>{selectedItem.inventoryNumber}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Status:</strong>
                    <Badge bg="success">Available</Badge>
                  </Col>
                  <Col md={6}>
                    <strong>Location:</strong>
                    <p>{selectedItem.location}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Supplier:</strong>
                    <p>{selectedItem.supplier?.fullName}</p>
                  </Col>
                </Row>
              </div>

              <h6 className="fw-bold mb-3">Gold Specifications</h6>
              <div className="bg-light p-3 rounded mb-4">
                <Row>
                  <Col md={4}>
                    <div className="text-center p-2 border rounded">
                      <small className="text-muted">Total Weight</small>
                      <h5 className="fw-bold mb-0">{selectedItem.weightKg} kg</h5>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="text-center p-2 border rounded">
                      <small className="text-muted">Available</small>
                      <h5 className="fw-bold mb-0">{selectedItem.availableWeightKg} kg</h5>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="text-center p-2 border rounded">
                      <small className="text-muted">Purity</small>
                      <h5 className="fw-bold mb-0">{selectedItem.purity}%</h5>
                      {getPurityBadge(selectedItem.purity)}
                    </div>
                  </Col>
                </Row>
              </div>

              <h6 className="fw-bold mb-3">Pricing</h6>
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
                        ${(selectedItem.availableWeightKg * selectedItem.askingPrice)?.toLocaleString()}
                      </h4>
                    </div>
                  </Col>
                </Row>
              </div>

              {selectedItem.notes && (
                <Alert variant="info">
                  <strong>Additional Notes:</strong>
                  <p className="mb-0">{selectedItem.notes}</p>
                </Alert>
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
            setShowRFQModal(true);
          }}>
            <FiShoppingCart className="me-2" />
            Request Quote
          </Button>
        </Modal.Footer>
      </Modal>

      {/* RFQ Modal */}
      <Modal show={showRFQModal} onHide={() => setShowRFQModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Request Quotation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <div>
              <Alert variant="info">
                <div className="d-flex justify-content-between">
                  <div>
                    <strong>{selectedItem.inventoryNumber}</strong>
                    <div className="small text-muted">
                      {selectedItem.purity}% purity • {selectedItem.location}
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="small text-muted">Available</div>
                    <strong>{selectedItem.availableWeightKg} kg</strong>
                  </div>
                </div>
              </Alert>

              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Requested Weight (kg) *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={selectedItem.availableWeightKg}
                    value={rfqData.requestedWeightKg}
                    onChange={(e) => setRfqData({ ...rfqData, requestedWeightKg: e.target.value })}
                  />
                  <Form.Text className="text-muted">
                    Maximum available: {selectedItem.availableWeightKg} kg
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Your Offer (per kg) *</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>$</InputGroup.Text>
                    <Form.Control
                      type="number"
                      step="100"
                      value={rfqData.offeredPricePerKg}
                      onChange={(e) => setRfqData({ ...rfqData, offeredPricePerKg: e.target.value })}
                    />
                  </InputGroup>
                  <Form.Text className="text-muted">
                    Current asking price: ${selectedItem.askingPrice}/kg
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Message (Optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={rfqData.message}
                    onChange={(e) => setRfqData({ ...rfqData, message: e.target.value })}
                    placeholder="Add any additional requirements or questions..."
                  />
                </Form.Group>

                <Alert variant="warning" className="mb-0">
                  <small>
                    <FiClock className="me-1" />
                    Your request will be sent to AMIRSAD staff for review. You'll receive a quote within 24 hours.
                  </small>
                </Alert>
              </Form>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRFQModal(false)}>
            Cancel
          </Button>
          <Button variant="warning" onClick={handleCreateRFQ}>
            <FiSend className="me-2" />
            Submit RFQ
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .hover-card {
          transition: all 0.3s ease;
        }
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1) !important;
        }
      `}</style>
    </div>
  );
};

export default BuyerInventory;