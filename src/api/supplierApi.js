import axios from "./axios";

export const supplierApi = {
  // Profile
  getProfile: async () => {
    const response = await axios.get("/suppliers/profile");
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await axios.post("/suppliers/profile", data);
    return response.data;
  },

  // KYC
  submitKYC: async (formData) => {
    const response = await axios.post("/suppliers/submit-kyc", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  getKYCStatus: async () => {
    const response = await axios.get("/suppliers/kyc/status");
    return response.data;
  },

  // Opportunities
  getOpportunities: async () => {
    const response = await axios.get("/opportunities/my");
    return response.data;
  },

  createOpportunity: async (data) => {
    const response = await axios.post("/opportunities", data);
    return response.data;
  },

  updateOpportunity: async (id, data) => {
    const response = await axios.put(`/opportunities/${id}`, data);
    return response.data;
  },

  deleteOpportunity: async (id) => {
    const response = await axios.delete(`/opportunities/${id}`);
    return response.data;
  },

  getOpportunityById: async (id) => {
    const response = await axios.get(`/opportunities/${id}`);
    return response.data;
  },

  // Stats
  getStats: async () => {
    const response = await axios.get("/suppliers/stats");
    return response.data;
  },

  // Inventory
  getInventory: async () => {
    const response = await axios.get("/inventory/supplier/me");
    return response.data;
  },

  createInventory: async (data) => {
    const response = await axios.post("/inventory", data);
    return response.data;
  },

  updateInventory: async (id, data) => {
    const response = await axios.put(`/inventory/${id}`, data);
    return response.data;
  },

  deleteInventory: async (id) => {
    const response = await axios.delete(`/inventory/${id}`);
    return response.data;
  },

  // RFQs
  getRFQs: async () => {
    const response = await axios.get("/rfqs/supplier-rfqs");
    return response.data;
  },

  respondToRFQ: async (id, data) => {
    const response = await axios.put(`/rfqs/${id}/respond`, data);
    return response.data;
  },

  // Appointments
  getAppointments: async () => {
    const response = await axios.get("/appointments/my");
    return response.data;
  },

  confirmAppointment: async (id) => {
    const response = await axios.put(`/appointments/${id}/confirm`);
    return response.data;
  },

  // Dashboard
  getDashboard: async () => {
    const response = await axios.get("/dashboard/supplier");
    return response.data;
  },
};



export default supplierApi;
