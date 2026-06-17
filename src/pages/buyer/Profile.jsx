/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
import  { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
  Alert,
  Tabs,
  Tab,
  Badge,
} from "react-bootstrap";
import {
  FiUser,
  FiGlobe,
  FiSave,
  FiRefreshCw,
  FiLock,
  FiBell,
  FiShield,
  FiCamera,
  FiDollarSign,
  FiTrendingUp,
} from "react-icons/fi";
import PageHeader from "../../components/PageHeader";
import { buyerApi } from "../../api/buyerApi";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const BuyerProfile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
    profile: {
      companyName: "",
      position: "",
      website: "",
      address: {
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
      },
      preferredContactMethod: "email",
    },
    settings: {
      emailNotifications: true,
      smsNotifications: false,
      language: "en",
      timezone: "UTC",
    },
    buyerProfile: {
      buyerType: "trader",
      annualPurchaseCapacity: "",
      preferredGoldTypes: [],
      preferredPurityRange: { min: 90, max: 99.99 },
      preferredWeightRange: { minKg: 0, maxKg: 1000 },
      paymentTerms: "negotiable",
      preferredCurrencies: ["USD"],
      preferredLocations: [],
    },
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const response = await buyerApi.getProfile();
      if (response.success) {
        setProfileData({
          fullName: response.profile?.fullName || user.fullName,
          email: response.profile?.email || user.email,
          phone: response.profile?.phone || user.phone || "",
          profile: response.profile?.profile || {
            companyName: "",
            position: "",
            website: "",
            address: {
              street: "",
              city: "",
              state: "",
              postalCode: "",
              country: "",
            },
            preferredContactMethod: "email",
          },
          settings: response.profile?.settings || {
            emailNotifications: true,
            smsNotifications: false,
            language: "en",
            timezone: "UTC",
          },
          buyerProfile: response.profile?.buyerProfile || {
            buyerType: "trader",
            annualPurchaseCapacity: "",
            preferredGoldTypes: [],
            preferredPurityRange: { min: 90, max: 99.99 },
            preferredWeightRange: { minKg: 0, maxKg: 1000 },
            paymentTerms: "negotiable",
            preferredCurrencies: ["USD"],
            preferredLocations: [],
          },
        });
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    setSaving(true);
    try {
      const response = await updateProfile({
        fullName: profileData.fullName,
        phone: profileData.phone,
        profile: profileData.profile,
      });
      if (response.success) {
        toast.success("Profile updated successfully");
      }
    } catch (error) {
        console.log(error)
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleBuyerProfileUpdate = async () => {
    setSaving(true);
    try {
      const response = await buyerApi.createOrUpdateProfile({
        companyName: profileData.profile.companyName,
        buyerType: profileData.buyerProfile.buyerType,
        annualPurchaseCapacity: profileData.buyerProfile.annualPurchaseCapacity,
        preferredGoldTypes: profileData.buyerProfile.preferredGoldTypes,
        preferredPurityRange: profileData.buyerProfile.preferredPurityRange,
        preferredWeightRange: profileData.buyerProfile.preferredWeightRange,
        paymentTerms: profileData.buyerProfile.paymentTerms,
        preferredCurrencies: profileData.buyerProfile.preferredCurrencies,
        preferredLocations: profileData.buyerProfile.preferredLocations,
      });
      if (response.success) {
        toast.success("Buyer profile updated successfully");
      }
    } catch (error) {
        console.log(error)

      toast.error("Failed to update buyer profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSettingsUpdate = async () => {
    setSaving(true);
    try {
      toast.success("Settings updated successfully");
    } catch (error) {
        console.log(error)

      toast.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setSaving(true);
    try {
      const response = await changePassword(passwordData.currentPassword, passwordData.newPassword);
      if (response.success) {
        toast.success("Password changed successfully");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
        console.log(error)

      toast.error("Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
        <Spinner animation="border" variant="warning" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="My Profile"
        breadcrumbs={[{ label: "Buyer" }, { label: "Profile" }]}
        actions={
          <Button variant="outline-secondary" onClick={loadProfile}>
            <FiRefreshCw className="me-2" />
            Refresh
          </Button>
        }
      />

      <Row className="g-4">
        {/* Sidebar - Profile Summary */}
        <Col lg={3}>
          <Card className="border-0 shadow-sm text-center">
            <Card.Body className="p-4">
              <div className="position-relative d-inline-block mb-3">
                <div className="profile-avatar mx-auto">
                  {profileData.fullName?.charAt(0).toUpperCase()}
                </div>
                <button className="avatar-edit-btn">
                  <FiCamera size={14} />
                </button>
              </div>
              <h5 className="fw-bold mb-1">{profileData.fullName}</h5>
              <p className="text-muted small mb-2">{user?.email}</p>
              <Badge bg="success" className="mb-3">
                {user?.isApproved ? "Verified Buyer" : "Pending Verification"}
              </Badge>
              
              <div className="border-top pt-3 mt-2">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted small">Account Type</span>
                  <span className="fw-bold small text-capitalize">{user?.role}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted small">Member Since</span>
                  <span className="fw-bold small">
                    {new Date(user?.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted small">KYC Status</span>
                  <Badge bg={user?.kycStatus === "approved" ? "success" : "warning"}>
                    {user?.kycStatus || "Not Submitted"}
                  </Badge>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Buyer Stats Card */}
          <Card className="border-0 shadow-sm mt-4">
            <Card.Body className="p-4">
              <h6 className="fw-bold mb-3">
                <FiTrendingUp className="me-2" />
                Buyer Stats
              </h6>
              <div className="mb-2">
                <small className="text-muted">Total Purchases</small>
                <p className="mb-0 fw-bold">0 kg</p>
              </div>
              <div className="mb-2">
                <small className="text-muted">Total Spent</small>
                <p className="mb-0 fw-bold text-success">$0</p>
              </div>
              <div>
                <small className="text-muted">Average Deal Size</small>
                <p className="mb-0 fw-bold text-primary">$0</p>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Main Content - Tabs */}
        <Col lg={9}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="px-4 pt-3"
              >
                <Tab eventKey="profile" title={<span><FiUser className="me-2" />Profile</span>}>
                  <div className="p-4">
                    <Form>
                      <h6 className="fw-bold mb-3">Personal Information</h6>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Full Name</Form.Label>
                            <Form.Control
                              type="text"
                              value={profileData.fullName}
                              onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Email Address</Form.Label>
                            <Form.Control
                              type="email"
                              value={profileData.email}
                              disabled
                            />
                            <Form.Text className="text-muted">Email cannot be changed</Form.Text>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Phone Number</Form.Label>
                            <Form.Control
                              type="tel"
                              value={profileData.phone}
                              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <h6 className="fw-bold mb-3 mt-3">Company Information</h6>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Company Name</Form.Label>
                            <Form.Control
                              type="text"
                              value={profileData.profile.companyName}
                              onChange={(e) => setProfileData({
                                ...profileData,
                                profile: { ...profileData.profile, companyName: e.target.value }
                              })}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Your Position</Form.Label>
                            <Form.Control
                              type="text"
                              value={profileData.profile.position}
                              onChange={(e) => setProfileData({
                                ...profileData,
                                profile: { ...profileData.profile, position: e.target.value }
                              })}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={12}>
                          <Form.Group className="mb-3">
                            <Form.Label>Website</Form.Label>
                            <Form.Control
                              type="url"
                              placeholder="https://yourcompany.com"
                              value={profileData.profile.website}
                              onChange={(e) => setProfileData({
                                ...profileData,
                                profile: { ...profileData.profile, website: e.target.value }
                              })}
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <h6 className="fw-bold mb-3">Business Address</h6>
                      <Row>
                        <Col md={12}>
                          <Form.Group className="mb-3">
                            <Form.Label>Street Address</Form.Label>
                            <Form.Control
                              type="text"
                              value={profileData.profile.address?.street || ""}
                              onChange={(e) => setProfileData({
                                ...profileData,
                                profile: {
                                  ...profileData.profile,
                                  address: { ...profileData.profile.address, street: e.target.value }
                                }
                              })}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>City</Form.Label>
                            <Form.Control
                              type="text"
                              value={profileData.profile.address?.city || ""}
                              onChange={(e) => setProfileData({
                                ...profileData,
                                profile: {
                                  ...profileData.profile,
                                  address: { ...profileData.profile.address, city: e.target.value }
                                }
                              })}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>State/Province</Form.Label>
                            <Form.Control
                              type="text"
                              value={profileData.profile.address?.state || ""}
                              onChange={(e) => setProfileData({
                                ...profileData,
                                profile: {
                                  ...profileData.profile,
                                  address: { ...profileData.profile.address, state: e.target.value }
                                }
                              })}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Postal Code</Form.Label>
                            <Form.Control
                              type="text"
                              value={profileData.profile.address?.postalCode || ""}
                              onChange={(e) => setProfileData({
                                ...profileData,
                                profile: {
                                  ...profileData.profile,
                                  address: { ...profileData.profile.address, postalCode: e.target.value }
                                }
                              })}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Country</Form.Label>
                            <Form.Control
                              type="text"
                              value={profileData.profile.address?.country || ""}
                              onChange={(e) => setProfileData({
                                ...profileData,
                                profile: {
                                  ...profileData.profile,
                                  address: { ...profileData.profile.address, country: e.target.value }
                                }
                              })}
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <div className="d-flex justify-content-end mt-3">
                        <Button variant="warning" onClick={handleProfileUpdate} disabled={saving}>
                          <FiSave className="me-2" />
                          {saving ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </Form>
                  </div>
                </Tab>

                <Tab eventKey="buyer" title={<span><FiDollarSign className="me-2" />Buyer Profile</span>}>
                  <div className="p-4">
                    <Form>
                      <h6 className="fw-bold mb-3">Buyer Information</h6>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Buyer Type</Form.Label>
                            <Form.Select
                              value={profileData.buyerProfile.buyerType}
                              onChange={(e) => setProfileData({
                                ...profileData,
                                buyerProfile: { ...profileData.buyerProfile, buyerType: e.target.value }
                              })}
                            >
                              <option value="refinery">Refinery</option>
                              <option value="trader">Trader</option>
                              <option value="investor">Investor</option>
                              <option value="bank">Bank</option>
                              <option value="jeweler">Jeweler</option>
                              <option value="other">Other</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Annual Purchase Capacity ($)</Form.Label>
                            <Form.Control
                              type="number"
                              placeholder="Enter estimated annual budget"
                              value={profileData.buyerProfile.annualPurchaseCapacity}
                              onChange={(e) => setProfileData({
                                ...profileData,
                                buyerProfile: { ...profileData.buyerProfile, annualPurchaseCapacity: e.target.value }
                              })}
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <h6 className="fw-bold mb-3 mt-3">Preferred Gold Types</h6>
                      <Row>
                        <Col md={12}>
                          <Form.Group className="mb-3">
                            <div className="d-flex flex-wrap gap-2">
                              {["doré", "refined", "scrap", "bars", "nuggets", "all"].map((type) => (
                                <Form.Check
                                  key={type}
                                  inline
                                  type="checkbox"
                                  label={type.charAt(0).toUpperCase() + type.slice(1)}
                                  checked={profileData.buyerProfile.preferredGoldTypes.includes(type)}
                                  onChange={(e) => {
                                    const types = profileData.buyerProfile.preferredGoldTypes;
                                    if (e.target.checked) {
                                      types.push(type);
                                    } else {
                                      const index = types.indexOf(type);
                                      if (index > -1) types.splice(index, 1);
                                    }
                                    setProfileData({
                                      ...profileData,
                                      buyerProfile: { ...profileData.buyerProfile, preferredGoldTypes: types }
                                    });
                                  }}
                                />
                              ))}
                            </div>
                          </Form.Group>
                        </Col>
                      </Row>

                      <h6 className="fw-bold mb-3">Preferred Purity Range</h6>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Minimum Purity (%)</Form.Label>
                            <Form.Control
                              type="number"
                              min="0"
                              max="100"
                              value={profileData.buyerProfile.preferredPurityRange.min}
                              onChange={(e) => setProfileData({
                                ...profileData,
                                buyerProfile: {
                                  ...profileData.buyerProfile,
                                  preferredPurityRange: {
                                    ...profileData.buyerProfile.preferredPurityRange,
                                    min: parseFloat(e.target.value)
                                  }
                                }
                              })}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Maximum Purity (%)</Form.Label>
                            <Form.Control
                              type="number"
                              min="0"
                              max="100"
                              value={profileData.buyerProfile.preferredPurityRange.max}
                              onChange={(e) => setProfileData({
                                ...profileData,
                                buyerProfile: {
                                  ...profileData.buyerProfile,
                                  preferredPurityRange: {
                                    ...profileData.buyerProfile.preferredPurityRange,
                                    max: parseFloat(e.target.value)
                                  }
                                }
                              })}
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <h6 className="fw-bold mb-3">Preferred Weight Range (kg)</h6>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Minimum Weight</Form.Label>
                            <Form.Control
                              type="number"
                              min="0"
                              value={profileData.buyerProfile.preferredWeightRange.minKg}
                              onChange={(e) => setProfileData({
                                ...profileData,
                                buyerProfile: {
                                  ...profileData.buyerProfile,
                                  preferredWeightRange: {
                                    ...profileData.buyerProfile.preferredWeightRange,
                                    minKg: parseFloat(e.target.value)
                                  }
                                }
                              })}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Maximum Weight</Form.Label>
                            <Form.Control
                              type="number"
                              min="0"
                              value={profileData.buyerProfile.preferredWeightRange.maxKg}
                              onChange={(e) => setProfileData({
                                ...profileData,
                                buyerProfile: {
                                  ...profileData.buyerProfile,
                                  preferredWeightRange: {
                                    ...profileData.buyerProfile.preferredWeightRange,
                                    maxKg: parseFloat(e.target.value)
                                  }
                                }
                              })}
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <h6 className="fw-bold mb-3 mt-3">Payment & Currency Preferences</h6>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Payment Terms</Form.Label>
                            <Form.Select
                              value={profileData.buyerProfile.paymentTerms}
                              onChange={(e) => setProfileData({
                                ...profileData,
                                buyerProfile: { ...profileData.buyerProfile, paymentTerms: e.target.value }
                              })}
                            >
                              <option value="advance">Advance Payment</option>
                              <option value="lc">Letter of Credit</option>
                              <option value="dpc">Documentary Payment</option>
                              <option value="net_30">Net 30</option>
                              <option value="net_60">Net 60</option>
                              <option value="negotiable">Negotiable</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Preferred Currency</Form.Label>
                            <Form.Select
                              value={profileData.buyerProfile.preferredCurrencies?.[0] || "USD"}
                              onChange={(e) => setProfileData({
                                ...profileData,
                                buyerProfile: {
                                  ...profileData.buyerProfile,
                                  preferredCurrencies: [e.target.value]
                                }
                              })}
                            >
                              <option value="USD">USD</option>
                              <option value="EUR">EUR</option>
                              <option value="GBP">GBP</option>
                              <option value="AED">AED</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                      </Row>

                      <div className="d-flex justify-content-end mt-3">
                        <Button variant="warning" onClick={handleBuyerProfileUpdate} disabled={saving}>
                          <FiSave className="me-2" />
                          {saving ? "Saving..." : "Save Buyer Profile"}
                        </Button>
                      </div>
                    </Form>
                  </div>
                </Tab>

                <Tab eventKey="security" title={<span><FiLock className="me-2" />Security</span>}>
                  <div className="p-4">
                    <Alert variant="info" className="mb-4">
                      <FiShield className="me-2" />
                      <strong>Password Security Tips:</strong>
                      <ul className="mb-0 mt-2">
                        <li>Use at least 8 characters</li>
                        <li>Include uppercase and lowercase letters</li>
                        <li>Include at least one number</li>
                        <li>Include a special character</li>
                      </ul>
                    </Alert>

                    <Form>
                      <Form.Group className="mb-3">
                        <Form.Label>Current Password</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="Enter current password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>New Password</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="Enter new password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Confirm New Password</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="Confirm new password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        />
                      </Form.Group>
                      <div className="d-flex justify-content-end mt-3">
                        <Button variant="warning" onClick={handlePasswordChange} disabled={saving}>
                          <FiLock className="me-2" />
                          {saving ? "Changing..." : "Change Password"}
                        </Button>
                      </div>
                    </Form>

                    {/* Two-Factor Authentication */}
                    <hr className="my-4" />
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="fw-bold mb-1">Two-Factor Authentication</h6>
                        <p className="text-muted small mb-0">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <Button variant="outline-primary" size="sm" disabled>
                        Coming Soon
                      </Button>
                    </div>
                  </div>
                </Tab>

                <Tab eventKey="notifications" title={<span><FiBell className="me-2" />Notifications</span>}>
                  <div className="p-4">
                    <h6 className="fw-bold mb-3">Notification Preferences</h6>
                    <Form>
                      <Form.Check
                        type="switch"
                        label="Email Notifications"
                        checked={profileData.settings.emailNotifications}
                        onChange={(e) => setProfileData({
                          ...profileData,
                          settings: { ...profileData.settings, emailNotifications: e.target.checked }
                        })}
                        className="mb-3"
                      />
                      <Form.Check
                        type="switch"
                        label="SMS Notifications"
                        checked={profileData.settings.smsNotifications}
                        onChange={(e) => setProfileData({
                          ...profileData,
                          settings: { ...profileData.settings, smsNotifications: e.target.checked }
                        })}
                        className="mb-3"
                      />
                      <hr className="my-4" />
                      <h6 className="fw-bold mb-3">Event Notifications</h6>
                      <Form.Check
                        type="switch"
                        label="New Inventory Alerts"
                        defaultChecked
                        className="mb-2"
                      />
                      <Form.Check
                        type="switch"
                        label="Price Drop Alerts"
                        defaultChecked
                        className="mb-2"
                      />
                      <Form.Check
                        type="switch"
                        label="RFQ Updates"
                        defaultChecked
                        className="mb-2"
                      />
                      <Form.Check
                        type="switch"
                        label="Appointment Reminders"
                        defaultChecked
                        className="mb-2"
                      />
                      <div className="d-flex justify-content-end mt-4">
                        <Button variant="warning" onClick={handleSettingsUpdate} disabled={saving}>
                          <FiSave className="me-2" />
                          {saving ? "Saving..." : "Save Preferences"}
                        </Button>
                      </div>
                    </Form>
                  </div>
                </Tab>

                <Tab eventKey="preferences" title={<span><FiGlobe className="me-2" />Preferences</span>}>
                  <div className="p-4">
                    <Form>
                      <Form.Group className="mb-3">
                        <Form.Label>Language</Form.Label>
                        <Form.Select
                          value={profileData.settings.language}
                          onChange={(e) => setProfileData({
                            ...profileData,
                            settings: { ...profileData.settings, language: e.target.value }
                          })}
                        >
                          <option value="en">English</option>
                          <option value="fr">French</option>
                          <option value="ar">Arabic</option>
                          <option value="zh">Chinese</option>
                        </Form.Select>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Time Zone</Form.Label>
                        <Form.Select
                          value={profileData.settings.timezone}
                          onChange={(e) => setProfileData({
                            ...profileData,
                            settings: { ...profileData.settings, timezone: e.target.value }
                          })}
                        >
                          <option value="UTC">UTC</option>
                          <option value="Africa/Lagos">West Africa Time (WAT)</option>
                          <option value="America/New_York">Eastern Time (ET)</option>
                          <option value="Europe/London">British Time (GMT)</option>
                          <option value="Asia/Dubai">Gulf Standard Time (GST)</option>
                        </Form.Select>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Preferred Contact Method</Form.Label>
                        <Form.Select
                          value={profileData.profile.preferredContactMethod}
                          onChange={(e) => setProfileData({
                            ...profileData,
                            profile: { ...profileData.profile, preferredContactMethod: e.target.value }
                          })}
                        >
                          <option value="email">Email</option>
                          <option value="phone">Phone</option>
                          <option value="both">Both</option>
                        </Form.Select>
                      </Form.Group>
                      <div className="d-flex justify-content-end mt-3">
                        <Button variant="warning" onClick={handleSettingsUpdate} disabled={saving}>
                          <FiSave className="me-2" />
                          {saving ? "Saving..." : "Save Preferences"}
                        </Button>
                      </div>
                    </Form>
                  </div>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <style jsx>{`
        .profile-avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f4a261, #e76f51);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 40px;
          font-weight: bold;
        }
        .avatar-edit-btn {
          position: absolute;
          bottom: 5px;
          right: 5px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--primary-color);
          border: 2px solid white;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .avatar-edit-btn:hover {
          background: var(--primary-dark);
        }
      `}</style>
    </div>
  );
};

export default BuyerProfile;