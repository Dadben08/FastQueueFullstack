import React, { useEffect, useState } from "react";
import {
  Ticket,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Phone,
  Play,
  Check,
  SkipForward,
  RefreshCw,
} from "lucide-react";

import dashboardService from "../../services/dashboardService";

const QueueSection = () => {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    waiting: 0,
    serving: 0,
    completed: 0,
    skipped: 0,
  });

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // LOAD QUEUE
  // ==========================================

  const loadQueue = async () => {
    try {
      setLoading(true);
      setError("");

      const [queueResponse, statsResponse] =
        await Promise.all([
          dashboardService.getTodayQueue(),
          dashboardService.getDashboardStats(),
        ]);

      setTickets(queueResponse.tickets || []);

      setStats(
        statsResponse || {
          total: 0,
          waiting: 0,
          serving: 0,
          completed: 0,
          skipped: 0,
        }
      );
    } catch (err) {
      console.error("Queue loading error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load queue."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    loadQueue();
  }, []);

  // ==========================================
  // CALL NEXT CUSTOMER
  // ==========================================

  const handleCallNext = async () => {
    try {
      setActionLoading(true);
      setError("");

      // Prevent calling another customer while
      // someone is already being served.
      if (servingCustomer) {
        setError(
          `${servingCustomer.ticketNumber} is currently being served. Complete or skip that customer first.`
        );

        return;
      }

      const response =
        await dashboardService.callNextCustomer();

      console.log(
        "CALL NEXT SUCCESS:",
        response
      );

      await loadQueue();

    } catch (err) {
      console.error(
        "CALL NEXT ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to call the next customer."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // COMPLETE CUSTOMER
  // ==========================================

  const handleComplete = async (ticketId) => {
    try {
      setActionLoading(true);
      setError("");

      await dashboardService.completeCustomer(
        ticketId
      );

      await loadQueue();

    } catch (err) {
      console.error(
        "Complete error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to complete customer."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // SKIP CUSTOMER
  // ==========================================

  const handleSkip = async (ticketId) => {
    try {
      setActionLoading(true);
      setError("");

      await dashboardService.skipCustomer(
        ticketId
      );

      await loadQueue();

    } catch (err) {
      console.error(
        "Skip error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to skip customer."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // CURRENT SERVING CUSTOMER
  // ==========================================

  const servingCustomer = tickets.find(
    (ticket) => ticket.status === "serving"
  );

  // ==========================================
  // WAITING CUSTOMERS
  // ==========================================

  const waitingCustomers = tickets.filter(
    (ticket) => ticket.status === "waiting"
  );

  // ==========================================
  // STATUS STYLES
  // ==========================================

  const statusStyles = {
    waiting:
      "bg-yellow-100 text-yellow-700",

    serving:
      "bg-blue-100 text-blue-700",

    completed:
      "bg-green-100 text-green-700",

    skipped:
      "bg-red-100 text-red-700",
  };

  // ==========================================
  // STATUS ICONS
  // ==========================================

  const statusIcons = {
    waiting: Clock,
    serving: Play,
    completed: CheckCircle,
    skipped: XCircle,
  };

  return (
    <div className="space-y-6">

      {/* ======================================
          HEADER
      ======================================= */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Queue Management
          </h1>

          <p className="text-gray-500 mt-1">
            Manage today's customers and control the queue.
          </p>
        </div>

        <button
          type="button"
          onClick={loadQueue}
          disabled={loading || actionLoading}
          className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
        >
          <RefreshCw size={18} />

          Refresh
        </button>

      </div>

      {/* ======================================
          ERROR
      ======================================= */}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* ======================================
          STATISTICS
      ======================================= */}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">

        <StatCard
          icon={Ticket}
          title="Total"
          value={stats.total}
        />

        <StatCard
          icon={Clock}
          title="Waiting"
          value={stats.waiting}
        />

        <StatCard
          icon={Play}
          title="Serving"
          value={stats.serving}
        />

        <StatCard
          icon={CheckCircle}
          title="Completed"
          value={stats.completed}
        />

        <StatCard
          icon={XCircle}
          title="Skipped"
          value={stats.skipped}
        />

      </div>

      {/* ======================================
          CURRENT CUSTOMER
      ======================================= */}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

          <div>

            <p className="text-sm text-gray-500">
              Currently Serving
            </p>

            {servingCustomer ? (
              <>
                <h2 className="text-4xl font-bold text-[#F4400D] mt-2">
                  {servingCustomer.ticketNumber}
                </h2>

                <p className="text-lg font-semibold text-gray-900 mt-2">
                  {servingCustomer.customerName}
                </p>

                <p className="text-sm text-gray-500">
                  {servingCustomer.service}
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-400 mt-2">
                  No customer being served
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Call the next customer to begin.
                </p>
              </>
            )}

          </div>

          {/* ==================================
              ACTION BUTTONS
          =================================== */}

          <div className="flex gap-3">

            {servingCustomer ? (
              <>
                {/* COMPLETE */}

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() =>
                    handleComplete(
                      servingCustomer._id
                    )
                  }
                  className="flex items-center gap-2 px-5 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50"
                >
                  <Check size={18} />

                  Complete
                </button>

                {/* SKIP */}

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() =>
                    handleSkip(
                      servingCustomer._id
                    )
                  }
                  className="flex items-center gap-2 px-5 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 disabled:opacity-50"
                >
                  <SkipForward size={18} />

                  Skip
                </button>
              </>
            ) : (
              /* CALL NEXT */

              <button
                type="button"
                disabled={
                  actionLoading ||
                  waitingCustomers.length === 0 ||
                  Boolean(servingCustomer)
                }
                onClick={handleCallNext}
                className="flex items-center gap-2 px-6 py-3 bg-[#F4400D] text-white rounded-xl font-semibold hover:bg-[#d9380c] disabled:opacity-50"
              >
                <Play size={18} />

                {actionLoading
                  ? "Calling..."
                  : "Call Next"}
              </button>
            )}

          </div>

        </div>

      </div>

      {/* ======================================
          QUEUE TABLE
      ======================================= */}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

        <div className="px-6 py-5 border-b border-gray-200">

          <h2 className="text-lg font-bold text-gray-900">
            Today's Queue
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Customers currently in today's queue.
          </p>

        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Loading queue...
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-10 text-center">

            <Ticket
              size={42}
              className="mx-auto text-gray-300 mb-3"
            />

            <h3 className="font-semibold text-gray-700">
              No customers in the queue
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Customers will appear here when they join.
            </p>

          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-50">

                <tr>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                    Position
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                    Ticket
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                    Customer
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                    Service
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                    Status
                  </th>

                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {tickets.map((ticket) => {

                  const StatusIcon =
                    statusIcons[ticket.status] ||
                    Clock;

                  return (
                    <tr
                      key={ticket._id}
                      className="hover:bg-gray-50"
                    >

                      {/* POSITION */}

                      <td className="px-6 py-4">

                        <span className="font-semibold text-gray-700">
                          #{ticket.position}
                        </span>

                      </td>

                      {/* TICKET */}

                      <td className="px-6 py-4">

                        <span className="font-bold text-[#F4400D]">
                          {ticket.ticketNumber}
                        </span>

                      </td>

                      {/* CUSTOMER */}

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-3">

                          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">

                            <User
                              size={17}
                              className="text-gray-500"
                            />

                          </div>

                          <div>

                            <p className="font-medium text-gray-900">
                              {ticket.customerName}
                            </p>

                            {ticket.customerPhone && (
                              <p className="text-xs text-gray-500 flex items-center gap-1">

                                <Phone size={12} />

                                {ticket.customerPhone}

                              </p>
                            )}

                          </div>

                        </div>

                      </td>

                      {/* SERVICE */}

                      <td className="px-6 py-4 text-gray-600">
                        {ticket.service}
                      </td>

                      {/* STATUS */}

                      <td className="px-6 py-4">

                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${
                            statusStyles[
                              ticket.status
                            ]
                          }`}
                        >

                          <StatusIcon size={14} />

                          {ticket.status}

                        </span>

                      </td>

                      {/* ACTION */}

                      <td className="px-6 py-4 text-right">

                        {/* WAITING */}

                        {ticket.status === "waiting" && (
                          <button
                            type="button"
                            disabled={
                              actionLoading ||
                              Boolean(servingCustomer)
                            }
                            onClick={handleCallNext}
                            className="px-3 py-2 text-sm bg-[#F4400D] text-white rounded-lg hover:bg-[#d9380c] disabled:opacity-40"
                          >
                            Call
                          </button>
                        )}

                        {/* SERVING */}

                        {ticket.status === "serving" && (
                          <div className="flex justify-end gap-2">

                            <button
                              type="button"
                              disabled={actionLoading}
                              onClick={() =>
                                handleComplete(
                                  ticket._id
                                )
                              }
                              className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-40"
                            >
                              Complete
                            </button>

                            <button
                              type="button"
                              disabled={actionLoading}
                              onClick={() =>
                                handleSkip(
                                  ticket._id
                                )
                              }
                              className="px-3 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-40"
                            >
                              Skip
                            </button>

                          </div>
                        )}

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
};

// ==========================================
// STAT CARD
// ==========================================

const StatCard = ({
  icon: Icon,
  title,
  value,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-gray-500">
            {title}
          </p>

          <p className="text-2xl font-bold text-gray-900 mt-1">
            {value}
          </p>

        </div>

        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">

          <Icon
            size={20}
            className="text-[#F4400D]"
          />

        </div>

      </div>

    </div>
  );
};

export default QueueSection;