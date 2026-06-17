/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
import  { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Modal,
  Alert,
  Form,
  Badge,
} from "react-bootstrap";
import {
  FiHeart,
  FiTrash2,
  FiShoppingCart,
  FiMapPin,
  FiRefreshCw,
  FiClock,
  FiBell,
} from "react-icons/fi";
import PageHeader from "../../components/PageHeader";
import { inventoryApi } from "../../api/inventoryApi";
import { rfqApi } from "../../api/rfqApi";
import toast from "react-hot-toast";

const BuyerWishlist = () => {
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showRFQModal, setShowRFQModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [rfqData, setRfqData] = useState({
    requestedWeightKg: "",
    offeredPricePerKg: "",
    message: "",
  });
  const [stats, setStats] = useState({
    total: 0,
    withPriceAlerts: 0,
    recentAdds: 0,
  });

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      // In production, this would be a dedicated wishlist endpoint
      // For now, we'll use the inventory endpoint with a saved filter
      const response = await inventoryApi.getAvailableInventory({
        saved: true,
      });
      if (response.success) {
        setSavedItems(response.inventory || []);
        calculateStats(response.inventory || []);
      }
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
      // If endpoint doesn't exist, use mock data
      setSavedItems(mockSavedItems);
      calculateStats(mockSavedItems);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (items) => {
    const stats = {
      total: items.length,
      withPriceAlerts: items.filter((i) => i.priceAlert).length,
      recentAdds: items.filter((i) => {
        const days = 7;
        const itemDate = new Date(i.createdAt || i.savedAt);
        const now = new Date();
        const diffTime = Math.abs(now - itemDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= days;
      }).length,
    };
    setStats(stats);
  };

  const handleRemoveFromWishlist = async (id) => {
    try {
      // In production, call the wishlist remove endpoint
      // await inventoryApi.removeFromWishlist(id);
      setSavedItems(savedItems.filter((item) => item._id !== id));
      toast.success("Item removed from wishlist");
      calculateStats(savedItems.filter((item) => item._id !== id));
      setShowRemoveModal(false);
    } catch (error) {
        console.log(error)
      toast.error("Failed to remove item");
    }
  };

  const handleCreateRFQ = async () => {
    if (!rfqData.requestedWeightKg || !rfqData.offeredPricePerKg) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (
      parseFloat(rfqData.requestedWeightKg) > selectedItem.availableWeightKg
    ) {
      toast.error(
        `Requested weight exceeds available (${selectedItem.availableWeightKg} kg)`,
      );
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
        toast.success("RFQ submitted successfully!");
        setShowRFQModal(false);
        setRfqData({
          requestedWeightKg: "",
          offeredPricePerKg: "",
          message: "",
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit RFQ");
    }
  };

  const handleSetPriceAlert = async (id) => {
    const targetPrice = prompt("Enter target price per kg to be alerted:");
    if (!targetPrice) return;

    try {
      // In production, call the price alert endpoint
      // await inventoryApi.setPriceAlert(id, parseFloat(targetPrice));
      toast.success(`Price alert set for $${targetPrice}/kg`);
      // Update local state
      setSavedItems(
        savedItems.map((item) =>
          item._id === id
            ? { ...item, priceAlert: parseFloat(targetPrice) }
            : item,
        ),
      );
    } catch (error) {
        console.log(error)
      toast.error("Failed to set price alert");
    }
  };

  const getPurityBadge = (purity) => {
    if (purity >= 99.9) return <Badge bg="success">Investment Grade</Badge>;
    if (purity >= 99) return <Badge bg="info">High Purity</Badge>;
    return <Badge bg="secondary">Standard</Badge>;
  };

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
        title="Saved Items"
        breadcrumbs={[{ label: "Buyer" }, { label: "Saved Items" }]}
        actions={
          <Button variant="outline-secondary" onClick={fetchWishlist}>
            <FiRefreshCw className="me-2" />
            Refresh
          </Button>
        }
      />

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        <Col md={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="d-flex justify-content-center mb-3">
                <div className="bg-primary bg-opacity-10 p-3 rounded-circle">
                  <FiHeart size={24} className="text-primary" />
                </div>
              </div>
              <h2 className="fw-bold mb-0">{stats.total}</h2>
              <p className="text-muted mb-0">Saved Items</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="d-flex justify-content-center mb-3">
                <div className="bg-warning bg-opacity-10 p-3 rounded-circle">
                  <FiBell size={24} className="text-warning" />
                </div>
              </div>
              <h2 className="fw-bold mb-0">{stats.withPriceAlerts}</h2>
              <p className="text-muted mb-0">Price Alerts Set</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="d-flex justify-content-center mb-3">
                <div className="bg-success bg-opacity-10 p-3 rounded-circle">
                  <FiClock size={24} className="text-success" />
                </div>
              </div>
              <h2 className="fw-bold mb-0">{stats.recentAdds}</h2>
              <p className="text-muted mb-0">Recently Added (7 days)</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Saved Items Grid */}
      {savedItems.length > 0 ? (
        <Row className="g-4">
          {savedItems.map((item) => (
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
                    <div className="d-flex gap-1">
                      <button
                        className="btn btn-link text-danger p-0"
                        onClick={() => {
                          setSelectedItem(item);
                          setShowRemoveModal(true);
                        }}
                      >
                        <FiHeart size={18} fill="currentColor" />
                      </button>
                    </div>
                  </div>

                  <div className="text-center py-3 border-bottom mb-3">
                    <div className="d-flex justify-content-center align-items-center gap-4">
                      <div>
                        <div className="text-muted small">Weight</div>
                        <div className="fw-bold fs-5">
                          {item.availableWeightKg} kg
                        </div>
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
                        $
                        {(
                          item.availableWeightKg * item.askingPrice
                        )?.toLocaleString()}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted small">Supplier</span>
                      <span className="small">
                        {item.supplier?.fullName || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="d-grid gap-2">
                    <Button
                      variant="outline-primary"
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
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="flex-grow-1"
                        onClick={() => handleSetPriceAlert(item._id)}
                      >
                        <FiBell className="me-1" />
                        Price Alert
                      </Button>
                      {item.priceAlert && (
                        <Badge
                          bg="warning"
                          className="d-flex align-items-center"
                        >
                          ${item.priceAlert}
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5">
            <FiHeart
              size={64}
              className="text-muted mb-3"
              style={{ opacity: 0.3 }}
            />
            <h5 className="fw-bold mb-2">No Saved Items</h5>
            <p className="text-muted mb-4">
              Start browsing gold inventory and save items you're interested in.
            </p>
            <Button variant="warning" href="/buyer/inventory">
              Browse Gold Inventory
            </Button>
          </Card.Body>
        </Card>
      )}

      {/* RFQ Modal */}
      <Modal
        show={showRFQModal}
        onHide={() => setShowRFQModal(false)}
        size="lg"
      >
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
                    onChange={(e) =>
                      setRfqData({
                        ...rfqData,
                        requestedWeightKg: e.target.value,
                      })
                    }
                  />
                  <Form.Text className="text-muted">
                    Maximum available: {selectedItem.availableWeightKg} kg
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Your Offer (per kg) *</Form.Label>
                  <div className="d-flex align-items-center">
                    <span className="me-2">$</span>
                    <Form.Control
                      type="number"
                      step="100"
                      value={rfqData.offeredPricePerKg}
                      onChange={(e) =>
                        setRfqData({
                          ...rfqData,
                          offeredPricePerKg: e.target.value,
                        })
                      }
                    />
                  </div>
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
                    onChange={(e) =>
                      setRfqData({ ...rfqData, message: e.target.value })
                    }
                    placeholder="Add any additional requirements or questions..."
                  />
                </Form.Group>
              </Form>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRFQModal(false)}>
            Cancel
          </Button>
          <Button variant="warning" onClick={handleCreateRFQ}>
            <FiShoppingCart className="me-2" />
            Submit RFQ
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Remove Confirmation Modal */}
      <Modal show={showRemoveModal} onHide={() => setShowRemoveModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Remove from Saved Items</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning">
            <FiHeart className="me-2" />
            Are you sure you want to remove this item from your saved items?
          </Alert>
          {selectedItem && (
            <div className="bg-light p-3 rounded">
              <div className="fw-bold">{selectedItem.inventoryNumber}</div>
              <div className="small text-muted">
                {selectedItem.purity}% purity • {selectedItem.availableWeightKg}{" "}
                kg
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRemoveModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => handleRemoveFromWishlist(selectedItem?._id)}
          >
            <FiTrash2 className="me-2" />
            Remove
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

// Mock data for development
const mockSavedItems = [
  {
    _id: "1",
    inventoryNumber: "INV-202401-0001",
    availableWeightKg: 5,
    weightKg: 5,
    purity: 99.99,
    location: "Lagos, Nigeria",
    askingPrice: 65000,
    supplier: {
      fullName: "Gold Mining Ltd",
      email: "info@goldmining.com",
    },
    createdAt: new Date().toISOString(),
    savedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    priceAlert: 62000,
  },
  {
    _id: "2",
    inventoryNumber: "INV-202401-0005",
    availableWeightKg: 3.5,
    weightKg: 3.5,
    purity: 99.5,
    location: "Accra, Ghana",
    askingPrice: 58000,
    supplier: {
      fullName: "Golden Star Resources",
      email: "info@goldenstar.com",
    },
    createdAt: new Date().toISOString(),
    savedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    priceAlert: null,
  },
  {
    _id: "3",
    inventoryNumber: "INV-202401-0008",
    availableWeightKg: 10,
    weightKg: 10,
    purity: 99.9,
    location: "Dubai, UAE",
    askingPrice: 70000,
    supplier: {
      fullName: "Dubai Gold Trading",
      email: "info@dubaidgold.com",
    },
    createdAt: new Date().toISOString(),
    savedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    priceAlert: 68000,
  },
];

export default BuyerWishlist;
