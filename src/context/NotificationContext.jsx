/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
import { createContext, useState, useContext, useEffect } from "react";
import io from "socket.io-client";
import { toast } from "react-hot-toast";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationProvider",
    );
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated && user) {
      initializeSocket();
    }
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [isAuthenticated, user]);

  const initializeSocket = () => {
    if (!io) return;

    const token = localStorage.getItem("token");
    const socketInstance = io(
      import.meta.env.VITE_SOCKET_URL || "http://localhost:5000",
      {
        auth: { token },
        transports: ["websocket", "polling"],
        withCredentials: true,
        path: "/socket.io",
      },
    );

    socketInstance.on("connect", () => {
      console.log("Socket connected");
    });

    socketInstance.on("new_notification", (data) => {
      setNotifications((prev) => [data.notification, ...prev]);
      setUnreadCount(data.unreadCount);

      // Show toast notification
      toast(data.notification.title, {
        description: data.notification.message,
        icon: "🔔",
      });
    });

    socketInstance.on("new_message", (message) => {
      toast(`New message from ${message.sender.fullName}`, {
        description: message.message.substring(0, 50),
        icon: "💬",
      });
    });

    socketInstance.on("user_typing", (data) => {
      // Handle typing indicator
      console.log(`${data.userId} is typing...`);
    });

    setSocket(socketInstance);
  };

  const fetchNotifications = async () => {
    // Implement API call to fetch notifications
    try {
      const response = await fetch("/api/notifications", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications/read/all", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const value = {
    socket,
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
