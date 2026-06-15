import axios from "./axios";

export const buyerApi = {
  // Profile Management
  getProfile: async () => {
    const response = await axios.get("/buyers/profile");
    return response.data;
  },

  createOrUpdateProfile: async (data) => {
    const response = await axios.post("/buyers/profile", data);
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await axios.put("/buyers/profile", data);
    return response.data;
  },

  // KYC Management
  submitKYC: async (formData) => {
    const response = await axios.post("/buyers/kyc", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  getKYCStatus: async () => {
    const response = await axios.get("/buyers/kyc/status");
    return response.data;
  },

  // RFQ Management
  createRFQ: async (data) => {
    const response = await axios.post("/rfqs", data);
    return response.data;
  },

  getMyRFQs: async (params = {}) => {
    const response = await axios.get("/rfqs/my-rfqs", { params });
    return response.data;
  },

  getRFQById: async (id) => {
    const response = await axios.get(`/rfqs/${id}`);
    return response.data;
  },

  acceptRFQQuote: async (id) => {
    const response = await axios.put(`/rfqs/${id}/accept`);
    return response.data;
  },

  cancelRFQ: async (id, reason) => {
    const response = await axios.put(`/rfqs/${id}/cancel`, { reason });
    return response.data;
  },

  // Inventory Viewing
  getAvailableInventory: async (params = {}) => {
    const response = await axios.get("/inventory", { 
      params: { ...params, status: "available" } 
    });
    return response.data;
  },

  getInventoryById: async (id) => {
    const response = await axios.get(`/inventory/${id}`);
    return response.data;
  },

  // Statistics
  getDashboardStats: async () => {
    const response = await axios.get("/dashboard/buyer");
    return response.data;
  },

  getPurchaseHistory: async (params = {}) => {
    const response = await axios.get("/buyers/purchases", { params });
    return response.data;
  },

  getPurchaseSummary: async () => {
    const response = await axios.get("/buyers/purchases/summary");
    return response.data;
  },

  // Deals/Transactions
  getMyDeals: async (params = {}) => {
    const response = await axios.get("/deals/my", { params });
    return response.data;
  },

  getDealById: async (id) => {
    const response = await axios.get(`/deals/${id}`);
    return response.data;
  },

  // Appointments
  getMyAppointments: async (params = {}) => {
    const response = await axios.get("/appointments/my", { params });
    return response.data;
  },

  confirmAppointment: async (id) => {
    const response = await axios.put(`/appointments/${id}/confirm`);
    return response.data;
  },

  // Notifications
  getNotifications: async (params = {}) => {
    const response = await axios.get("/notifications", { params });
    return response.data;
  },

  markNotificationRead: async (id) => {
    const response = await axios.put(`/notifications/${id}/read`);
    return response.data;
  },

  // Messages
  getConversations: async () => {
    const response = await axios.get("/messages/conversations");
    return response.data;
  },

  getMessages: async (userId, params = {}) => {
    const response = await axios.get(`/messages/conversation/${userId}`, { params });
    return response.data;
  },

  sendMessage: async (data) => {
    const response = await axios.post("/messages", data);
    return response.data;
  },

  // Settings
  updatePreferences: async (data) => {
    const response = await axios.put("/buyers/preferences", data);
    return response.data;
  },

  getPreferences: async () => {
    const response = await axios.get("/buyers/preferences");
    return response.data;
  },
};

export default buyerApi;