/* eslint-disable no-unused-vars */
import  { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiMenu,
  FiBell,
  FiUser,
  FiSearch,
  FiMail,
  FiChevronDown,
} from "react-icons/fi";
import { Dropdown, Badge } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";

const Topbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const { unreadCount, notifications, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleNotificationClick = async (notificationId) => {
    await markAsRead(notificationId);
    if (notificationId) {
      navigate("/notifications");
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="menu-toggle" onClick={onMenuClick}>
          <FiMenu size={22} />
        </button>
        <div className="search-box">
          <FiSearch size={18} />
          <input type="text" placeholder="Search..." />
        </div>
      </div>

      <div className="topbar-right">
        {/* Notifications */}
        <Dropdown align="end" onToggle={setShowNotifications}>
          <Dropdown.Toggle as="div" className="notification-icon">
            <FiBell size={20} />
            {unreadCount > 0 && (
              <Badge bg="danger" className="notification-badge">
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </Dropdown.Toggle>

          <Dropdown.Menu className="notification-dropdown">
            <div className="dropdown-header">
              <h6>Notifications</h6>
              {unreadCount > 0 && (
                <button className="mark-all-read" onClick={markAllAsRead}>
                  Mark all as read
                </button>
              )}
            </div>
            <div className="notification-list">
              {notifications.slice(0, 5).map((notification) => (
                <div
                  key={notification._id}
                  className={`notification-item ${!notification.isRead ? "unread" : ""}`}
                  onClick={() => handleNotificationClick(notification._id)}
                >
                  <div className="notification-content">
                    <p className="notification-title">{notification.title}</p>
                    <p className="notification-message">{notification.message}</p>
                    <small className="notification-time">{notification.timeAgo}</small>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="no-notifications">No notifications</div>
              )}
            </div>
            <div className="dropdown-footer">
              <button onClick={() => navigate("/notifications")}>
                View All Notifications
              </button>
            </div>
          </Dropdown.Menu>
        </Dropdown>

        {/* Messages */}
        <button className="topbar-icon">
          <FiMail size={20} />
          <Badge bg="info" className="message-badge">3</Badge>
        </button>

        {/* User Menu */}
        <Dropdown align="end">
          <Dropdown.Toggle as="div" className="user-menu">
            <div className="user-avatar">
              {user?.profile?.logo ? (
                <img src={user.profile.logo} alt={user?.fullName} />
              ) : (
                <span>{getInitials(user?.fullName || "User")}</span>
              )}
            </div>
            <div className="user-info">
              <div className="user-name">{user?.fullName}</div>
              <div className="user-role">{user?.role}</div>
            </div>
            <FiChevronDown size={16} />
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item onClick={() => navigate("/profile")}>
              <FiUser size={16} /> Profile
            </Dropdown.Item>
            <Dropdown.Item onClick={() => navigate("/settings")}>
              <FiUser size={16} /> Settings
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={() => navigate("/logout")}>
              <FiUser size={16} /> Logout
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <style jsx>{`
        .topbar {
          position: fixed;
          top: 0;
          right: 0;
          left: 260px;
          height: 70px;
          background: var(--card-bg);
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
          z-index: 99;
          transition: all 0.3s ease;
        }
        .topbar-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .menu-toggle {
          background: none;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
          display: none;
        }
        .search-box {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--bg-secondary);
          padding: 8px 16px;
          border-radius: 8px;
          color: var(--text-secondary);
        }
        .search-box input {
          background: none;
          border: none;
          outline: none;
          color: var(--text-primary);
        }
        .topbar-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .topbar-icon {
          background: none;
          border: none;
          position: relative;
          cursor: pointer;
          color: var(--text-primary);
        }
        .notification-icon {
          position: relative;
          cursor: pointer;
          color: var(--text-primary);
        }
        .notification-badge, .message-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          font-size: 10px;
          padding: 2px 5px;
        }
        .user-menu {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
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
        .user-avatar img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }
        .user-info {
          display: flex;
          flex-direction: column;
        }
        .user-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .user-role {
          font-size: 12px;
          color: var(--text-secondary);
          text-transform: capitalize;
        }
        .notification-dropdown {
          width: 320px;
          padding: 0;
        }
        .dropdown-header {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .mark-all-read {
          background: none;
          border: none;
          color: var(--primary-color);
          font-size: 12px;
          cursor: pointer;
        }
        .notification-list {
          max-height: 400px;
          overflow-y: auto;
        }
        .notification-item {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
          cursor: pointer;
          transition: background 0.2s;
        }
        .notification-item:hover {
          background: var(--bg-secondary);
        }
        .notification-item.unread {
          background: rgba(244, 162, 97, 0.1);
        }
        .notification-title {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 4px;
          color: var(--text-primary);
        }
        .notification-message {
          font-size: 12px;
          color: var(--text-secondary);
          margin-bottom: 4px;
        }
        .notification-time {
          font-size: 10px;
          color: var(--text-secondary);
        }
        .no-notifications {
          padding: 40px;
          text-align: center;
          color: var(--text-secondary);
        }
        .dropdown-footer {
          padding: 12px 16px;
          border-top: 1px solid var(--border-color);
          text-align: center;
        }
        .dropdown-footer button {
          background: none;
          border: none;
          color: var(--primary-color);
          font-size: 12px;
          cursor: pointer;
        }
        @media (max-width: 768px) {
          .topbar {
            left: 0;
          }
          .menu-toggle {
            display: block;
          }
          .user-info, .search-box {
            display: none;
          }
        }
      `}</style>
    </header>
  );
};

export default Topbar;