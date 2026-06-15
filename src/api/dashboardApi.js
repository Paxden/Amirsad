import axios from "./axios";

export const dashboardApi = {
  // Admin dashboard
  getAdminDashboard: async () => {
    const response = await axios.get("/dashboard/admin");
    return response.data;
  },

  // Staff dashboard
  getStaffDashboard: async () => {
    const response = await axios.get("/dashboard/staff");
    return response.data;
  },

  // Supplier dashboard
  getSupplierDashboard: async () => {
    const response = await axios.get("/dashboard/supplier");
    return response.data;
  },

  // Buyer dashboard
  getBuyerDashboard: async () => {
    const response = await axios.get("/dashboard/buyer");
    return response.data;
  },

  // Charts data
  getCharts: async (period = "month") => {
    const response = await axios.get(`/dashboard/charts?period=${period}`);
    return response.data;
  },
};
