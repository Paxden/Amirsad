import axios from "./axios";

export const dealsApi = {
  // Get my deals (for suppliers and buyers)
  getMyDeals: async (params = {}) => {
    const response = await axios.get("/deals/my", { params });
    return response.data;
  },

  // Get all deals (admin/staff only)
  getAllDeals: async (params = {}) => {
    const response = await axios.get("/deals", { params });
    return response.data;
  },

  // Get deal by ID
  getDealById: async (id) => {
    const response = await axios.get(`/deals/${id}`);
    return response.data;
  },

  // Create new deal (admin/staff only)
  createDeal: async (data) => {
    const response = await axios.post("/deals", data);
    return response.data;
  },

  // Update deal status
  updateDealStatus: async (id, status, notes = "") => {
    const response = await axios.put(`/deals/${id}/status`, { status, notes });
    return response.data;
  },

  // Schedule inspection
  scheduleInspection: async (id, data) => {
    const response = await axios.post(`/deals/${id}/inspection/schedule`, data);
    return response.data;
  },

  // Complete inspection
  completeInspection: async (id, data) => {
    const response = await axios.put(`/deals/${id}/inspection/complete`, data);
    return response.data;
  },

  // Make offer on deal
  makeOffer: async (id, data) => {
    const response = await axios.post(`/deals/${id}/offer`, data);
    return response.data;
  },

  // Accept offer
  acceptOffer: async (id) => {
    const response = await axios.put(`/deals/${id}/offer/accept`);
    return response.data;
  },

  // Record payment
  recordPayment: async (id, data) => {
    const response = await axios.post(`/deals/${id}/payment`, data);
    return response.data;
  },

  // Schedule delivery
  scheduleDelivery: async (id, data) => {
    const response = await axios.post(`/deals/${id}/delivery/schedule`, data);
    return response.data;
  },

  // Complete delivery
  completeDelivery: async (id) => {
    const response = await axios.put(`/deals/${id}/delivery/complete`);
    return response.data;
  },

  // Close deal
  closeDeal: async (id, data = {}) => {
    const response = await axios.put(`/deals/${id}/close`, data);
    return response.data;
  },

  // Cancel deal
  cancelDeal: async (id, reason) => {
    const response = await axios.put(`/deals/${id}/cancel`, { reason });
    return response.data;
  },

  // Rate deal (for supplier or buyer)
  rateDeal: async (id, data) => {
    const response = await axios.put(`/deals/${id}/rate`, data);
    return response.data;
  },

  // Get deal statistics (admin/staff only)
  getDealStats: async () => {
    const response = await axios.get("/deals/stats");
    return response.data;
  },

  // Export deals report
  exportDeals: async (format = "excel", params = {}) => {
    const response = await axios.get("/reports/deals", {
      params: { format, ...params },
      responseType: "blob",
    });
    return response.data;
  },
};

export default dealsApi;
