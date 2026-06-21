import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Card,
  Alert,
  Image,
} from "react-bootstrap";
import {
  FiMail,
  FiSend,
  FiArrowLeft,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import { authAPI } from "../../api/auth";

const ResendVerification = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await authAPI.resendVerification(email);
      if (response.success) {
        setMessage(
          "Verification email has been sent to your address. Please check your inbox."
        );
      } else {
        setError(response.message || "Failed to send verification email");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to send verification email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center py-5"
     
    >
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card className="shadow-lg border-0 fade-in">
              <Card.Body className="p-5">
                {/* Header with Logo */}
                <div className="text-center mb-4">
                  <Image
                    src="/AmirsadLogoAuth.png"
                    alt="AMIRSAD Gold"
                    className="mb-3"
                    style={{
                      width: "150px",
                      height: "150px",
                      objectFit: "contain",
                      borderRadius: "12px",
                    }}
                    fluid
                  />
                  <div className="mb-3">
                    <FiMail size={48} className="text-warning" />
                  </div>
                  <h2
                    className="fw-bold"
                    style={{ color: "var(--primary-color)" }}
                  >
                    Resend Verification Email
                  </h2>
                  <p className="text-muted mt-2">
                    Didn't receive the verification link? We'll send you a new
                    one.
                  </p>
                </div>

                {/* Success Message */}
                {message && (
                  <Alert
                    variant="success"
                    className="d-flex align-items-center fade-in"
                    onClose={() => setMessage("")}
                    dismissible
                  >
                    <FiCheckCircle className="me-2 flex-shrink-0" size={18} />
                    <div>{message}</div>
                  </Alert>
                )}

                {/* Error Message */}
                {error && (
                  <Alert
                    variant="danger"
                    className="d-flex align-items-center fade-in"
                    onClose={() => setError("")}
                    dismissible
                  >
                    <FiAlertCircle className="me-2 flex-shrink-0" size={18} />
                    <div>{error}</div>
                  </Alert>
                )}

                {/* Info Box */}
                <div
                  className="bg-light p-3 rounded mb-4"
                  style={{
                    backgroundColor: "var(--bg-secondary) !important",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <p className="mb-0 small text-muted">
                    <strong>Note:</strong> Please check your spam folder if you
                    don't see the email in your inbox. The verification link
                    expires in 24 hours.
                  </p>
                </div>

                {/* Form */}
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      <FiMail className="me-2" />
                      Email Address
                    </Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter your registered email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                      className="py-2"
                    />
                    <Form.Text className="text-muted">
                      We'll send a new verification link to this email
                    </Form.Text>
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="warning"
                    className="w-100 py-2 fw-bold mb-3"
                    disabled={loading}
                    style={{
                      backgroundColor: "var(--primary-color)",
                      borderColor: "var(--primary-color)",
                    }}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Sending Verification Email...
                      </>
                    ) : (
                      <>
                        <FiSend className="me-2" />
                        Send Verification Email
                      </>
                    )}
                  </Button>
                </Form>

                <hr className="my-4" />

                {/* Back to Login Link */}
                <div className="text-center">
                  <Link to="/login" className="text-decoration-none">
                    <FiArrowLeft className="me-1" />
                    Back to Login
                  </Link>
                </div>

                {/* Additional Help */}
                <div className="text-center mt-3">
                  <p className="small text-muted mb-0">
                    Need help?{" "}
                    <Link to="/contact-support" className="text-decoration-none">
                      Contact Support
                    </Link>
                  </p>
                </div>
              </Card.Body>
            </Card>

            {/* Decorative Elements */}
            <div className="text-center mt-4">
              <p className="text-white-50 small">
                © 2024 AMIRSAD ENERGY CONSULT. All rights reserved.
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ResendVerification;