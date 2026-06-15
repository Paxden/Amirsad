/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect, useRef } from "react";
import { authAPI } from "../api/auth";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const initRef = useRef(false); // Prevent double initialization

  useEffect(() => {
    // Prevent running twice in development with StrictMode
    if (initRef.current) return;
    initRef.current = true;

    const initAuth = async () => {
      const token = localStorage.getItem("token");

      console.log("Initializing auth, token exists:", !!token);

      if (!token) {
        console.log("No token found, skipping validation");
        setLoading(false);
        return;
      }

      try {
        console.log("Validating token with backend...");
        const response = await authAPI.getMe();
        console.log("Auth validation response:", response);

        if (response.success && response.user) {
          setUser(response.user);
          console.log("User set successfully:", response.user.role);
        } else {
          console.log("Token invalid or no user data");
          // Token invalid, clear storage
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
        }
      } catch (error) {
        console.error("Auth validation failed:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
      } finally {
        setLoading(false);
        console.log("Auth initialization complete");
      }
    };

    initAuth();
  }, []);

  const register = async (userData) => {
    try {
      setError(null);
      const response = await authAPI.register(userData);

      if (response.success) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("refreshToken", response.refreshToken);
        setUser(response.user);
        toast.success(response.message || "Registration successful!");
        return { success: true, data: response };
      }
      return { success: false, error: response.message };
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authAPI.login({ email, password });

      if (response.success) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("refreshToken", response.refreshToken);
        setUser(response.user);
        toast.success("Login successful!");

        if (response.warnings && response.warnings.length > 0) {
          response.warnings.forEach((warning) => toast.warning(warning));
        }

        return { success: true, data: response };
      }
      return { success: false, error: response.message };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      setUser(null);
      toast.success("Logged out successfully");
      // Use navigate instead of window.location for better SPA behavior
      window.location.href = "/login";
    }
  };

  const updateProfile = async (data) => {
    try {
      const response = await authAPI.updateProfile(data);
      if (response.success) {
        setUser(response.user);
        toast.success("Profile updated successfully");
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
      return { success: false };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await authAPI.changePassword({
        currentPassword,
        newPassword,
      });
      if (response.success) {
        toast.success("Password changed successfully");
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      toast.error(error.response?.data?.message || "Password change failed");
      return { success: false };
    }
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isStaff: user?.role === "staff",
    isSupplier: user?.role === "supplier",
    isBuyer: user?.role === "buyer",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
