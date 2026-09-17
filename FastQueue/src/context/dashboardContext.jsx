import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

import dashboardService from "../services/dashboardService";

const DashboardContext = createContext();

export const useDashboard = () => {
  const context = useContext(DashboardContext);

  if (!context) {
    throw new Error(
      "useDashboard must be used within DashboardProvider"
    );
  }

  return context;
};

export const DashboardProvider = ({ children }) => {
  const [orgData, setOrgData] = useState(null);

  const [queue, setQueue] = useState([]);

  const [currentTicket, setCurrentTicket] = useState(null);

  const [stats, setStats] = useState({
    waitingCustomers: 0,
    servedToday: 0,
    averageWaitTime: 0,
    currentQueue: null,
  });

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);


  // ==========================================
  // FETCH COMPANY PROFILE
  // ==========================================

  const fetchOrgData = async () => {
    try {
      const data =
        await dashboardService.getOrganizationProfile();

      setOrgData(data);

      localStorage.setItem(
        "userData",
        JSON.stringify(data)
      );
    } catch (err) {
      console.error(
        "Failed to fetch company profile:",
        err
      );

      throw err;
    }
  };


  // ==========================================
  // FETCH TODAY'S QUEUE
  // ==========================================

  const fetchQueue = async () => {
    try {
      const data =
        await dashboardService.getTodayQueue();

      const tickets = data.tickets || [];

      setQueue(tickets);

      // Find the customer currently being served
      const servingTicket = tickets.find(
        (ticket) => ticket.status === "serving"
      );

      setCurrentTicket(servingTicket || null);
    } catch (err) {
      console.error(
        "Failed to fetch queue:",
        err
      );

      throw err;
    }
  };


  // ==========================================
  // FETCH QUEUE STATISTICS
  // ==========================================

  const fetchStats = async () => {
    try {
      const data =
        await dashboardService.getDashboardStats();

      const servingTicket = queue.find(
        (ticket) => ticket.status === "serving"
      );

      setStats({
        waitingCustomers: data.waiting || 0,

        servedToday: data.completed || 0,

        averageWaitTime: 0,

        currentQueue:
          servingTicket?.ticketNumber || null,
      });
    } catch (err) {
      console.error(
        "Failed to fetch dashboard stats:",
        err
      );

      throw err;
    }
  };


  // ==========================================
  // LOAD DASHBOARD
  // ==========================================

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [companyData, queueData, statsData] =
        await Promise.all([
          dashboardService.getOrganizationProfile(),
          dashboardService.getTodayQueue(),
          dashboardService.getDashboardStats(),
        ]);

      setOrgData(companyData);

      localStorage.setItem(
        "userData",
        JSON.stringify(companyData)
      );

      const tickets = queueData.tickets || [];

      setQueue(tickets);

      const servingTicket = tickets.find(
        (ticket) => ticket.status === "serving"
      );

      setCurrentTicket(servingTicket || null);

      setStats({
        waitingCustomers: statsData.waiting || 0,

        servedToday: statsData.completed || 0,

        averageWaitTime: 0,

        currentQueue:
          servingTicket?.ticketNumber || null,
      });

    } catch (err) {
      console.error(
        "Failed to load dashboard:",
        err
      );

      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to load dashboard."
      );

    } finally {
      setLoading(false);
    }
  };


  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    loadDashboardData();
  }, []);


  // ==========================================
  // REFRESH
  // ==========================================

  const refresh = async () => {
    await loadDashboardData();
  };


  // ==========================================
  // CALL NEXT CUSTOMER
  // ==========================================

  const callNextCustomer = async () => {
    try {
      setError(null);

      const response =
        await dashboardService.callNextCustomer();

      const calledTicket = response.ticket;

      setCurrentTicket(calledTicket);

      // Refresh queue and stats
      await loadDashboardData();

      return calledTicket;

    } catch (err) {
      console.error(
        "Failed to call next customer:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Failed to call next customer."
      );

      throw err;
    }
  };


  // ==========================================
  // COMPLETE CUSTOMER
  // ==========================================

  const completeCurrentCustomer = async () => {
    try {
      if (!currentTicket?._id) {
        return;
      }

      setError(null);

      await dashboardService.completeCustomer(
        currentTicket._id
      );

      setCurrentTicket(null);

      await loadDashboardData();

    } catch (err) {
      console.error(
        "Failed to complete customer:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Failed to complete customer."
      );

      throw err;
    }
  };


  // ==========================================
  // SKIP CUSTOMER
  // ==========================================

  const skipCurrentCustomer = async () => {
    try {
      if (!currentTicket?._id) {
        return;
      }

      setError(null);

      await dashboardService.skipCustomer(
        currentTicket._id
      );

      setCurrentTicket(null);

      await loadDashboardData();

    } catch (err) {
      console.error(
        "Failed to skip customer:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Failed to skip customer."
      );

      throw err;
    }
  };


  const value = {
    orgData,

    queue,

    currentTicket,

    stats,

    loading,

    error,

    refresh,

    callNextCustomer,

    completeCurrentCustomer,

    skipCurrentCustomer,
  };


  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};