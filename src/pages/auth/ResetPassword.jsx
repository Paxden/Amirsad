// src/pages/auth/ResetPassword.jsx - Premium Glass Version with Logo

import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
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
  FiEye,
  FiEyeOff,
  FiCheckCircle,
  FiArrowLeft,
  FiShield,
  FiCheck,
} from "react-icons/fi";
import { authAPI } from "../../api/auth";
import { toast } from "react-hot-toast";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

  const validatePassword = (password) => {
    return {
      minLength: password.length >= 6,
      hasUpperCase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }

    const validation = validatePassword(formData.password);
    if (
      !validation.minLength ||
      !validation.hasUpperCase ||
      !validation.hasNumber
    ) {
      setError("Password does not meet requirements");
      toast.error("Please meet all password requirements");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await authAPI.resetPassword(token, formData.password);

      if (response.success) {
        setSuccess(true);
        toast.success("Password reset successful!");

        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setError(response.message || "Failed to reset password");
        toast.error(response.message || "Failed to reset password");
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        "Failed to reset password. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const validation = validatePassword(formData.password);

  if (success) {
    return (
      <div
        className="min-vh-100 d-flex align-items-center"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <Container>
          <Row className="justify-content-center">
            <Col md={6} lg={5}>
              <Card className="shadow-lg border-0 text-center fade-in">
                <Card.Body className="p-5">
                  <div className="mb-4">
                    <div
                      className="bg-success bg-opacity-10 rounded-circle d-inline-flex p-3"
                      style={{ width: "80px", height: "80px" }}
                    >
                      <FiCheckCircle size={45} className="text-success m-auto" />
                    </div>
                  </div>
                  <h3 className="fw-bold mb-3">
                    Password Reset Successful!
                  </h3>
                  <p className="text-muted mb-4">
                    Your password has been reset successfully. You will be
                    redirected to login page shortly.
                  </p>
                  <Button
                    variant="warning"
                    onClick={() => navigate("/login")}
                    className="px-4"
                  >
                    Go to Login
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  return (
    <div
      className="min-vh-100 d-flex align-items-center py-5"
     
    >
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
                {/* Header with Logo */}
                <div className="text-center mb-4">
                  <Image
                    src="/AmirsadLogoAuth.png"
                    alt="AMIRSAD Gold"
                    className="mb-3"
                    style={{
                      width: "70px",
                      height: "70px",
                      objectFit: "contain",
                      borderRadius: "12px",
                    }}
                    fluid
                  />
                  <div
                    className="bg-warning bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3"
                    style={{ width: "80px", height: "80px" }}
                  >
                    <FiShield size={40} className="text-warning m-auto" />
                  </div>
                  <h2 className="fw-bold">Create New Password</h2>
                  <p className="text-muted">
                    Secure your account with a strong password
                  </p>
                </div>

                {error && (
                  <Alert
                    variant="danger"
                    className="fade-in"
                    onClose={() => setError("")}
                    dismissible
                  >
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">New Password</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="py-2"
                        placeholder="Enter new password"
                        style={{ borderRadius: "10px" }}
                      />
                      <Button
                        type="button"
                        variant="link"
                        onClick={() => setShowPassword(!showPassword)}
                        className="position-absolute end-0 top-0 bottom-0"
                        style={{
                          color: "var(--text-secondary)",
                          textDecoration: "none",
                          zIndex: 2,
                        }}
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </Button>
                    </div>

                    {/* Password Requirements Checklist */}
                    <div className="mt-2">
                      <div className="d-flex align-items-center gap-2 small mb-1">
                        {validation.minLength ? (
                          <FiCheck className="text-success" size={12} />
                        ) : (
                          <div
                            className="bg-secondary rounded-circle"
                            style={{ width: "12px", height: "12px" }}
                          ></div>
                        )}
                        <span
                          className={
                            validation.minLength ? "text-success" : "text-muted"
                          }
                        >
                          At least 6 characters
                        </span>
                      </div>
                      <div className="d-flex align-items-center gap-2 small mb-1">
                        {validation.hasUpperCase ? (
                          <FiCheck className="text-success" size={12} />
                        ) : (
                          <div
                            className="bg-secondary rounded-circle"
                            style={{ width: "12px", height: "12px" }}
                          ></div>
                        )}
                        <span
                          className={
                            validation.hasUpperCase
                              ? "text-success"
                              : "text-muted"
                          }
                        >
                          One uppercase letter
                        </span>
                      </div>
                      <div className="d-flex align-items-center gap-2 small">
                        {validation.hasNumber ? (
                          <FiCheck className="text-success" size={12} />
                        ) : (
                          <div
                            className="bg-secondary rounded-circle"
                            style={{ width: "12px", height: "12px" }}
                          ></div>
                        )}
                        <span
                          className={
                            validation.hasNumber ? "text-success" : "text-muted"
                          }
                        >
                          One number
                        </span>
                      </div>
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      Confirm Password
                    </Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className="py-2"
                        placeholder="Confirm new password"
                        style={{ borderRadius: "10px" }}
                        isInvalid={
                          formData.confirmPassword &&
                          formData.password !== formData.confirmPassword
                        }
                      />
                      <Button
                        type="button"
                        variant="link"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="position-absolute end-0 top-0 bottom-0"
                        style={{
                          color: "var(--text-secondary)",
                          textDecoration: "none",
                          zIndex: 2,
                        }}
                      >
                        {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                      </Button>
                    </div>
                    {formData.confirmPassword &&
                      formData.password === formData.confirmPassword && (
                        <div className="mt-1">
                          <small className="text-success">
                            ✓ Passwords match
                          </small>
                        </div>
                      )}
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="warning"
                    className="w-100 py-2 fw-bold"
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
                        Resetting...
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </Button>
                </Form>

                <div className="text-center mt-4">
                  <Link to="/login" className="text-decoration-none small">
                    <FiArrowLeft className="me-1" />
                    Back to Login
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ResetPassword;