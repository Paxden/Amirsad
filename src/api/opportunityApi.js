import axios from "./axios";

export const opportunityApi = {
  // Supplier routes
  createOpportunity: async (data) => {
    const response = await axios.post("/opportunities", data);
    return response.data;
  },

  getMyOpportunities: async () => {
    const response = await axios.get("/opportunities/my");
    return response.data;
  },

  getMyOpportunityById: async (id) => {
    const response = await axios.get(`/opportunities/my/${id}`);
    return response.data;
  },

  updateMyOpportunity: async (id, data) => {
    const response = await axios.put(`/opportunities/my/${id}`, data);
    return response.data;
  },

  deleteMyOpportunity: async (id) => {
    const response = await axios.delete(`/opportunities/my/${id}`);
    return response.data;
  },

  // Admin/Staff routes
  getAllOpportunities: async (params = {}) => {
    const response = await axios.get("/opportunities", { params });
    return response.data;
  },

  getOpportunityById: async (id) => {
    const response = await axios.get(`/opportunities/${id}`);
    return response.data;
  },

  approveOpportunity: async (id, notes = "") => {
    const response = await axios.put(`/opportunities/${id}/approve`, { notes });
    return response.data;
  },

  rejectOpportunity: async (id, rejectionReason) => {
    const response = await axios.put(`/opportunities/${id}/reject`, {
      rejectionReason,
    });
    return response.data;
  },
};

export default opportunityApi;
