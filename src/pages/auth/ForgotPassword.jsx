// src/pages/auth/ForgotPassword.jsx - Premium Glass Version with Logo

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
  FiSend,
  FiArrowLeft,
  FiCheckCircle,
  FiAlertCircle,
  FiHelpCircle,
  FiShield,
} from "react-icons/fi";
import { authAPI } from "../../api/auth";
import { toast } from "react-hot-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.forgotPassword(email);

      if (response.success) {
        setMessage("Password reset link has been sent to your email address.");
        setEmailSent(true);
        toast.success("Reset link sent! Check your email.");
        setEmail("");
      } else {
        setError(response.message || "Failed to send reset link");
        toast.error(response.message || "Failed to send reset link");
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        "Failed to send reset link. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center py-5"
     
    >
      {/* Animated Background Elements */}
      <div
        className="position-absolute w-100 h-100"
        style={{ overflow: "hidden" }}
      >
        <div
          className="position-absolute rounded-circle"
          style={{
            width: "300px",
            height: "300px",
            background: "rgba(255, 255, 255, 0.1)",
            top: "-150px",
            right: "-150px",
            borderRadius: "50%",
            animation: "pulse 4s ease-in-out infinite",
          }}
        ></div>
        <div
          className="position-absolute rounded-circle"
          style={{
            width: "200px",
            height: "200px",
            background: "rgba(255, 255, 255, 0.05)",
            bottom: "-100px",
            left: "-100px",
            borderRadius: "50%",
            animation: "pulse 4s ease-in-out infinite 2s",
          }}
        ></div>
      </div>

      <Container className="position-relative">
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card
              className="border-0 fade-in"
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                borderRadius: "20px",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
              }}
            >
              <Card.Body className="p-5">
                {!emailSent ? (
                  <>
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
                      <div className="mb-2">
                        <div
                          className="bg-warning bg-opacity-10 rounded-circle d-inline-flex p-3"
                          style={{ width: "80px", height: "80px" }}
                        >
                          <FiShield size={40} className="text-warning m-auto" />
                        </div>
                      </div>
                      <h2 className="fw-bold">Forgot Password?</h2>
                      <p className="text-muted">
                        Enter your email to reset your password
                      </p>
                    </div>

                    {message && (
                      <Alert
                        variant="success"
                        className="fade-in"
                        onClose={() => setMessage("")}
                        dismissible
                      >
                        <div className="d-flex">
                          <FiCheckCircle
                            className="me-2 flex-shrink-0"
                            size={18}
                          />
                          <div>{message}</div>
                        </div>
                      </Alert>
                    )}

                    {error && (
                      <Alert
                        variant="danger"
                        className="fade-in"
                        onClose={() => setError("")}
                        dismissible
                      >
                        <div className="d-flex">
                          <FiAlertCircle
                            className="me-2 flex-shrink-0"
                            size={18}
                          />
                          <div>{error}</div>
                        </div>
                      </Alert>
                    )}

                    <div
                      className="bg-light p-3 rounded mb-4"
                      style={{ backgroundColor: "rgba(0,0,0,0.03)" }}
                    >
                      <div className="d-flex">
                        <FiHelpCircle
                          className="text-warning me-2 flex-shrink-0"
                          size={20}
                        />
                        <div>
                          <p className="mb-0 small">
                            <strong>Security Note:</strong> We'll send a secure
                            link that expires in 1 hour.
                          </p>
                        </div>
                      </div>
                    </div>

                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold">
                          Email Address
                        </Form.Label>
                        <Form.Control
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          autoFocus
                          className="py-2"
                          style={{ borderRadius: "10px" }}
                        />
                      </Form.Group>

                      <Button
                        type="submit"
                        variant="warning"
                        className="w-100 py-2 fw-bold mb-3"
                        disabled={loading}
                        style={{
                          backgroundColor: "var(--primary-color)",
                          borderColor: "var(--primary-color)",
                          borderRadius: "10px",
                        }}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Sending...
                          </>
                        ) : (
                          <>
                            <FiSend className="me-2" />
                            Send Reset Link
                          </>
                        )}
                      </Button>
                    </Form>
                  </>
                ) : (
                  // Success State
                  <div className="text-center py-4">
                    <div className="mb-4">
                      <div
                        className="bg-success bg-opacity-10 rounded-circle d-inline-flex p-3"
                        style={{ width: "80px", height: "80px" }}
                      >
                        <FiCheckCircle
                          size={45}
                          className="text-success m-auto"
                        />
                      </div>
                    </div>
                    <h3 className="fw-bold mb-3">Check Your Email</h3>
                    <p className="text-muted mb-4">
                      We've sent a password reset link to{" "}
                      <strong>{email}</strong>
                    </p>
                    <div
                      className="alert alert-info"
                      style={{ fontSize: "0.875rem" }}
                    >
                      <small>
                        Didn't receive the email? Check your spam folder or try
                        again.
                      </small>
                    </div>
                    <Button
                      variant="outline-primary"
                      onClick={() => {
                        setEmailSent(false);
                        setMessage("");
                      }}
                      className="mt-2"
                    >
                      Use different email
                    </Button>
                  </div>
                )}

                {/* Navigation Links */}
                <div className="text-center mt-4">
                  <Link to="/login" className="text-decoration-none small">
                    <FiArrowLeft className="me-1" />
                    Back to Login
                  </Link>
                </div>

                {!emailSent && (
                  <div className="text-center mt-3">
                    <p className="small text-muted mb-0">
                      Remember your password?{" "}
                      <Link to="/login" className="text-decoration-none">
                        Sign in
                      </Link>
                    </p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;