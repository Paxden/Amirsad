/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/exhaustive-deps */
import  { useState, useEffect } from "react";
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
} from "react-bootstrap";
import {
  FiCalendar,
  FiSearch,
  FiFilter,
  FiMoreVertical,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiEdit2,
  FiRefreshCw,
  FiClock,
  FiMapPin,
  FiVideo,
  FiPhone,
  FiMail,
  FiPlus,
} from "react-icons/fi";
import PageHeader from "../../components/PageHeader";
import toast from "react-hot-toast";

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({
    newDate: "",
    reason: "",
  });
  const [formData, setFormData] = useState({
    title: "",
    type: "meeting",
    supplierId: "",
    buyerId: "",
    scheduledDate: "",
    startTime: "",
    endTime: "",
    location: "",
    locationType: "physical",
    meetingLink: "",
    notes: "",
  });
  const [filters, setFilters] = useState({
    status: "",
    type: "",
    search: "",
    date: "",
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    today: 0,
    upcoming: 0,
  });
  const [users, setUsers] = useState({ suppliers: [], buyers: [] });

  useEffect(() => {
    fetchAppointments();
    fetchUsers();
  }, [filters]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.type) queryParams.append("type", filters.type);
      if (filters.search) queryParams.append("search", filters.search);
      if (filters.date) queryParams.append("date", filters.date);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/appointments?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();
      if (data.success) {
        setAppointments(data.appointments || []);
        calculateStats(data.appointments || []);
      }
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();
      if (data.success) {
        const suppliers = data.users.filter((u) => u.role === "supplier");
        const buyers = data.users.filter((u) => u.role === "buyer");
        setUsers({ suppliers, buyers });
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const calculateStats = (appointments) => {
    const today = new Date().toDateString();
    const stats = {
      total: appointments.length,
      pending: appointments.filter((a) => a.status === "pending").length,
      confirmed: appointments.filter((a) => a.status === "confirmed").length,
      completed: appointments.filter((a) => a.status === "completed").length,
      cancelled: appointments.filter((a) => a.status === "cancelled").length,
      today: appointments.filter(
        (a) => new Date(a.scheduledDate).toDateString() === today,
      ).length,
      upcoming: appointments.filter(
        (a) =>
          new Date(a.scheduledDate) > new Date() && a.status === "confirmed",
      ).length,
    };
    setStats(stats);
  };

  const handleCreateAppointment = async () => {
    if (
      !formData.title ||
      !formData.supplierId ||
      !formData.buyerId ||
      !formData.scheduledDate
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/appointments`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );
      const data = await response.json();
      if (data.success) {
        toast.success("Appointment created successfully");
        setShowCreateModal(false);
        setFormData({
          title: "",
          type: "meeting",
          supplierId: "",
          buyerId: "",
          scheduledDate: "",
          startTime: "",
          endTime: "",
          location: "",
          locationType: "physical",
          meetingLink: "",
          notes: "",
        });
        fetchAppointments();
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to create appointment");
    }
  };

  const handleConfirmAppointment = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/appointments/${id}/confirm`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();
      if (data.success) {
        toast.success("Appointment confirmed");
        fetchAppointments();
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to confirm appointment");
    }
  };

  const handleCancelAppointment = async (id) => {
    const reason = prompt("Please enter cancellation reason:");
    if (!reason) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/appointments/${id}/cancel`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason }),
        },
      );
      const data = await response.json();
      if (data.success) {
        toast.success("Appointment cancelled");
        fetchAppointments();
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to cancel appointment");
    }
  };

  const handleCompleteAppointment = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/appointments/${id}/complete`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();
      if (data.success) {
        toast.success("Appointment marked as completed");
        fetchAppointments();
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to complete appointment");
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleData.newDate || !rescheduleData.reason) {
      toast.error("Please provide new date and reason");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/appointments/${selectedAppointment._id}/reschedule`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(rescheduleData),
        },
      );
      const data = await response.json();
      if (data.success) {
        toast.success("Appointment rescheduled");
        setShowRescheduleModal(false);
        setRescheduleData({ newDate: "", reason: "" });
        fetchAppointments();
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to reschedule appointment");
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: "warning",
      confirmed: "success",
      completed: "info",
      cancelled: "danger",
      in_progress: "primary",
    };
    const labels = {
      pending: "Pending",
      confirmed: "Confirmed",
      completed: "Completed",
      cancelled: "Cancelled",
      in_progress: "In Progress",
    };
    return (
      <Badge bg={variants[status] || "secondary"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getTypeBadge = (type) => {
    const variants = {
      inspection: "info",
      negotiation: "warning",
      meeting: "primary",
      closing: "success",
      documentation: "secondary",
    };
    return <Badge bg={variants[type] || "secondary"}>{type}</Badge>;
  };

  const statCards = [
    {
      title: "Total Appointments",
      value: stats.total,
      icon: FiCalendar,
      color: "primary",
    },
    {
      title: "Today",
      value: stats.today,
      icon: FiClock,
      color: "warning",
    },
    {
      title: "Confirmed",
      value: stats.confirmed,
      icon: FiCheckCircle,
      color: "success",
    },
    {
      title: "Upcoming",
      value: stats.upcoming,
      icon: FiCalendar,
      color: "info",
    },
  ];

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
        title="Appointments Management"
        breadcrumbs={[{ label: "Admin" }, { label: "Appointments" }]}
        actions={
          <div className="d-flex gap-2">
            <Button variant="outline-secondary" onClick={fetchAppointments}>
              <FiRefreshCw className="me-2" />
              Refresh
            </Button>
            <Button variant="warning" onClick={() => setShowCreateModal(true)}>
              <FiPlus className="me-2" />
              New Appointment
            </Button>
          </div>
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
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filters */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={3}>
              <InputGroup>
                <InputGroup.Text>
                  <FiSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by title..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                />
              </InputGroup>
            </Col>
            <Col md={2}>
              <Form.Select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select
                value={filters.type}
                onChange={(e) =>
                  setFilters({ ...filters, type: e.target.value })
                }
              >
                <option value="">All Types</option>
                <option value="inspection">Inspection</option>
                <option value="negotiation">Negotiation</option>
                <option value="meeting">Meeting</option>
                <option value="closing">Closing</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Control
                type="date"
                value={filters.date}
                onChange={(e) =>
                  setFilters({ ...filters, date: e.target.value })
                }
              />
            </Col>
            <Col md={2}>
              <Button
                variant="outline-secondary"
                onClick={fetchAppointments}
                className="w-100"
              >
                <FiFilter className="me-2" />
                Apply
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Appointments Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Supplier</th>
                <th>Buyer</th>
                <th>Date & Time</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment._id}>
                  <td>
                    <div className="fw-bold">{appointment.title}</div>
                    <small className="text-muted">
                      {appointment.appointmentNumber}
                    </small>
                  </td>
                  <td>{getTypeBadge(appointment.type)}</td>
                  <td>
                    <div>{appointment.supplier?.fullName || "N/A"}</div>
                    <small className="text-muted">
                      {appointment.supplier?.email}
                    </small>
                  </td>
                  <td>
                    <div>{appointment.buyer?.fullName || "N/A"}</div>
                    <small className="text-muted">
                      {appointment.buyer?.email}
                    </small>
                  </td>
                  <td>
                    <div className="fw-bold">
                      {new Date(appointment.scheduledDate).toLocaleDateString()}
                    </div>
                    <small className="text-muted">
                      {appointment.startTime} - {appointment.endTime}
                    </small>
                  </td>
                  <td>
                    {appointment.locationType === "virtual" ? (
                      <div>
                        <FiVideo className="me-1" size={12} />
                        Virtual
                      </div>
                    ) : (
                      <div>
                        <FiMapPin className="me-1" size={12} />
                        {appointment.location}
                      </div>
                    )}
                  </td>
                  <td>{getStatusBadge(appointment.status)}</td>
                  <td>
                    <Dropdown align="end">
                      <Dropdown.Toggle variant="link" className="text-dark p-0">
                        <FiMoreVertical size={18} />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setShowDetailModal(true);
                          }}
                        >
                          <FiEye className="me-2" /> View Details
                        </Dropdown.Item>
                        {appointment.status === "pending" && (
                          <Dropdown.Item
                            onClick={() =>
                              handleConfirmAppointment(appointment._id)
                            }
                          >
                            <FiCheckCircle className="me-2 text-success" />{" "}
                            Confirm
                          </Dropdown.Item>
                        )}
                        {appointment.status === "confirmed" && (
                          <>
                            <Dropdown.Item
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                setShowRescheduleModal(true);
                              }}
                            >
                              <FiEdit2 className="me-2 text-warning" />{" "}
                              Reschedule
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() =>
                                handleCompleteAppointment(appointment._id)
                              }
                            >
                              <FiCheckCircle className="me-2 text-info" /> Mark
                              Completed
                            </Dropdown.Item>
                          </>
                        )}
                        {(appointment.status === "pending" ||
                          appointment.status === "confirmed") && (
                          <Dropdown.Item
                            onClick={() =>
                              handleCancelAppointment(appointment._id)
                            }
                          >
                            <FiXCircle className="me-2 text-danger" /> Cancel
                          </Dropdown.Item>
                        )}
                        {appointment.meetingLink && (
                          <Dropdown.Item
                            href={appointment.meetingLink}
                            target="_blank"
                          >
                            <FiVideo className="me-2" /> Join Meeting
                          </Dropdown.Item>
                        )}
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {appointments.length === 0 && (
            <div className="text-center py-5">
              <FiCalendar size={48} className="text-muted mb-3" />
              <p className="text-muted">No appointments found</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Appointment Detail Modal */}
      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Appointment Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAppointment && (
            <div>
              {/* Header */}
              <div className="bg-light p-3 rounded mb-4">
                <Row>
                  <Col md={6}>
                    <strong>Appointment #:</strong>
                    <p>{selectedAppointment.appointmentNumber}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Status:</strong>
                    <p>{getStatusBadge(selectedAppointment.status)}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Created:</strong>
                    <p>
                      {new Date(selectedAppointment.createdAt).toLocaleString()}
                    </p>
                  </Col>
                  <Col md={6}>
                    <strong>Last Updated:</strong>
                    <p>
                      {new Date(selectedAppointment.updatedAt).toLocaleString()}
                    </p>
                  </Col>
                </Row>
              </div>

              {/* Appointment Info */}
              <h6 className="fw-bold mb-3">Appointment Information</h6>
              <div className="bg-light p-3 rounded mb-4">
                <Row>
                  <Col md={12}>
                    <strong>Title:</strong>
                    <p>{selectedAppointment.title}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Type:</strong>
                    <p>{getTypeBadge(selectedAppointment.type)}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Duration:</strong>
                    <p>{selectedAppointment.duration || 60} minutes</p>
                  </Col>
                  <Col md={6}>
                    <strong>Date:</strong>
                    <p>
                      {new Date(
                        selectedAppointment.scheduledDate,
                      ).toLocaleDateString()}
                    </p>
                  </Col>
                  <Col md={6}>
                    <strong>Time:</strong>
                    <p>
                      {selectedAppointment.startTime} -{" "}
                      {selectedAppointment.endTime}
                    </p>
                  </Col>
                </Row>
              </div>

              {/* Participants */}
              <h6 className="fw-bold mb-3">Participants</h6>
              <div className="bg-light p-3 rounded mb-4">
                <Row>
                  <Col md={6}>
                    <strong>Supplier:</strong>
                    <div className="mt-2">
                      <div className="fw-bold">
                        {selectedAppointment.supplier?.fullName}
                      </div>
                      <div className="small text-muted">
                        <FiMail className="me-1" size={12} />
                        {selectedAppointment.supplier?.email}
                      </div>
                      <div className="small text-muted">
                        <FiPhone className="me-1" size={12} />
                        {selectedAppointment.supplier?.phone || "N/A"}
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <strong>Buyer:</strong>
                    <div className="mt-2">
                      <div className="fw-bold">
                        {selectedAppointment.buyer?.fullName}
                      </div>
                      <div className="small text-muted">
                        <FiMail className="me-1" size={12} />
                        {selectedAppointment.buyer?.email}
                      </div>
                      <div className="small text-muted">
                        <FiPhone className="me-1" size={12} />
                        {selectedAppointment.buyer?.phone || "N/A"}
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Location */}
              <h6 className="fw-bold mb-3">Location</h6>
              <div className="bg-light p-3 rounded mb-4">
                {selectedAppointment.locationType === "virtual" ? (
                  <div>
                    <FiVideo className="me-2" />
                    <strong>Virtual Meeting</strong>
                    {selectedAppointment.meetingLink && (
                      <div className="mt-2">
                        <a
                          href={selectedAppointment.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {selectedAppointment.meetingLink}
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <FiMapPin className="me-2" />
                    <strong>{selectedAppointment.location}</strong>
                  </div>
                )}
              </div>

              {/* Notes */}
              {selectedAppointment.notes && (
                <Alert variant="info">
                  <strong>Notes:</strong>
                  <p className="mb-0">{selectedAppointment.notes}</p>
                </Alert>
              )}

              {/* Cancellation Info */}
              {selectedAppointment.status === "cancelled" &&
                selectedAppointment.cancellationReason && (
                  <Alert variant="danger">
                    <strong>Cancellation Reason:</strong>
                    <p className="mb-0">
                      {selectedAppointment.cancellationReason}
                    </p>
                  </Alert>
                )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedAppointment?.status === "pending" && (
            <Button
              variant="success"
              onClick={() => handleConfirmAppointment(selectedAppointment._id)}
            >
              <FiCheckCircle className="me-2" />
              Confirm Appointment
            </Button>
          )}
          {selectedAppointment?.status === "confirmed" && (
            <>
              <Button
                variant="warning"
                onClick={() => setShowRescheduleModal(true)}
              >
                <FiEdit2 className="me-2" />
                Reschedule
              </Button>
              <Button
                variant="success"
                onClick={() =>
                  handleCompleteAppointment(selectedAppointment._id)
                }
              >
                <FiCheckCircle className="me-2" />
                Mark Completed
              </Button>
            </>
          )}
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Create Appointment Modal */}
      <Modal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Schedule New Appointment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Title *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter appointment title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Appointment Type *</Form.Label>
                  <Form.Select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                  >
                    <option value="inspection">Inspection</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="meeting">Meeting</option>
                    <option value="closing">Closing</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Location Type *</Form.Label>
                  <Form.Select
                    value={formData.locationType}
                    onChange={(e) =>
                      setFormData({ ...formData, locationType: e.target.value })
                    }
                  >
                    <option value="physical">Physical Location</option>
                    <option value="virtual">Virtual Meeting</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Supplier *</Form.Label>
                  <Form.Select
                    value={formData.supplierId}
                    onChange={(e) =>
                      setFormData({ ...formData, supplierId: e.target.value })
                    }
                  >
                    <option value="">Select Supplier</option>
                    {users.suppliers.map((supplier) => (
                      <option key={supplier._id} value={supplier._id}>
                        {supplier.fullName} - {supplier.email}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Buyer *</Form.Label>
                  <Form.Select
                    value={formData.buyerId}
                    onChange={(e) =>
                      setFormData({ ...formData, buyerId: e.target.value })
                    }
                  >
                    <option value="">Select Buyer</option>
                    {users.buyers.map((buyer) => (
                      <option key={buyer._id} value={buyer._id}>
                        {buyer.fullName} - {buyer.email}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Date *</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        scheduledDate: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Start Time *</Form.Label>
                  <Form.Control
                    type="time"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>End Time *</Form.Label>
                  <Form.Control
                    type="time"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              {formData.locationType === "physical" ? (
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Location *</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter physical address"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                    />
                  </Form.Group>
                </Col>
              ) : (
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Meeting Link</Form.Label>
                    <Form.Control
                      type="url"
                      placeholder="https://meet.google.com/..."
                      value={formData.meetingLink}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          meetingLink: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Col>
              )}
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Additional notes..."
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button variant="warning" onClick={handleCreateAppointment}>
            <FiCalendar className="me-2" />
            Schedule Appointment
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        show={showRescheduleModal}
        onHide={() => setShowRescheduleModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Reschedule Appointment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>New Date & Time *</Form.Label>
              <Form.Control
                type="datetime-local"
                value={rescheduleData.newDate}
                onChange={(e) =>
                  setRescheduleData({
                    ...rescheduleData,
                    newDate: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Reason for Rescheduling *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Please provide a reason for rescheduling..."
                value={rescheduleData.reason}
                onChange={(e) =>
                  setRescheduleData({
                    ...rescheduleData,
                    reason: e.target.value,
                  })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowRescheduleModal(false)}
          >
            Cancel
          </Button>
          <Button variant="warning" onClick={handleReschedule}>
            Confirm Reschedule
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminAppointments;
