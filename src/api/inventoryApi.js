import axios from "./axios";

export const inventoryApi = {
  // Get all inventory
  getAllInventory: async (params = {}) => {
    const response = await axios.get("/inventory", { params });
    return response.data;
  },

  // Get available inventory (for buyers)
  getAvailableInventory: async (params = {}) => {
    const response = await axios.get("/inventory", { 
      params: { ...params, status: "available" } 
    });
    return response.data;
  },

  // Get inventory by ID
  getInventoryById: async (id) => {
    const response = await axios.get(`/inventory/${id}`);
    return response.data;
  },

  // Get supplier inventory
  getSupplierInventory: async () => {
    const response = await axios.get("/inventory/supplier/me");
    return response.data;
  },

  // Create inventory (from approved opportunity)
  createInventory: async (data) => {
    const response = await axios.post("/inventory", data);
    return response.data;
  },

  // Update inventory
  updateInventory: async (id, data) => {
    const response = await axios.put(`/inventory/${id}`, data);
    return response.data;
  },

  // Delete inventory
  deleteInventory: async (id) => {
    const response = await axios.delete(`/inventory/${id}`);
    return response.data;
  },

  // Approve inventory (admin/staff)
  approveInventory: async (id) => {
    const response = await axios.put(`/inventory/${id}/approve`);
    return response.data;
  },

  // Reject inventory (admin/staff)
  rejectInventory: async (id, reason) => {
    const response = await axios.put(`/inventory/${id}/reject`, { rejectionReason: reason });
    return response.data;
  },

  // Get inventory stats
  getStats: async () => {
    const response = await axios.get("/inventory/stats");
    return response.data;
  },
};