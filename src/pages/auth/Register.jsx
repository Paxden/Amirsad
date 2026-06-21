/* eslint-disable no-unused-vars */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, Container, Row, Col, Card, Image } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import Alert from "../../components/Alert";
import { FiUser, FiMail, FiPhone, FiLock, FiUserCheck } from "react-icons/fi";

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "supplier",
    companyName: "",
    position: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    const { confirmPassword, ...registerData } = formData;
    const result = await register(registerData);

    if (result.success) {
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } else {
      setError(
        result.error?.message || "Registration failed. Please try again.",
      );
    }

    setLoading(false);
  };

  return (
    <div
      className="min-vh-100 py-5"
     
    >
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={7}>
            <Card className="shadow-lg border-0 fade-in">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  {/* Logo */}
                  <Image 
                    src="/AmirsadLogoAuth.png" 
                    alt="AMIRSAD Gold" 
                    style={{ 
                      width: '150px', 
                      height: '150px', 
                      objectFit: 'contain',
                      borderRadius: '12px'
                    }}
                    fluid
                  />
                  <h2
                    className="fw-bold"
                    style={{ color: "var(--primary-color)" }}
                  >
                    Create Account
                  </h2>
                  <p className="text-muted">
                    Join AMIRSAD Gold Trading Platform
                  </p>
                </div>

                <Alert
                  variant="danger"
                  message={error}
                  onClose={() => setError("")}
                />
                <Alert
                  variant="success"
                  message={success}
                  onClose={() => setSuccess("")}
                />

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <FiUser className="me-2" />
                      Full Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="fullName"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          <FiMail className="me-2" />
                          Email
                        </Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          placeholder="your@email.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          <FiPhone className="me-2" />
                          Phone Number
                        </Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          placeholder="+1234567890"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          <FiLock className="me-2" />
                          Password
                        </Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          placeholder="••••••"
                          value={formData.password}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          <FiLock className="me-2" />
                          Confirm Password
                        </Form.Label>
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          placeholder="••••••"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>
                      <FiUserCheck className="me-2" />I want to register as
                    </Form.Label>
                    <div>
                      <Form.Check
                        inline
                        label="Supplier (Sell Gold)"
                        name="role"
                        type="radio"
                        value="supplier"
                        checked={formData.role === "supplier"}
                        onChange={handleChange}
                      />
                      <Form.Check
                        inline
                        label="Buyer (Purchase Gold)"
                        name="role"
                        type="radio"
                        value="buyer"
                        checked={formData.role === "buyer"}
                        onChange={handleChange}
                      />
                    </div>
                  </Form.Group>

                  {formData.role === "supplier" && (
                    <>
                      <Form.Group className="mb-3">
                        <Form.Label>Company Name (Optional)</Form.Label>
                        <Form.Control
                          type="text"
                          name="companyName"
                          placeholder="Your company name"
                          value={formData.companyName}
                          onChange={handleChange}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Position (Optional)</Form.Label>
                        <Form.Control
                          type="text"
                          name="position"
                          placeholder="Your position"
                          value={formData.position}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </>
                  )}

                  <Button
                    type="submit"
                    variant="warning"
                    className="w-100 py-2 fw-bold"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Creating Account...
                      </>
                    ) : (
                      "Register Now"
                    )}
                  </Button>
                </Form>

                <hr className="my-4" />

                <p className="text-center mb-0">
                  Already have an account?{" "}
                  <Link to="/login" className="text-decoration-none fw-bold">
                    Login here
                  </Link>
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Register;