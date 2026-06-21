// pages/VerifyEmail.jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Button,
  Image,
} from "react-bootstrap";
import {
  FiCheckCircle,
  FiXCircle,
  FiArrowRight,
  FiRefreshCw,
} from "react-icons/fi";
import api from "../../api/axios";

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await api.get(`/auth/verify-email/${token}`);
        if (response.data.success) {
          setStatus("success");
          setMessage(response.data.message);
        } else {
          setStatus("error");
          setMessage(response.data.message);
        }
      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data?.message || "Email verification failed");
      }
    };

    verifyEmail();
  }, [token]);

  const renderContent = () => {
    switch (status) {
      case "verifying":
        return (
          <>
            <div className="text-center mb-4">
              <div
                className="bg-warning bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3"
                style={{ width: "80px", height: "80px" }}
              >
                <Spinner
                  animation="border"
                  variant="warning"
                  className="m-auto"
                  style={{ width: "40px", height: "40px" }}
                />
              </div>
              <h4 className="fw-bold">Verifying Your Email</h4>
              <p className="text-muted">Please wait while we verify your email address...</p>
            </div>
          </>
        );

      case "success":
        return (
          <>
            <div className="text-center mb-4">
              <div
                className="bg-success bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3"
                style={{ width: "80px", height: "80px" }}
              >
                <FiCheckCircle size={45} className="text-success m-auto" />
              </div>
              <h4 className="fw-bold text-success">Verification Successful!</h4>
              <p className="text-muted mt-2">{message || "Your email has been verified successfully."}</p>
            </div>
            <div className="d-grid gap-2">
              <Button
                variant="warning"
                as={Link}
                to="/login"
                className="py-2 fw-bold"
                style={{
                  backgroundColor: "var(--primary-color)",
                  borderColor: "var(--primary-color)",
                  borderRadius: "10px",
                }}
              >
                <FiArrowRight className="me-2" />
                Proceed to Login
              </Button>
            </div>
          </>
        );

      case "error":
        return (
          <>
            <div className="text-center mb-4">
              <div
                className="bg-danger bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3"
                style={{ width: "80px", height: "80px" }}
              >
                <FiXCircle size={45} className="text-danger m-auto" />
              </div>
              <h4 className="fw-bold text-danger">Verification Failed</h4>
              <p className="text-muted mt-2">{message || "Unable to verify your email. Please try again."}</p>
            </div>
            <div className="d-grid gap-2">
              <Button
                variant="warning"
                as={Link}
                to="/resend-verification"
                className="py-2 fw-bold"
                style={{
                  backgroundColor: "var(--primary-color)",
                  borderColor: "var(--primary-color)",
                  borderRadius: "10px",
                }}
              >
                <FiRefreshCw className="me-2" />
                Resend Verification Email
              </Button>
              <Button
                variant="outline-secondary"
                as={Link}
                to="/login"
                className="py-2"
                style={{ borderRadius: "10px" }}
              >
                Back to Login
              </Button>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center py-5"
      
    >
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card
              className="border-0 shadow-lg fade-in"
              style={{
                borderRadius: "20px",
                overflow: "hidden",
              }}
            >
              <Card.Body className="p-5">
                {/* Header with Logo */}
                <div className="text-center mb-4">
                  <Image
                    src="/AmirsadLogoAuth.png"
                    alt="AMIRSAD Gold"
                    className="mb-3"
                    style={{
                      width: "15px",
                      height: "150px",
                      objectFit: "contain",
                      borderRadius: "12px",
                    }}
                    fluid
                  />
                  <h2
                    className="fw-bold"
                    style={{ color: "var(--primary-color)" }}
                  >
                    Email Verification
                  </h2>
                  <p className="text-muted">Confirm your email address to get started</p>
                </div>

                {/* Content based on status */}
                {renderContent()}

                {/* Decorative Footer */}
                <hr className="my-4" />
                <p className="text-center text-muted small mb-0">
                  © 2024 AMIRSAD ENERGY CONSULT. All rights reserved.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default VerifyEmail;