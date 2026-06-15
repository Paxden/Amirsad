import axios from "./axios";

export const rfqApi = {
  // Create RFQ (buyer)
  createRFQ: async (data) => {
    const response = await axios.post("/rfqs", data);
    return response.data;
  },

  // Get buyer's RFQs
  getMyRFQs: async (params = {}) => {
    const response = await axios.get("/rfqs/my-rfqs", { params });
    return response.data;
  },

  // Get supplier RFQs
  getSupplierRFQs: async (params = {}) => {
    const response = await axios.get("/rfqs/supplier-rfqs", { params });
    return response.data;
  },

  // Get RFQ by ID
  getRFQById: async (id) => {
    const response = await axios.get(`/rfqs/${id}`);
    return response.data;
  },

  // Staff response to RFQ
  staffRespond: async (id, data) => {
    const response = await axios.put(`/rfqs/${id}/respond`, data);
    return response.data;
  },

  // Buyer accepts RFQ
  acceptRFQ: async (id) => {
    const response = await axios.put(`/rfqs/${id}/accept`);
    return response.data;
  },

  // Get RFQ stats (admin/staff)
  getStats: async () => {
    const response = await axios.get("/rfqs/admin/stats");
    return response.data;
  },
};