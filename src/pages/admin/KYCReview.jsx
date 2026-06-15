/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/exhaustive-deps */
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
  Alert,
  Tabs,
  Tab,
  ProgressBar,
} from "react-bootstrap";
import {
  FiUserCheck,
  FiSearch,
  FiFilter,
  FiMoreVertical,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiRefreshCw,
  FiFileText,
  FiClock,
  FiMail,
  FiPhone,
  FiMapPin,
  FiBriefcase,
  FiShield,
} from "react-icons/fi";
import PageHeader from "../../components/PageHeader";
import toast from "react-hot-toast";

const KYCReview = () => {
  const [kycSubmissions, setKycSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedKYC, setSelectedKYC] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    status: "",
    notes: "",
    rejectionReason: "",
  });
  const [filters, setFilters] = useState({
    type: "all",
    status: "",
    search: "",
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    underReview: 0,
    approved: 0,
    rejected: 0,
  });
  const [activeTab, setActiveTab] = useState("suppliers");

  useEffect(() => {
    fetchKYCSubmissions();
  }, [filters, activeTab]);

  const fetchKYCSubmissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Fetch suppliers for KYC review
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/suppliers/kyc-submissions?status=${filters.status || ""}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();
      if (data.success) {
        setKycSubmissions(data.submissions || []);
        calculateStats(data.submissions || []);
      }
    } catch (error) {
      console.error("Failed to fetch KYC submissions:", error);
      toast.error("Failed to load KYC submissions");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (submissions) => {
    const stats = {
      total: submissions.length,
      pending: submissions.filter(
        (s) => s.kyc?.verificationStatus === "pending",
      ).length,
      underReview: submissions.filter(
        (s) => s.kyc?.verificationStatus === "under_review",
      ).length,
      approved: submissions.filter(
        (s) => s.kyc?.verificationStatus === "approved",
      ).length,
      rejected: submissions.filter(
        (s) => s.kyc?.verificationStatus === "rejected",
      ).length,
    };
    setStats(stats);
  };

  const handleReview = async () => {
    if (!reviewData.status) {
      toast.error("Please select a status");
      return;
    }

    if (reviewData.status === "rejected" && !reviewData.rejectionReason) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/suppliers/review/${selectedKYC._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: reviewData.status,
            rejectionReason: reviewData.rejectionReason,
            notes: reviewData.notes,
          }),
        },
      );
      const data = await response.json();
      if (data.success) {
        toast.success(
          `KYC ${reviewData.status === "approved" ? "approved" : "rejected"} successfully`,
        );
        setShowReviewModal(false);
        setReviewData({ status: "", notes: "", rejectionReason: "" });
        fetchKYCSubmissions();
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to review KYC");
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      not_submitted: "secondary",
      pending: "warning",
      under_review: "info",
      approved: "success",
      rejected: "danger",
    };
    const labels = {
      not_submitted: "Not Submitted",
      pending: "Pending",
      under_review: "Under Review",
      approved: "Approved",
      rejected: "Rejected",
    };
    return (
      <Badge bg={variants[status] || "secondary"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getDocumentIcon = (docType) => {
    const icons = {
      certificateOfIncorporation: "🏢",
      taxClearanceCertificate: "📊",
      directorsIdentification: "🆔",
      proofOfAddress: "📍",
      passport: "🛂",
      id_card: "🆔",
      company_certificate: "🏭",
      proof_of_funds: "💰",
      bank_reference: "🏦",
    };
    return icons[docType] || "📄";
  };

  const statCards = [
    {
      title: "Total Submissions",
      value: stats.total,
      icon: FiFileText,
      color: "primary",
    },
    {
      title: "Pending Review",
      value: stats.pending,
      icon: FiClock,
      color: "warning",
    },
    {
      title: "Approved",
      value: stats.approved,
      icon: FiCheckCircle,
      color: "success",
    },
    {
      title: "Rejected",
      value: stats.rejected,
      icon: FiXCircle,
      color: "danger",
    },
  ];

  const filteredSubmissions = kycSubmissions.filter((item) => {
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        item.fullName?.toLowerCase().includes(searchTerm) ||
        item.email?.toLowerCase().includes(searchTerm) ||
        item.kyc?.businessName?.toLowerCase().includes(searchTerm) ||
        item.kyc?.registrationNumber?.toLowerCase().includes(searchTerm)
      );
    }
    return true;
  });

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
        title="KYC Verification"
        breadcrumbs={[{ label: "Admin" }, { label: "KYC Review" }]}
        actions={
          <Button variant="outline-secondary" onClick={fetchKYCSubmissions}>
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
                {stat.title === "Pending Review" && stats.total > 0 && (
                  <ProgressBar
                    className="mt-3"
                    variant="warning"
                    now={(stats.pending / stats.total) * 100}
                    style={{ height: "4px" }}
                  />
                )}
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
                  placeholder="Search by name, email, business or registration number..."
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
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button
                variant="outline-secondary"
                onClick={fetchKYCSubmissions}
                className="w-100"
              >
                <FiFilter className="me-2" />
                Apply
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab
          eventKey="suppliers"
          title={`Suppliers (${kycSubmissions.length})`}
        />
        <Tab eventKey="buyers" title={`Buyers (0)`} />
      </Tabs>

      {/* KYC Submissions Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>Applicant</th>
                <th>Business Details</th>
                <th>Contact</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Documents</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((submission) => (
                <tr key={submission._id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="kyc-avatar me-3">
                        {submission.fullName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="fw-bold">{submission.fullName}</div>
                        <small className="text-muted">
                          ID: {submission._id?.slice(-8)}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div className="small">
                        <FiBriefcase className="me-1" size={12} />
                        {submission.kyc?.businessName || "N/A"}
                      </div>
                      <div className="small text-muted">
                        Reg: {submission.kyc?.registrationNumber || "N/A"}
                      </div>
                      <div className="small text-muted">
                        <FiMapPin className="me-1" size={12} />
                        {submission.kyc?.countryOfRegistration || "N/A"}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div className="small">
                        <FiMail className="me-1" size={12} />
                        {submission.email}
                      </div>
                      <div className="small text-muted">
                        <FiPhone className="me-1" size={12} />
                        {submission.phone || "N/A"}
                      </div>
                    </div>
                  </td>
                  <td>
                    <small className="text-muted">
                      {submission.kyc?.submittedAt
                        ? new Date(
                            submission.kyc.submittedAt,
                          ).toLocaleDateString()
                        : "N/A"}
                    </small>
                  </td>
                  <td>{getStatusBadge(submission.kyc?.verificationStatus)}</td>
                  <td>
                    <div className="document-icons">
                      {submission.kyc?.documents &&
                        Object.keys(submission.kyc.documents).map(
                          (doc, idx) => (
                            <span
                              key={idx}
                              className="document-icon"
                              title={doc.replace(/([A-Z])/g, " $1").trim()}
                            >
                              {getDocumentIcon(doc)}
                            </span>
                          ),
                        )}
                      {(!submission.kyc?.documents ||
                        Object.keys(submission.kyc.documents).length === 0) && (
                        <span className="text-muted">No docs</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <Dropdown align="end">
                      <Dropdown.Toggle variant="link" className="text-dark p-0">
                        <FiMoreVertical size={18} />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item
                          onClick={() => {
                            setSelectedKYC(submission);
                            setShowDetailModal(true);
                          }}
                        >
                          <FiEye className="me-2" /> View Details
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() => {
                            setSelectedKYC(submission);
                            setShowReviewModal(true);
                          }}
                        >
                          <FiUserCheck className="me-2 text-success" /> Review
                          KYC
                        </Dropdown.Item>
                        <Dropdown.Item>
                          <FiMail className="me-2" /> Contact Applicant
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {filteredSubmissions.length === 0 && (
            <div className="text-center py-5">
              <FiShield size={48} className="text-muted mb-3" />
              <p className="text-muted">No KYC submissions found</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* KYC Detail Modal */}
      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>KYC Application Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedKYC && (
            <div>
              {/* Header */}
              <div className="text-center mb-4">
                <div className="kyc-avatar-large mx-auto mb-3">
                  {selectedKYC.fullName?.charAt(0).toUpperCase()}
                </div>
                <h4>{selectedKYC.fullName}</h4>
                <Badge bg="secondary">{selectedKYC.role}</Badge>
                <div className="mt-2">
                  {getStatusBadge(selectedKYC.kyc?.verificationStatus)}
                </div>
              </div>

              {/* Personal Information */}
              <h6 className="fw-bold mb-3">Personal Information</h6>
              <div className="bg-light p-3 rounded mb-4">
                <Row>
                  <Col md={6}>
                    <strong>Full Name:</strong>
                    <p>{selectedKYC.fullName}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Email:</strong>
                    <p>{selectedKYC.email}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Phone:</strong>
                    <p>{selectedKYC.phone || "N/A"}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Registered:</strong>
                    <p>
                      {new Date(selectedKYC.createdAt).toLocaleDateString()}
                    </p>
                  </Col>
                </Row>
              </div>

              {/* Business Information */}
              <h6 className="fw-bold mb-3">Business Information</h6>
              <div className="bg-light p-3 rounded mb-4">
                <Row>
                  <Col md={6}>
                    <strong>Business Name:</strong>
                    <p>{selectedKYC.kyc?.businessName || "N/A"}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Registration Number:</strong>
                    <p>{selectedKYC.kyc?.registrationNumber || "N/A"}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Tax ID:</strong>
                    <p>{selectedKYC.kyc?.taxId || "N/A"}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Country of Registration:</strong>
                    <p>{selectedKYC.kyc?.countryOfRegistration || "N/A"}</p>
                  </Col>
                  {selectedKYC.kyc?.businessAddress && (
                    <Col md={12}>
                      <strong>Business Address:</strong>
                      <p>
                        {selectedKYC.kyc.businessAddress.street},
                        {selectedKYC.kyc.businessAddress.city},
                        {selectedKYC.kyc.businessAddress.country}
                      </p>
                    </Col>
                  )}
                </Row>
              </div>

              {/* Documents */}
              <h6 className="fw-bold mb-3">Supporting Documents</h6>
              <div className="bg-light p-3 rounded mb-4">
                {selectedKYC.kyc?.documents &&
                  Object.entries(selectedKYC.kyc.documents).map(
                    ([docType, docUrl]) => (
                      <div
                        key={docType}
                        className="document-item d-flex justify-content-between align-items-center mb-2 p-2 bg-white rounded"
                      >
                        <div>
                          <span className="me-2">
                            {getDocumentIcon(docType)}
                          </span>
                          <strong>
                            {docType.replace(/([A-Z])/g, " $1").trim()}
                          </strong>
                        </div>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => window.open(docUrl, "_blank")}
                        >
                          <FiEye className="me-1" size={12} />
                          View
                        </Button>
                      </div>
                    ),
                  )}
              </div>

              {/* Review Notes */}
              {selectedKYC.kyc?.notes && (
                <Alert variant="info">
                  <strong>Review Notes:</strong>
                  <p className="mb-0">{selectedKYC.kyc.notes}</p>
                </Alert>
              )}

              {selectedKYC.kyc?.rejectionReason && (
                <Alert variant="danger">
                  <strong>Rejection Reason:</strong>
                  <p className="mb-0">{selectedKYC.kyc.rejectionReason}</p>
                </Alert>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedKYC?.kyc?.verificationStatus === "pending" && (
            <Button
              variant="success"
              onClick={() => {
                setShowDetailModal(false);
                setShowReviewModal(true);
              }}
            >
              <FiUserCheck className="me-2" />
              Review Application
            </Button>
          )}
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Review Modal */}
      <Modal
        show={showReviewModal}
        onHide={() => setShowReviewModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Review KYC Application</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedKYC && (
            <div>
              <Alert variant="info">
                <strong>Applicant: {selectedKYC.fullName}</strong>
                <p className="mb-0 mt-2">
                  Business: {selectedKYC.kyc?.businessName}
                  <br />
                  Registration: {selectedKYC.kyc?.registrationNumber}
                </p>
              </Alert>

              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Verification Decision *</Form.Label>
                  <div className="d-flex gap-3">
                    <Form.Check
                      type="radio"
                      label="Approve"
                      name="status"
                      value="approved"
                      checked={reviewData.status === "approved"}
                      onChange={(e) =>
                        setReviewData({
                          ...reviewData,
                          status: e.target.value,
                          rejectionReason: "",
                        })
                      }
                      className="me-3"
                    />
                    <Form.Check
                      type="radio"
                      label="Reject"
                      name="status"
                      value="rejected"
                      checked={reviewData.status === "rejected"}
                      onChange={(e) =>
                        setReviewData({ ...reviewData, status: e.target.value })
                      }
                    />
                    <Form.Check
                      type="radio"
                      label="Request More Info"
                      name="status"
                      value="under_review"
                      checked={reviewData.status === "under_review"}
                      onChange={(e) =>
                        setReviewData({ ...reviewData, status: e.target.value })
                      }
                    />
                  </div>
                </Form.Group>

                {reviewData.status === "rejected" && (
                  <Form.Group className="mb-3">
                    <Form.Label>Rejection Reason *</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Please provide detailed reason for rejection..."
                      value={reviewData.rejectionReason}
                      onChange={(e) =>
                        setReviewData({
                          ...reviewData,
                          rejectionReason: e.target.value,
                        })
                      }
                      required
                    />
                  </Form.Group>
                )}

                <Form.Group className="mb-3">
                  <Form.Label>Internal Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Add internal notes about this application..."
                    value={reviewData.notes}
                    onChange={(e) =>
                      setReviewData({ ...reviewData, notes: e.target.value })
                    }
                  />
                  <Form.Text className="text-muted">
                    These notes are only visible to staff members
                  </Form.Text>
                </Form.Group>
              </Form>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReviewModal(false)}>
            Cancel
          </Button>
          <Button
            variant={reviewData.status === "approved" ? "success" : "danger"}
            onClick={handleReview}
          >
            {reviewData.status === "approved" ? (
              <>
                <FiCheckCircle className="me-2" /> Approve Application
              </>
            ) : reviewData.status === "rejected" ? (
              <>
                <FiXCircle className="me-2" /> Reject Application
              </>
            ) : (
              <>
                <FiClock className="me-2" /> Request More Info
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .kyc-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f4a261, #e76f51);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 18px;
        }
        .kyc-avatar-large {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f4a261, #e76f51);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 32px;
          font-weight: bold;
        }
        .document-icons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .document-icon {
          font-size: 20px;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .document-icon:hover {
          transform: scale(1.1);
        }
        .document-item {
          cursor: pointer;
          transition: all 0.2s;
        }
        .document-item:hover {
          background: var(--bg-secondary) !important;
        }
      `}</style>
    </div>
  );
};

export default KYCReview;
