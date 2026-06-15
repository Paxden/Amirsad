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
  Tabs,
  Tab,
  Badge,
  ListGroup,
} from "react-bootstrap";
import {
  FiSettings,
  FiMail,
  FiBell,
  FiShield,
  FiDollarSign,
  FiSave,
  FiRefreshCw,
  FiPlus,
  FiTrash2,
  FiFileText,
  FiCalendar,
} from "react-icons/fi";
import PageHeader from "../../components/PageHeader";
import toast from "react-hot-toast";

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [newCurrency, setNewCurrency] = useState({ code: "", rate: 1 });

  // Settings state
  const [settings, setSettings] = useState({
    general: {
      companyName: "AMIRSAD ENERGY CONSULT",
      companyEmail: "support@amirsad.com",
      companyPhone: "+234123456789",
      companyAddress: "Lagos, Nigeria",
      timezone: "Africa/Lagos",
      dateFormat: "DD/MM/YYYY",
    },
    rfq: {
      expiryDays: 7,
      autoApproveLimit: 50000,
      notificationStaff: true,
      maxWeightKg: 1000,
      minWeightKg: 0.1,
    },
    appointment: {
      duration: 60,
      reminderHours: 24,
      maxFutureDays: 90,
      allowWeekends: false,
    },
    notifications: {
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: true,
      rfqAlerts: true,
      inventoryAlerts: true,
      appointmentReminders: true,
      kycUpdates: true,
    },
    currencies: {
      base: "USD",
      supported: ["USD", "EUR", "GBP", "AED"],
      exchangeRates: {
        USD: 1,
        EUR: 0.92,
        GBP: 0.79,
        AED: 3.67,
      },
    },
    security: {
      sessionTimeout: 120,
      maxLoginAttempts: 5,
      passwordExpiryDays: 90,
      twoFactorRequired: false,
      ipWhitelist: [],
    },
    email: {
      smtpHost: "smtp.gmail.com",
      smtpPort: 587,
      smtpSecure: false,
      fromEmail: "noreply@amirsad.com",
      fromName: "AMIRSAD Gold Platform",
      verificationTemplate:
        "Welcome {{name}}! Please verify your email: {{url}}",
      resetTemplate:
        "Hello {{name}}, click here to reset your password: {{url}}",
    },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success && data.settings) {
        // Map settings from API to state
        const settingsMap = {};
        data.settings.forEach((setting) => {
          const [category, key] = setting.key.split("_");
          if (!settingsMap[category]) settingsMap[category] = {};
          settingsMap[category][key] = setting.value;
        });
        setSettings((prev) => ({
          ...prev,
          general: { ...prev.general, ...settingsMap.general },
          rfq: { ...prev.rfq, ...settingsMap.rfq },
          appointment: { ...prev.appointment, ...settingsMap.appointment },
        }));
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (category, data) => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/settings/bulk`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ settings: data }),
        },
      );
      const result = await response.json();
      if (result.success) {
        toast.success(`${category} settings saved successfully`);
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleAddCurrency = () => {
    if (
      newCurrency.code &&
      !settings.currencies.supported.includes(newCurrency.code)
    ) {
      setSettings({
        ...settings,
        currencies: {
          ...settings.currencies,
          supported: [...settings.currencies.supported, newCurrency.code],
          exchangeRates: {
            ...settings.currencies.exchangeRates,
            [newCurrency.code]: newCurrency.rate,
          },
        },
      });
      setShowCurrencyModal(false);
      setNewCurrency({ code: "", rate: 1 });
      toast.success("Currency added successfully");
    }
  };

  const handleRemoveCurrency = (currency) => {
    if (currency === settings.currencies.base) {
      toast.error("Cannot remove base currency");
      return;
    }
    setSettings({
      ...settings,
      currencies: {
        ...settings.currencies,
        supported: settings.currencies.supported.filter((c) => c !== currency),
      },
    });
    toast.success("Currency removed");
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
        title="System Settings"
        breadcrumbs={[{ label: "Admin" }, { label: "Settings" }]}
        actions={
          <Button variant="outline-secondary" onClick={fetchSettings}>
            <FiRefreshCw className="me-2" />
            Refresh
          </Button>
        }
      />

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab
          eventKey="general"
          title={
            <span>
              <FiSettings className="me-2" />
              General
            </span>
          }
        />
        <Tab
          eventKey="rfq"
          title={
            <span>
              <FiFileText className="me-2" />
              RFQ Settings
            </span>
          }
        />
        <Tab
          eventKey="appointment"
          title={
            <span>
              <FiCalendar className="me-2" />
              Appointments
            </span>
          }
        />
        <Tab
          eventKey="notifications"
          title={
            <span>
              <FiBell className="me-2" />
              Notifications
            </span>
          }
        />
        <Tab
          eventKey="currencies"
          title={
            <span>
              <FiDollarSign className="me-2" />
              Currencies
            </span>
          }
        />
        <Tab
          eventKey="security"
          title={
            <span>
              <FiShield className="me-2" />
              Security
            </span>
          }
        />
        <Tab
          eventKey="email"
          title={
            <span>
              <FiMail className="me-2" />
              Email
            </span>
          }
        />
      </Tabs>

      {/* General Settings Tab */}
      {activeTab === "general" && (
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-4">
            <h5 className="fw-bold mb-4">General Settings</h5>
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Company Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={settings.general.companyName}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          general: {
                            ...settings.general,
                            companyName: e.target.value,
                          },
                        })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Company Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={settings.general.companyEmail}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          general: {
                            ...settings.general,
                            companyEmail: e.target.value,
                          },
                        })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Company Phone</Form.Label>
                    <Form.Control
                      type="text"
                      value={settings.general.companyPhone}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          general: {
                            ...settings.general,
                            companyPhone: e.target.value,
                          },
                        })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Time Zone</Form.Label>
                    <Form.Select
                      value={settings.general.timezone}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          general: {
                            ...settings.general,
                            timezone: e.target.value,
                          },
                        })
                      }
                    >
                      <option value="Africa/Lagos">
                        West Africa Time (WAT)
                      </option>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">
                        Eastern Time (ET)
                      </option>
                      <option value="Europe/London">British Time (GMT)</option>
                      <option value="Asia/Dubai">
                        Gulf Standard Time (GST)
                      </option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Company Address</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={settings.general.companyAddress}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          general: {
                            ...settings.general,
                            companyAddress: e.target.value,
                          },
                        })
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>
              <div className="d-flex justify-content-end">
                <Button
                  variant="warning"
                  onClick={() =>
                    handleSaveSettings("General", settings.general)
                  }
                  disabled={saving}
                >
                  <FiSave className="me-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}

      {/* RFQ Settings Tab */}
      {activeTab === "rfq" && (
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-4">
            <h5 className="fw-bold mb-4">RFQ Configuration</h5>
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>RFQ Expiry Days</Form.Label>
                    <Form.Control
                      type="number"
                      value={settings.rfq.expiryDays}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          rfq: {
                            ...settings.rfq,
                            expiryDays: parseInt(e.target.value),
                          },
                        })
                      }
                    />
                    <Form.Text className="text-muted">
                      Number of days until RFQ expires
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Auto-Approve Limit ($)</Form.Label>
                    <Form.Control
                      type="number"
                      value={settings.rfq.autoApproveLimit}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          rfq: {
                            ...settings.rfq,
                            autoApproveLimit: parseInt(e.target.value),
                          },
                        })
                      }
                    />
                    <Form.Text className="text-muted">
                      Auto-approve RFQs below this amount
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Minimum Weight (kg)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.1"
                      value={settings.rfq.minWeightKg}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          rfq: {
                            ...settings.rfq,
                            minWeightKg: parseFloat(e.target.value),
                          },
                        })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Maximum Weight (kg)</Form.Label>
                    <Form.Control
                      type="number"
                      value={settings.rfq.maxWeightKg}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          rfq: {
                            ...settings.rfq,
                            maxWeightKg: parseInt(e.target.value),
                          },
                        })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Check
                    type="switch"
                    label="Notify staff when new RFQ is created"
                    checked={settings.rfq.notificationStaff}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        rfq: {
                          ...settings.rfq,
                          notificationStaff: e.target.checked,
                        },
                      })
                    }
                  />
                </Col>
              </Row>
              <div className="d-flex justify-content-end mt-3">
                <Button
                  variant="warning"
                  onClick={() => handleSaveSettings("RFQ", settings.rfq)}
                  disabled={saving}
                >
                  <FiSave className="me-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}

      {/* Appointment Settings Tab */}
      {activeTab === "appointment" && (
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-4">
            <h5 className="fw-bold mb-4">Appointment Settings</h5>
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Default Duration (minutes)</Form.Label>
                    <Form.Control
                      type="number"
                      value={settings.appointment.duration}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          appointment: {
                            ...settings.appointment,
                            duration: parseInt(e.target.value),
                          },
                        })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Reminder Hours Before</Form.Label>
                    <Form.Control
                      type="number"
                      value={settings.appointment.reminderHours}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          appointment: {
                            ...settings.appointment,
                            reminderHours: parseInt(e.target.value),
                          },
                        })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Max Future Days</Form.Label>
                    <Form.Control
                      type="number"
                      value={settings.appointment.maxFutureDays}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          appointment: {
                            ...settings.appointment,
                            maxFutureDays: parseInt(e.target.value),
                          },
                        })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Check
                    type="switch"
                    label="Allow weekend appointments"
                    checked={settings.appointment.allowWeekends}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        appointment: {
                          ...settings.appointment,
                          allowWeekends: e.target.checked,
                        },
                      })
                    }
                  />
                </Col>
              </Row>
              <div className="d-flex justify-content-end mt-3">
                <Button
                  variant="warning"
                  onClick={() =>
                    handleSaveSettings("Appointment", settings.appointment)
                  }
                  disabled={saving}
                >
                  <FiSave className="me-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}

      {/* Notifications Settings Tab */}
      {activeTab === "notifications" && (
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-4">
            <h5 className="fw-bold mb-4">Notification Preferences</h5>
            <Form>
              <Row>
                <Col md={12}>
                  <div className="mb-4">
                    <h6 className="fw-bold">Channels</h6>
                    <Form.Check
                      type="switch"
                      label="Email Notifications"
                      checked={settings.notifications.emailEnabled}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            emailEnabled: e.target.checked,
                          },
                        })
                      }
                      className="mb-2"
                    />
                    <Form.Check
                      type="switch"
                      label="SMS Notifications"
                      checked={settings.notifications.smsEnabled}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            smsEnabled: e.target.checked,
                          },
                        })
                      }
                      className="mb-2"
                    />
                    <Form.Check
                      type="switch"
                      label="Push Notifications"
                      checked={settings.notifications.pushEnabled}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            pushEnabled: e.target.checked,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="mb-4">
                    <h6 className="fw-bold">Events</h6>
                    <Form.Check
                      type="switch"
                      label="RFQ Alerts"
                      checked={settings.notifications.rfqAlerts}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            rfqAlerts: e.target.checked,
                          },
                        })
                      }
                      className="mb-2"
                    />
                    <Form.Check
                      type="switch"
                      label="Inventory Alerts"
                      checked={settings.notifications.inventoryAlerts}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            inventoryAlerts: e.target.checked,
                          },
                        })
                      }
                      className="mb-2"
                    />
                    <Form.Check
                      type="switch"
                      label="Appointment Reminders"
                      checked={settings.notifications.appointmentReminders}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            appointmentReminders: e.target.checked,
                          },
                        })
                      }
                      className="mb-2"
                    />
                    <Form.Check
                      type="switch"
                      label="KYC Updates"
                      checked={settings.notifications.kycUpdates}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            kycUpdates: e.target.checked,
                          },
                        })
                      }
                    />
                  </div>
                </Col>
              </Row>
              <div className="d-flex justify-content-end">
                <Button
                  variant="warning"
                  onClick={() =>
                    handleSaveSettings("Notifications", settings.notifications)
                  }
                  disabled={saving}
                >
                  <FiSave className="me-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}

      {/* Currencies Tab */}
      {activeTab === "currencies" && (
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0">Currency Settings</h5>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setShowCurrencyModal(true)}
              >
                <FiPlus className="me-2" />
                Add Currency
              </Button>
            </div>

            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Base Currency</Form.Label>
                    <Form.Select
                      value={settings.currencies.base}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          currencies: {
                            ...settings.currencies,
                            base: e.target.value,
                          },
                        })
                      }
                    >
                      {settings.currencies.supported.map((currency) => (
                        <option key={currency} value={currency}>
                          {currency}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <h6 className="fw-bold mt-4 mb-3">Supported Currencies</h6>
              <ListGroup>
                {settings.currencies.supported.map((currency) => (
                  <ListGroup.Item
                    key={currency}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <strong>{currency}</strong>
                      {currency === settings.currencies.base && (
                        <Badge bg="primary" className="ms-2">
                          Base
                        </Badge>
                      )}
                    </div>
                    {currency !== settings.currencies.base && (
                      <Button
                        variant="link"
                        className="text-danger p-0"
                        onClick={() => handleRemoveCurrency(currency)}
                      >
                        <FiTrash2 />
                      </Button>
                    )}
                  </ListGroup.Item>
                ))}
              </ListGroup>

              <div className="d-flex justify-content-end mt-4">
                <Button
                  variant="warning"
                  onClick={() =>
                    handleSaveSettings("Currencies", settings.currencies)
                  }
                  disabled={saving}
                >
                  <FiSave className="me-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-4">
            <h5 className="fw-bold mb-4">Security Settings</h5>
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Session Timeout (minutes)</Form.Label>
                    <Form.Control
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          security: {
                            ...settings.security,
                            sessionTimeout: parseInt(e.target.value),
                          },
                        })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Max Login Attempts</Form.Label>
                    <Form.Control
                      type="number"
                      value={settings.security.maxLoginAttempts}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          security: {
                            ...settings.security,
                            maxLoginAttempts: parseInt(e.target.value),
                          },
                        })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Password Expiry (days)</Form.Label>
                    <Form.Control
                      type="number"
                      value={settings.security.passwordExpiryDays}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          security: {
                            ...settings.security,
                            passwordExpiryDays: parseInt(e.target.value),
                          },
                        })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Check
                    type="switch"
                    label="Require Two-Factor Authentication for Staff"
                    checked={settings.security.twoFactorRequired}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        security: {
                          ...settings.security,
                          twoFactorRequired: e.target.checked,
                        },
                      })
                    }
                    className="mb-3"
                  />
                </Col>
              </Row>
              <div className="d-flex justify-content-end mt-3">
                <Button
                  variant="warning"
                  onClick={() =>
                    handleSaveSettings("Security", settings.security)
                  }
                  disabled={saving}
                >
                  <FiSave className="me-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}

      {/* Email Settings Tab */}
      {activeTab === "email" && (
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-4">
            <h5 className="fw-bold mb-4">Email Configuration</h5>
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>SMTP Host</Form.Label>
                    <Form.Control
                      type="text"
                      value={settings.email.smtpHost}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          email: {
                            ...settings.email,
                            smtpHost: e.target.value,
                          },
                        })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>SMTP Port</Form.Label>
                    <Form.Control
                      type="number"
                      value={settings.email.smtpPort}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          email: {
                            ...settings.email,
                            smtpPort: parseInt(e.target.value),
                          },
                        })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>From Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={settings.email.fromEmail}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          email: {
                            ...settings.email,
                            fromEmail: e.target.value,
                          },
                        })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>From Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={settings.email.fromName}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          email: {
                            ...settings.email,
                            fromName: e.target.value,
                          },
                        })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Verification Email Template</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={settings.email.verificationTemplate}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          email: {
                            ...settings.email,
                            verificationTemplate: e.target.value,
                          },
                        })
                      }
                    />
                    <Form.Text className="text-muted">
                      Available variables: {"{{name}}"}, {"{{url}}"}
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Password Reset Template</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={settings.email.resetTemplate}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          email: {
                            ...settings.email,
                            resetTemplate: e.target.value,
                          },
                        })
                      }
                    />
                    <Form.Text className="text-muted">
                      Available variables: {"{{name}}"}, {"{{url}}"}
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
              <div className="d-flex justify-content-end mt-3">
                <Button
                  variant="warning"
                  onClick={() => handleSaveSettings("Email", settings.email)}
                  disabled={saving}
                >
                  <FiSave className="me-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}

      {/* Add Currency Modal */}
      <Modal
        show={showCurrencyModal}
        onHide={() => setShowCurrencyModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Currency</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Currency Code</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., EUR, GBP, AED"
                value={newCurrency.code}
                onChange={(e) =>
                  setNewCurrency({
                    ...newCurrency,
                    code: e.target.value.toUpperCase(),
                  })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Exchange Rate (to Base Currency)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                placeholder="1 USD = ?"
                value={newCurrency.rate}
                onChange={(e) =>
                  setNewCurrency({
                    ...newCurrency,
                    rate: parseFloat(e.target.value),
                  })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowCurrencyModal(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddCurrency}>
            Add Currency
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminSettings;
