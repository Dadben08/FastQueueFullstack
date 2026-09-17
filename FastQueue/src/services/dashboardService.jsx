import axiosInstance from "../config/axiosinstance.js";

const dashboardService = {

  // ============================
  // PUBLIC COMPANIES
  // ============================
  getPublicCompanies: async () => {
    const response = await axiosInstance.get("/company/public");
    return response.data;
  },

  // ============================
  // GET COMPANY PROFILE
  // ============================
  getOrganizationProfile: async () => {
    const response = await axiosInstance.get("/company");
    return response.data;
  },

  // ============================
  // TODAY'S QUEUE
  // ============================
  getTodayQueue: async () => {
    const response = await axiosInstance.get("/queue/today");
    return response.data;
  },

  // ============================
  // QUEUE STATS
  // ============================
  getDashboardStats: async () => {
    const response = await axiosInstance.get("/queue/stats");
    return response.data;
  },

  // ============================
  // CALL NEXT
  // ============================
  callNextCustomer: async () => {
    const response = await axiosInstance.put("/queue/next");
    return response.data;
  },

  // ============================
  // COMPLETE
  // ============================
  completeCustomer: async (ticketId) => {
    const response = await axiosInstance.put(
      `/queue/${ticketId}/complete`
    );

    return response.data;
  },

  // ============================
  // SKIP
  // ============================
  skipCustomer: async (ticketId) => {
    const response = await axiosInstance.put(
      `/queue/${ticketId}/skip`
    );

    return response.data;
  },

  // ============================
  // GET TICKET STATUS
  // ============================
  getTicketStatus: async (ticketId) => {
  const response = await axiosInstance.get(
    `/queue/ticket/${ticketId}`
  );

  return response.data;
},

sendTicketEmail: async (ticketId, email) => {
  const response = await axiosInstance.post(
    "/queue/send-ticket",
    {
      ticketId,
      email,
    }
  );

  return response.data;
},
};

export default dashboardService;