/* eslint-disable no-unused-vars */
import axios from "./axios";

export const appointmentApi = {
  // Get all appointments for current user
  getMyAppointments: async (params = {}) => {
    const response = await axios.get("/appointments/my", { params });
    return response.data;
  },

  // Get appointment by ID
  getAppointmentById: async (id) => {
    const response = await axios.get(`/appointments/${id}`);
    return response.data;
  },

  // Create appointment (admin/staff only)
  createAppointment: async (data) => {
    const response = await axios.post("/appointments", data);
    return response.data;
  },

  // Confirm appointment
  confirmAppointment: async (id) => {
    const response = await axios.put(`/appointments/${id}/confirm`);
    return response.data;
  },

  // Cancel appointment
  cancelAppointment: async (id, reason) => {
    const response = await axios.put(`/appointments/${id}/cancel`, { reason });
    return response.data;
  },

  // Complete appointment (admin/staff)
  completeAppointment: async (id, data) => {
    const response = await axios.put(`/appointments/${id}/complete`, data);
    return response.data;
  },

  // Mark attendance
  markAttendance: async (id, attended) => {
    const response = await axios.put(`/appointments/${id}/attendance`, { attended });
    return response.data;
  },

  // Reschedule appointment
  rescheduleAppointment: async (id, newDate, reason) => {
    const response = await axios.put(`/appointments/${id}/reschedule`, { newDate, reason });
    return response.data;
  },

  // Get appointment stats (admin/staff)
  getAppointmentStats: async () => {
    const response = await axios.get("/appointments/admin/stats");
    return response.data;
  },

  // Get upcoming appointments
  getUpcomingAppointments: async (days = 7) => {
    const response = await axios.get("/appointments/my", { 
      params: { upcoming: "true", limit: 50 } 
    });
    return response.data;
  },

  // Get today's appointments
  getTodayAppointments: async () => {
    const response = await axios.get("/appointments/my", {
      params: { date: "today" }
    });
    return response.data;
  },
};

export default appointmentApi;