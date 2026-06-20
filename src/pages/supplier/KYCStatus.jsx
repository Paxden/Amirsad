/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Form,
  Modal,
  Alert,
  ProgressBar,
  ListGroup,
} from "react-bootstrap";
import {
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiUpload,
  FiFileText,
  FiAlertCircle,
  FiRefreshCw,
  FiBriefcase,
  FiMapPin,
} from "react-icons/fi";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const SupplierKYCStatus = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [kycData, setKycData] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    registrationNumber: "",
    taxId: "",
    countryOfRegistration: "",
    businessAddress: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
    documents: {
      certificateOfIncorporation: null,
      taxClearanceCertificate: null,
      directorsIdentification: null,
      proofOfAddress: null,
    },
  });
  const [uploadProgress, setUploadProgress] = useState({});

  useEffect(() => {
    fetchKYCStatus();
  }, []);

  const fetchKYCStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // First check if user object from context has KYC status
      if (user?.kyc?.verificationStatus) {
        setKycData(user.kyc);
        setLoading(false);
        return;
      }

      // If not, fetch from API
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/suppliers/kyc/status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const data = await response.json();
      if (data.success) {
        setKycData(data.kyc || data.data || { verificationStatus: "not_submitted" });
        
        // Update user context if needed
        if (data.kyc && updateUser) {
          updateUser({ ...user, kyc: data.kyc });
        }
      } else {
        // Fallback: check user object
        if (user?.kyc) {
          setKycData(user.kyc);
        } else {
          setKycData({ verificationStatus: "not_submitted" });
        }
      }
    } catch (error) {
      console.error("Failed to fetch KYC status:", error);
      // Fallback: use user data from context
      if (user?.kyc) {
        setKycData(user.kyc);
      } else {
        setKycData({ verificationStatus: "not_submitted" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (docType, file) => {
    if (file) {
      setFormData({
        ...formData,
        documents: {
          ...formData.documents,
          [docType]: file,
        },
      });
      setUploadProgress({ ...uploadProgress, [docType]: 100 });
    }
  };

  const handleSubmitKYC = async () => {
    if (
      !formData.businessName ||
      !formData.registrationNumber ||
      !formData.countryOfRegistration
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const requiredDocs = [
      "certificateOfIncorporation",
      "taxClearanceCertificate",
      "directorsIdentification",
      "proofOfAddress",
    ];

    const missingDocs = requiredDocs.filter((doc) => !formData.documents[doc]);

    if (missingDocs.length > 0) {
      toast.error(
        `Please upload all required documents. Missing: ${missingDocs.join(", ")}`,
      );
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const submitFormData = new FormData();
      submitFormData.append("businessName", formData.businessName);
      submitFormData.append("registrationNumber", formData.registrationNumber);
      submitFormData.append("taxId", formData.taxId || "");
      submitFormData.append(
        "countryOfRegistration",
        formData.countryOfRegistration,
      );
      submitFormData.append(
        "businessAddress",
        JSON.stringify(formData.businessAddress),
      );

      Object.keys(formData.documents).forEach((key) => {
        if (formData.documents[key]) {
          submitFormData.append(key, formData.documents[key]);
        }
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/suppliers/submit-kyc`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: submitFormData,
        }
      );
      
      const data = await response.json();
      if (data.success) {
        toast.success(
          "KYC submitted successfully! Our team will review your application.",
        );
        setShowSubmitModal(false);
        setFormData({
          businessName: "",
          registrationNumber: "",
          taxId: "",
          countryOfRegistration: "",
          businessAddress: {
            street: "",
            city: "",
            state: "",
            postalCode: "",
            country: "",
          },
          documents: {
            certificateOfIncorporation: null,
            taxClearanceCertificate: null,
            directorsIdentification: null,
            proofOfAddress: null,
          },
        });
        fetchKYCStatus();
      } else {
        toast.error(data.message || "Failed to submit KYC");
      }
    } catch (error) {
      console.error("Submit KYC error:", error);
      toast.error(error.response?.data?.message || "Failed to submit KYC");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      not_submitted: {
        icon: FiAlertCircle,
        color: "secondary",
        title: "KYC Not Submitted",
        message: "Please complete your KYC verification to start selling gold.",
        action: "Submit KYC Now",
        showSubmit: true,
      },
      pending: {
        icon: FiClock,
        color: "warning",
        title: "KYC Under Review",
        message:
          "Your documents are being reviewed by our team. This usually takes 1-2 business days.",
        action: "View Submission",
        showSubmit: false,
      },
      under_review: {
        icon: FiClock,
        color: "info",
        title: "KYC Under Review",
        message:
          "Your application is being processed. We'll notify you once completed.",
        action: "Track Status",
        showSubmit: false,
      },
      approved: {
        icon: FiCheckCircle,
        color: "success",
        title: "KYC Approved 🎉",
        message:
          "Your account is fully verified. You can now list and sell gold.",
        action: "View Certificate",
        showSubmit: false,
      },
      rejected: {
        icon: FiXCircle,
        color: "danger",
        title: "KYC Rejected",
        message:
          "Your application was not approved. Please check the reason and resubmit.",
        action: "Resubmit Application",
        showSubmit: true,
      },
    };
    return configs[status] || configs.not_submitted;
  };

  const kycStatus = kycData?.verificationStatus || "not_submitted";
  const statusConfig = getStatusConfig(kycStatus);
  const StatusIcon = statusConfig.icon;

  // Log the status for debugging
  console.log("Current KYC Status:", kycStatus);
  console.log("KYC Data:", kycData);

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
        breadcrumbs={[{ label: "Supplier" }, { label: "KYC Status" }]}
        actions={
          <Button variant="outline-secondary" onClick={fetchKYCStatus}>
            <FiRefreshCw className="me-2" />
            Refresh
          </Button>
        }
      />

      {/* Main Status Card */}
      <Row className="justify-content-center mb-4">
        <Col lg={8}>
          <Card className="border-0 shadow-lg text-center">
            <Card.Body className="p-5">
              <div
                className={`mb-4 d-inline-flex p-3 rounded-circle bg-${statusConfig.color} bg-opacity-10`}
              >
                <StatusIcon
                  size={48}
                  className={`text-${statusConfig.color}`}
                />
              </div>
              <h3 className="fw-bold mb-2">{statusConfig.title}</h3>
              <p className="text-muted mb-4">{statusConfig.message}</p>

              {kycStatus === "approved" && (
                <Alert variant="success" className="text-start">
                  <FiCheckCircle className="me-2" />
                  <strong>Congratulations!</strong> Your account is fully
                  verified. You can now start selling gold.
                </Alert>
              )}

              {kycStatus === "rejected" && kycData?.rejectionReason && (
                <Alert variant="danger" className="text-start">
                  <strong>Reason for rejection:</strong>
                  <p className="mb-0 mt-1">{kycData.rejectionReason}</p>
                </Alert>
              )}

              {kycStatus === "pending" && (
                <div className="mt-3">
                  <ProgressBar
                    animated
                    now={75}
                    variant="warning"
                    className="mb-2"
                    style={{ height: "8px" }}
                  />
                  <p className="text-muted small">
                    Estimated completion: 1-2 business days
                  </p>
                </div>
              )}

              {(kycStatus === "not_submitted" || kycStatus === "rejected") && (
                <Button
                  variant="warning"
                  size="lg"
                  onClick={() => setShowSubmitModal(true)}
                >
                  <FiUpload className="me-2" />
                  {statusConfig.action}
                </Button>
              )}

              {kycStatus === "approved" && (
                <Button
                  variant="success"
                  size="lg"
                  disabled
                >
                  <FiCheckCircle className="me-2" />
                  KYC Verified ✓
                </Button>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* KYC Requirements */}
      <Row className="g-4 mb-4">
        <Col md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-transparent border-0 pt-4">
              <h5 className="fw-bold mb-0">Required Information</h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item className="d-flex align-items-center gap-3 bg-transparent px-0">
                  <FiBriefcase size={20} className="text-primary" />
                  <div>
                    <strong>Business Name</strong>
                    <p className="mb-0 small text-muted">Legal business name</p>
                  </div>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex align-items-center gap-3 bg-transparent px-0">
                  <FiFileText size={20} className="text-primary" />
                  <div>
                    <strong>Registration Number</strong>
                    <p className="mb-0 small text-muted">
                      Company registration / RC number
                    </p>
                  </div>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex align-items-center gap-3 bg-transparent px-0">
                  <FiFileText size={20} className="text-primary" />
                  <div>
                    <strong>Tax ID / VAT Number</strong>
                    <p className="mb-0 small text-muted">
                      Tax identification number
                    </p>
                  </div>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex align-items-center gap-3 bg-transparent px-0">
                  <FiMapPin size={20} className="text-primary" />
                  <div>
                    <strong>Country of Registration</strong>
                    <p className="mb-0 small text-muted">
                      Where your business is registered
                    </p>
                  </div>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex align-items-center gap-3 bg-transparent px-0">
                  <FiMapPin size={20} className="text-primary" />
                  <div>
                    <strong>Business Address</strong>
                    <p className="mb-0 small text-muted">
                      Physical business address
                    </p>
                  </div>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-transparent border-0 pt-4">
              <h5 className="fw-bold mb-0">Required Documents</h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item className="d-flex align-items-center gap-3 bg-transparent px-0">
                  <FiFileText size={20} className="text-primary" />
                  <div>
                    <strong>Certificate of Incorporation</strong>
                    <p className="mb-0 small text-muted">
                      Company registration certificate
                    </p>
                  </div>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex align-items-center gap-3 bg-transparent px-0">
                  <FiFileText size={20} className="text-primary" />
                  <div>
                    <strong>Tax Clearance Certificate</strong>
                    <p className="mb-0 small text-muted">
                      Proof of tax compliance
                    </p>
                  </div>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex align-items-center gap-3 bg-transparent px-0">
                  <FiFileText size={20} className="text-primary" />
                  <div>
                    <strong>Director's Identification</strong>
                    <p className="mb-0 small text-muted">
                      Passport or ID of company director(s)
                    </p>
                  </div>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex align-items-center gap-3 bg-transparent px-0">
                  <FiFileText size={20} className="text-primary" />
                  <div>
                    <strong>Proof of Address</strong>
                    <p className="mb-0 small text-muted">
                      Utility bill or bank statement
                    </p>
                  </div>
                </ListGroup.Item>
              </ListGroup>
              <Alert variant="info" className="mt-3">
                <small>
                  <strong>Supported formats:</strong> PDF, JPG, PNG (Max 5MB per
                  file)
                </small>
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Verification Steps */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-transparent border-0 pt-4">
          <h5 className="fw-bold mb-0">Verification Process</h5>
        </Card.Header>
        <Card.Body>
          <Row className="g-4">
            <Col md={3}>
              <div className="text-center">
                <div
                  className={`rounded-circle bg-primary bg-opacity-10 d-inline-flex p-3 mb-3`}
                >
                  <span className="fw-bold text-primary">1</span>
                </div>
                <h6 className="fw-bold">Submit Application</h6>
                <p className="small text-muted">
                  Fill in your business details and upload required documents
                </p>
              </div>
            </Col>
            <Col md={3}>
              <div className="text-center">
                <div
                  className={`rounded-circle bg-warning bg-opacity-10 d-inline-flex p-3 mb-3`}
                >
                  <span className="fw-bold text-warning">2</span>
                </div>
                <h6 className="fw-bold">Under Review</h6>
                <p className="small text-muted">
                  Our compliance team reviews your application (1-2 days)
                </p>
              </div>
            </Col>
            <Col md={3}>
              <div className="text-center">
                <div
                  className={`rounded-circle bg-info bg-opacity-10 d-inline-flex p-3 mb-3`}
                >
                  <span className="fw-bold text-info">3</span>
                </div>
                <h6 className="fw-bold">Verification</h6>
                <p className="small text-muted">
                  We verify your documents and business information
                </p>
              </div>
            </Col>
            <Col md={3}>
              <div className="text-center">
                <div
                  className={`rounded-circle bg-success bg-opacity-10 d-inline-flex p-3 mb-3`}
                >
                  <span className="fw-bold text-success">4</span>
                </div>
                <h6 className="fw-bold">Activation</h6>
                <p className="small text-muted">
                  Your account is activated for trading
                </p>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Submit KYC Modal */}
      <Modal
        show={showSubmitModal}
        onHide={() => setShowSubmitModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Submit KYC Application</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <h6 className="fw-bold mb-3">Business Information</h6>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Business Name *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your registered business name"
                    value={formData.businessName}
                    onChange={(e) =>
                      setFormData({ ...formData, businessName: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Registration Number *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="RC / Registration number"
                    value={formData.registrationNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        registrationNumber: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tax ID / VAT Number</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Tax identification number"
                    value={formData.taxId}
                    onChange={(e) =>
                      setFormData({ ...formData, taxId: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Country of Registration *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Country"
                    value={formData.countryOfRegistration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        countryOfRegistration: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <h6 className="fw-bold mb-3 mt-3">Business Address</h6>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Street Address</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Street address"
                    value={formData.businessAddress.street}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        businessAddress: {
                          ...formData.businessAddress,
                          street: e.target.value,
                        },
                      })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="City"
                    value={formData.businessAddress.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        businessAddress: {
                          ...formData.businessAddress,
                          city: e.target.value,
                        },
                      })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>State/Province</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="State"
                    value={formData.businessAddress.state}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        businessAddress: {
                          ...formData.businessAddress,
                          state: e.target.value,
                        },
                      })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Postal Code</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Postal code"
                    value={formData.businessAddress.postalCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        businessAddress: {
                          ...formData.businessAddress,
                          postalCode: e.target.value,
                        },
                      })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Country</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Country"
                    value={formData.businessAddress.country}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        businessAddress: {
                          ...formData.businessAddress,
                          country: e.target.value,
                        },
                      })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <h6 className="fw-bold mb-3 mt-3">Required Documents</h6>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Certificate of Incorporation *</Form.Label>
                  <Form.Control
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) =>
                      handleFileChange(
                        "certificateOfIncorporation",
                        e.target.files[0],
                      )
                    }
                  />
                  {uploadProgress.certificateOfIncorporation && (
                    <ProgressBar
                      now={uploadProgress.certificateOfIncorporation}
                      className="mt-1"
                      style={{ height: "3px" }}
                    />
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tax Clearance Certificate *</Form.Label>
                  <Form.Control
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) =>
                      handleFileChange(
                        "taxClearanceCertificate",
                        e.target.files[0],
                      )
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Director's Identification *</Form.Label>
                  <Form.Control
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) =>
                      handleFileChange(
                        "directorsIdentification",
                        e.target.files[0],
                      )
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Proof of Address *</Form.Label>
                  <Form.Control
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) =>
                      handleFileChange("proofOfAddress", e.target.files[0])
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <Alert variant="warning" className="mt-3">
              <small>
                <strong>Important:</strong> Please ensure all documents are
                clear and legible. False information or forged documents may
                result in account suspension.
              </small>
            </Alert>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSubmitModal(false)}>
            Cancel
          </Button>
          <Button
            variant="warning"
            onClick={handleSubmitKYC}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Submitting...
              </>
            ) : (
              <>
                <FiUpload className="me-2" />
                Submit Application
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SupplierKYCStatus;