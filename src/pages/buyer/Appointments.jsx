/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Alert,
} from "react-bootstrap";
import {
  FiCalendar,
  FiSearch,
  FiEye,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiClock,
  FiMapPin,
  FiUser,
  FiMail,
  FiVideo,
  FiEdit2,
  FiTrendingUp,
} from "react-icons/fi";
import PageHeader from "../../components/PageHeader";
import toast from "react-hot-toast";

const BuyerAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({
    newDate: "",
    reason: "",
  });
  const [filters, setFilters] = useState({
    status: "",
    search: "",
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    upcoming: 0,
  });

  useEffect(() => {
    fetchAppointments();
  }, [filters]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.search) queryParams.append("search", filters.search);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/appointments/my?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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

  const calculateStats = (appointmentsData) => {
    const now = new Date();
    const stats = {
      total: appointmentsData.length,
      pending: appointmentsData.filter((a) => a.status === "pending").length,
      confirmed: appointmentsData.filter((a) => a.status === "confirmed").length,
      completed: appointmentsData.filter((a) => a.status === "completed").length,
      cancelled: appointmentsData.filter((a) => a.status === "cancelled").length,
      upcoming: appointmentsData.filter(
        (a) => new Date(a.scheduledDate) > now && a.status === "confirmed",
      ).length,
    };
    setStats(stats);
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
        }
      );
      const data = await response.json();
      if (data.success) {
        toast.success("Appointment confirmed");
        fetchAppointments();
      }
    } catch (error) {
      console.error("Confirm error:", error);
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
        }
      );
      const data = await response.json();
      if (data.success) {
        toast.success("Appointment cancelled");
        fetchAppointments();
      }
    } catch (error) {
      console.error("Cancel error:", error);
      toast.error("Failed to cancel appointment");
    }
  };

  const handleMarkAttendance = async (id, attended) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/appointments/${id}/attendance`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ attended }),
        }
      );
      const data = await response.json();
      if (data.success) {
        toast.success(
          `Attendance marked as ${attended ? "present" : "absent"}`,
        );
        fetchAppointments();
      }
    } catch (error) {
      console.error("Attendance error:", error);
      toast.error("Failed to mark attendance");
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
          body: JSON.stringify({
            newDate: rescheduleData.newDate,
            reason: rescheduleData.reason,
          }),
        }
      );
      const data = await response.json();
      if (data.success) {
        toast.success("Reschedule request submitted. Waiting for approval.");
        setShowRescheduleModal(false);
        setRescheduleData({ newDate: "", reason: "" });
        fetchAppointments();
      }
    } catch (error) {
      console.error("Reschedule error:", error);
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
      pending: "Pending Confirmation",
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
      title: "Upcoming",
      value: stats.upcoming,
      icon: FiClock,
      color: "success",
    },
    {
      title: "Pending Confirmation",
      value: stats.pending,
      icon: FiClock,
      color: "warning",
    },
    {
      title: "Completed",
      value: stats.completed,
      icon: FiCheckCircle,
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
        title="My Appointments"
        breadcrumbs={[{ label: "Buyer" }, { label: "Appointments" }]}
        actions={
          <Button variant="outline-secondary" onClick={fetchAppointments}>
            <FiRefreshCw className="me-2" />
            Refresh
          </Button>
        }
      />

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        {statCards.map((stat, index) => (
          <Col md={6} lg={3} key={index}>
            <Card className="border-0 shadow-sm stat-card">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-1 small">{stat.title}</p>
                    <h3 className="fw-bold mb-0">{stat.value}</h3>
                  </div>
                  <div className={`stat-icon bg-${stat.color}-light`}>
                    <stat.icon size={24} className={`text-${stat.color}`} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Quick Stats Summary */}
      <Card className="border-0 shadow-sm mb-4 bg-gradient-appointment">
        <Card.Body>
          <Row className="align-items-center text-center text-md-start">
            <Col md={8}>
              <h5 className="fw-bold text-white mb-2">📅 Appointment Summary</h5>
              <p className="text-white-50 mb-0">
                You have <strong className="text-white">{stats.total}</strong> total appointments, 
                with <strong className="text-warning">{stats.pending}</strong> pending and 
                <strong className="text-success"> {stats.confirmed}</strong> confirmed
              </p>
            </Col>
            <Col md={4} className="text-md-end">
              <Badge bg="light" className="text-dark px-4 py-2">
                <FiTrendingUp className="me-1" />
                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% Completed
              </Badge>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Filters */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <FiSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by title or supplier name..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                />
              </InputGroup>
            </Col>
            <Col md={4}>
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
              <Button
                variant="outline-secondary"
                onClick={fetchAppointments}
                className="w-100"
              >
                <FiRefreshCw className="me-2" />
                Reset
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Upcoming Appointments Alert */}
      {stats.upcoming > 0 && (
        <Alert variant="info" className="mb-4 border-0">
          <div className="d-flex align-items-center">
            <FiCalendar size={20} className="me-2" />
            <div>
              <strong>
                You have {stats.upcoming} upcoming appointment
                {stats.upcoming !== 1 ? "s" : ""}.
              </strong>
              <span className="ms-2">
                Please check your schedule and confirm availability.
              </span>
            </div>
          </div>
        </Alert>
      )}

      {/* Appointments Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Supplier</th>
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
                    <div>
                      <FiUser className="me-1" size={12} />
                      {appointment.supplier?.fullName || "N/A"}
                    </div>
                    <small className="text-muted">
                      <FiMail className="me-1" size={12} />
                      {appointment.supplier?.email}
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
                        Virtual Meeting
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
                    <div className="d-flex gap-2">
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0"
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setShowDetailModal(true);
                        }}
                      >
                        <FiEye size={18} />
                      </Button>
                      {appointment.status === "pending" && (
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 text-success"
                          onClick={() =>
                            handleConfirmAppointment(appointment._id)
                          }
                        >
                          <FiCheckCircle size={18} />
                        </Button>
                      )}
                      {(appointment.status === "pending" ||
                        appointment.status === "confirmed") && (
                        <>
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 text-warning"
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setShowRescheduleModal(true);
                            }}
                          >
                            <FiEdit2 size={18} />
                          </Button>
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 text-danger"
                            onClick={() =>
                              handleCancelAppointment(appointment._id)
                            }
                          >
                            <FiXCircle size={18} />
                          </Button>
                        </>
                      )}
                      {appointment.status === "confirmed" &&
                        appointment.meetingLink && (
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 text-info"
                            href={appointment.meetingLink}
                            target="_blank"
                          >
                            <FiVideo size={18} />
                          </Button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {appointments.length === 0 && (
            <div className="text-center py-5">
              <FiCalendar size={48} className="text-muted mb-3" />
              <p className="text-muted">No appointments found</p>
              <p className="text-muted small">
                When you schedule appointments with suppliers, they will appear
                here.
              </p>
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
              <div className="bg-light p-3 rounded-3 mb-4">
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
              <div className="bg-light p-3 rounded-3 mb-4">
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

              {/* Supplier Information */}
              <h6 className="fw-bold mb-3">Supplier Information</h6>
              <div className="bg-light p-3 rounded-3 mb-4">
                <Row>
                  <Col md={6}>
                    <strong>Name:</strong>
                    <p>{selectedAppointment.supplier?.fullName}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Email:</strong>
                    <p>{selectedAppointment.supplier?.email}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Phone:</strong>
                    <p>{selectedAppointment.supplier?.phone || "N/A"}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Company:</strong>
                    <p>
                      {selectedAppointment.supplier?.profile?.companyName ||
                        "N/A"}
                    </p>
                  </Col>
                </Row>
              </div>

              {/* Location */}
              <h6 className="fw-bold mb-3">Location</h6>
              <div className="bg-light p-3 rounded-3 mb-4">
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
                <Alert variant="info" className="border-0">
                  <strong>Notes:</strong>
                  <p className="mb-0">{selectedAppointment.notes}</p>
                </Alert>
              )}

              {/* Attendance */}
              {selectedAppointment.status === "confirmed" && (
                <div className="mt-3">
                  <h6 className="fw-bold mb-3">Mark Attendance</h6>
                  <div className="d-flex gap-3">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() =>
                        handleMarkAttendance(selectedAppointment._id, true)
                      }
                    >
                      <FiCheckCircle className="me-1" />
                      Mark Present
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() =>
                        handleMarkAttendance(selectedAppointment._id, false)
                      }
                    >
                      <FiXCircle className="me-1" />
                      Mark Absent
                    </Button>
                  </div>
                </div>
              )}

              {/* Cancellation Info */}
              {selectedAppointment.status === "cancelled" &&
                selectedAppointment.cancellationReason && (
                  <Alert variant="danger" className="border-0 mt-3">
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
          {(selectedAppointment?.status === "pending" ||
            selectedAppointment?.status === "confirmed") && (
            <>
              <Button
                variant="warning"
                onClick={() => setShowRescheduleModal(true)}
              >
                <FiEdit2 className="me-2" />
                Request Reschedule
              </Button>
              <Button
                variant="danger"
                onClick={() => handleCancelAppointment(selectedAppointment._id)}
              >
                <FiXCircle className="me-2" />
                Cancel Appointment
              </Button>
            </>
          )}
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        show={showRescheduleModal}
        onHide={() => setShowRescheduleModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Request Reschedule</Modal.Title>
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
            Submit Request
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .stat-card {
          transition: all 0.3s ease;
        }
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1) !important;
        }
        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        .stat-card:hover .stat-icon {
          transform: scale(1.1);
        }
        .bg-primary-light {
          background: rgba(244, 162, 97, 0.1);
        }
        .bg-success-light {
          background: rgba(46, 204, 113, 0.1);
        }
        .bg-info-light {
          background: rgba(52, 152, 219, 0.1);
        }
        .bg-warning-light {
          background: rgba(241, 196, 15, 0.1);
        }
        .bg-gradient-appointment {
          background: linear-gradient(135deg, #667eea, #764ba2);
          border: none;
        }
      `}</style>
    </div>
  );
};

export default BuyerAppointments;