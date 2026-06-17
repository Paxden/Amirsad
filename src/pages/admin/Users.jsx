/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
/* eslint-disable no-unused-vars */
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
  Alert,
  Dropdown,
  InputGroup,
} from "react-bootstrap";
import {
  FiUsers,
  FiUserPlus,
  FiSearch,
  FiClock,
  FiMoreVertical,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiRefreshCw,
  FiUserCheck,
  FiUserX,
  FiMail,
  FiPhone,
  FiCalendar,
  FiLock,
  FiBriefcase,
} from "react-icons/fi";
import PageHeader from "../../components/PageHeader";
import toast from "react-hot-toast";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filters, setFilters] = useState({
    role: "",
    status: "",
    search: "",
  });
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "supplier",
    password: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const queryParams = new URLSearchParams();
      if (filters.role) queryParams.append("role", filters.role);
      if (filters.status)
        queryParams.append("isApproved", filters.status === "approved");
      if (filters.search) queryParams.append("search", filters.search);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/users?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();
      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName || formData.fullName.trim().length < 2) {
      errors.fullName =
        "Full name is required and must be at least 2 characters";
    }
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddUser = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/users/staff`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            role: formData.role,
            password: formData.password,
          }),
        },
      );
      const data = await response.json();
      if (data.success) {
        toast.success(`${formData.role} created successfully!`);
        setShowUserModal(false);
        resetForm();
        fetchUsers();
      } else {
        toast.error(data.message || "Failed to create user");
      }
    } catch (error) {
      console.error("Failed to create user:", error);
      toast.error(error.response?.data?.message || "Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      role: "supplier",
      password: "",
      confirmPassword: "",
    });
    setFormErrors({});
  };

  const handleApproveUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/users/${userId}/approve`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      const data = await response.json();
      if (data.success) {
        toast.success("User approved successfully");
        fetchUsers();
      }
    } catch (error) {
      toast.error("Failed to approve user");
    }
  };

  const handleSuspendUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/users/${userId}/suspend`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason: "Violation of terms" }),
        },
      );
      const data = await response.json();
      if (data.success) {
        toast.success("User suspended successfully");
        fetchUsers();
      }
    } catch (error) {
      toast.error("Failed to suspend user");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/auth/users/${userId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await response.json();
        if (data.success) {
          toast.success("User deleted successfully");
          fetchUsers();
        }
      } catch (error) {
        toast.error("Failed to delete user");
      }
    }
  };

  const getRoleBadge = (role) => {
    const variants = {
      admin: "danger",
      staff: "info",
      supplier: "warning",
      buyer: "success",
    };
    return <Badge bg={variants[role] || "secondary"}>{role}</Badge>;
  };

  const getStatusBadge = (user) => {
    if (!user.isActive) return <Badge bg="danger">Suspended</Badge>;
    if (!user.isApproved) return <Badge bg="warning">Pending Approval</Badge>;
    if (!user.isVerified) return <Badge bg="info">Email Unverified</Badge>;
    return <Badge bg="success">Active</Badge>;
  };

  const stats = {
    total: users.length,
    active: users.filter((u) => u.isActive && u.isApproved).length,
    pending: users.filter((u) => !u.isApproved && u.isActive).length,
    suspended: users.filter((u) => !u.isActive).length,
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
        title="User Management"
        breadcrumbs={[{ label: "Admin" }, { label: "Users" }]}
        actions={
          <Button variant="warning" onClick={() => setShowUserModal(true)}>
            <FiUserPlus className="me-2" />
            Add User
          </Button>
        }
      />

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small">Total Users</p>
                  <h3 className="fw-bold mb-0">{stats.total}</h3>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <FiUsers size={24} className="text-primary" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small">Active Users</p>
                  <h3 className="fw-bold mb-0 text-success">{stats.active}</h3>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <FiUserCheck size={24} className="text-success" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small">Pending Approval</p>
                  <h3 className="fw-bold mb-0 text-warning">{stats.pending}</h3>
                </div>
                <div className="bg-warning bg-opacity-10 p-3 rounded">
                  <FiClock size={24} className="text-warning" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small">Suspended</p>
                  <h3 className="fw-bold mb-0 text-danger">
                    {stats.suspended}
                  </h3>
                </div>
                <div className="bg-danger bg-opacity-10 p-3 rounded">
                  <FiUserX size={24} className="text-danger" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <FiSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by name or email..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select
                value={filters.role}
                onChange={(e) =>
                  setFilters({ ...filters, role: e.target.value })
                }
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
                <option value="supplier">Supplier</option>
                <option value="buyer">Buyer</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending Approval</option>
                <option value="suspended">Suspended</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button
                variant="outline-secondary"
                onClick={fetchUsers}
                className="w-100"
              >
                <FiRefreshCw className="me-2" />
                Reset
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Users Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>User</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="user-avatar me-3">
                        {user.fullName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="fw-bold">{user.fullName}</div>
                        <small className="text-muted">{user._id}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div className="small">
                        <FiMail className="me-1" size={12} />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="small text-muted">
                          <FiPhone className="me-1" size={12} />
                          {user.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td>{getStatusBadge(user)}</td>
                  <td>
                    <small className="text-muted">
                      <FiCalendar className="me-1" size={12} />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </small>
                  </td>
                  <td>
                    <Dropdown align="end">
                      <Dropdown.Toggle variant="link" className="text-dark p-0">
                        <FiMoreVertical size={18} />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => setSelectedUser(user)}>
                          <FiEye className="me-2" /> View Details
                        </Dropdown.Item>
                        <Dropdown.Item>
                          <FiEdit2 className="me-2" /> Edit
                        </Dropdown.Item>
                        {!user.isApproved && (
                          <Dropdown.Item
                            onClick={() => handleApproveUser(user._id)}
                          >
                            <FiCheckCircle className="me-2 text-success" />{" "}
                            Approve
                          </Dropdown.Item>
                        )}
                        {user.isActive ? (
                          <Dropdown.Item
                            onClick={() => handleSuspendUser(user._id)}
                          >
                            <FiXCircle className="me-2 text-warning" /> Suspend
                          </Dropdown.Item>
                        ) : (
                          <Dropdown.Item>
                            <FiUserCheck className="me-2 text-success" />{" "}
                            Activate
                          </Dropdown.Item>
                        )}
                        <Dropdown.Divider />
                        <Dropdown.Item
                          className="text-danger"
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          <FiTrash2 className="me-2" /> Delete
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {users.length === 0 && (
            <div className="text-center py-5">
              <p className="text-muted">No users found</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* User Detail Modal */}
      <Modal
        show={!!selectedUser}
        onHide={() => setSelectedUser(null)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>User Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <div>
              <div className="text-center mb-4">
                <div className="user-avatar-large mx-auto mb-3">
                  {selectedUser.fullName?.charAt(0).toUpperCase()}
                </div>
                <h4>{selectedUser.fullName}</h4>
                <Badge bg="secondary">{selectedUser.role}</Badge>
              </div>
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="text-muted small">Email</label>
                    <p>{selectedUser.email}</p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="text-muted small">Phone</label>
                    <p>{selectedUser.phone || "Not provided"}</p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="text-muted small">Joined</label>
                    <p>{new Date(selectedUser.createdAt).toLocaleString()}</p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="text-muted small">Last Updated</label>
                    <p>{new Date(selectedUser.updatedAt).toLocaleString()}</p>
                  </div>
                </Col>
              </Row>
              <Alert variant="info">
                <strong>Account Status:</strong>{" "}
                {selectedUser.isApproved ? "Approved" : "Pending Approval"}
              </Alert>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSelectedUser(null)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add User Modal */}
      <Modal
        show={showUserModal}
        onHide={() => {
          setShowUserModal(false);
          resetForm();
        }}
        size="lg"
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FiUserPlus className="me-2" />
            Add New User
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddUser}>
          <Modal.Body>
            <Alert variant="info">
              <small>
                <strong>Note:</strong> This will create a new user account. The
                user will receive a welcome email with login instructions.
              </small>
            </Alert>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter full name"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    isInvalid={!!formErrors.fullName}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.fullName}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email Address *</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    isInvalid={!!formErrors.email}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.email}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Role *</Form.Label>
                  <Form.Select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                  >
                    <option value="admin">Admin</option>
                    <option value="staff">Staff</option>
                    <option value="supplier">Supplier</option>
                    <option value="buyer">Buyer</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Password *</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter password (min 6 chars)"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    isInvalid={!!formErrors.password}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.password}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Confirm Password *</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    isInvalid={!!formErrors.confirmPassword}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.confirmPassword}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Alert variant="warning" className="mt-2">
              <small>
                <FiLock className="me-2" />
                <strong>Security:</strong> The user will need to change their
                password on first login.
              </small>
            </Alert>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => {
                setShowUserModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button variant="warning" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Creating...
                </>
              ) : (
                <>
                  <FiUserPlus className="me-2" />
                  Create User
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <style jsx>{`
        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f4a261, #e76f51);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
        }
        .user-avatar-large {
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
      `}</style>
    </div>
  );
};

export default Users;
