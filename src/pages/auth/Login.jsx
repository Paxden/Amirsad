import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, Container, Row, Col, Card, Image } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import Alert from "../../components/Alert";
import { FiMail, FiLock, FiLogIn } from "react-icons/fi";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await login(email, password);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error?.message || "Login failed. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center"
      style={{ 
        background: 'linear-gradient(135deg, # 0%, # 100%)'
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card className="shadow-lg border-0 fade-in">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  {/* Logo */}
                  <Image 
                    src="/AmirsadLogoAuth.png" 
                    alt="AMIRSAD Gold" 
                    className=""
                    style={{ 
                      width: '150px', 
                      height: '150px', 
                      objectFit: 'contain',
                      borderRadius: '12px'
                    }}
                    fluid
                  />
                  <h3
                    className="fw-bold"
                    style={{ color: "var(--primary-color)" }}
                  >
                   Welcome Back!
                  </h3>
                  <p className="text-muted">
                    Please login to your account
                  </p>
                </div>

                <Alert
                  variant="danger"
                  message={error}
                  onClose={() => setError("")}
                />

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <FiMail className="me-2" />
                      Email Address
                    </Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>
                      <FiLock className="me-2" />
                      Password
                    </Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <div className="d-flex justify-content-between mb-3">
                    <Link
                      to="/forgot-password"
                      className="text-decoration-none small"
                    >
                      Forgot Password?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    variant="warning"
                    className="w-100 py-2 fw-bold"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Logging in...
                      </>
                    ) : (
                      <>
                        <FiLogIn className="me-2" />
                        Login
                      </>
                    )}
                  </Button>
                </Form>

                <hr className="my-4" />

                <p className="text-center mb-0">
                  Don't have an account?{" "}
                  <Link to="/register" className="text-decoration-none fw-bold">
                    Register here
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

export default Login;