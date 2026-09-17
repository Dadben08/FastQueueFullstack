import React, { useEffect, useState } from "react";
import {
  CheckCircle,
  SkipForward,
  Volume2,
  Users,
  RefreshCw,
} from "lucide-react";

import { useDashboard } from "../../context/dashboardContext";

const QueueManagement = () => {
  const {
    queue,
    currentTicket,
    loading,
    error,
    refresh,
    callNextCustomer,
    completeCurrentCustomer,
    skipCurrentCustomer,
  } = useDashboard();

  const [actionLoading, setActionLoading] = useState(false);

  // ==========================================
  // AUTO REFRESH
  // ==========================================

  useEffect(() => {
    const interval = setInterval(() => {
      refresh();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // ==========================================
  // DERIVED QUEUE DATA
  // ==========================================

  const waitingTickets = queue.filter(
    (ticket) => ticket.status === "waiting"
  );

  const stats = {
    total: queue.length,

    waiting: queue.filter(
      (ticket) => ticket.status === "waiting"
    ).length,

    serving: queue.filter(
      (ticket) => ticket.status === "serving"
    ).length,

    completed: queue.filter(
      (ticket) => ticket.status === "completed"
    ).length,

    skipped: queue.filter(
      (ticket) => ticket.status === "skipped"
    ).length,
  };

  // ==========================================
  // CALL NEXT
  // ==========================================

  const handleCallNext = async () => {
    if (currentTicket || waitingTickets.length === 0) {
      return;
    }

    try {
      setActionLoading(true);

      await callNextCustomer();
    } catch (err) {
      console.error("Call next error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // COMPLETE
  // ==========================================

  const handleComplete = async () => {
    if (!currentTicket) {
      return;
    }

    try {
      setActionLoading(true);

      await completeCurrentCustomer();
    } catch (err) {
      console.error("Complete error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // SKIP
  // ==========================================

  const handleSkip = async () => {
    if (!currentTicket) {
      return;
    }

    try {
      setActionLoading(true);

      await skipCurrentCustomer();
    } catch (err) {
      console.error("Skip error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading && queue.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
          <p className="text-gray-500">
            Loading queue...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="p-4 md:p-6 space-y-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Queue Management
          </h1>

          <p className="text-gray-500 mt-1">
            Manage today's customers and serve them in order.
          </p>
        </div>

        <div className="flex gap-3">

          {/* REFRESH */}
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition disabled:opacity-50"
          >
            <RefreshCw
              size={18}
              className={loading ? "animate-spin" : ""}
            />

            Refresh
          </button>

          {/* QUEUE DISPLAY */}
          <a
            href="/queue-display"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-[#F4400D] text-[#F4400D] rounded-xl font-semibold hover:bg-orange-50"
          >
            <Volume2 size={18} />

            Open Queue Display
          </a>

        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">

        <StatCard
          title="Total"
          value={stats.total}
        />

        <StatCard
          title="Waiting"
          value={stats.waiting}
        />

        <StatCard
          title="Serving"
          value={stats.serving}
        />

        <StatCard
          title="Completed"
          value={stats.completed}
        />

        <StatCard
          title="Skipped"
          value={stats.skipped}
        />

      </div>

      {/* CURRENT CUSTOMER */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">

        <div className="px-6 py-5 border-b">
          <h2 className="text-lg font-bold text-gray-900">
            Currently Serving
          </h2>
        </div>

        <div className="p-6">

          {currentTicket ? (
            <div className="text-center">

              <p className="text-gray-500 mb-2">
                Now Serving
              </p>

              <h3 className="text-6xl md:text-7xl font-black text-[#F4400D]">
                {currentTicket.ticketNumber}
              </h3>

              <p className="text-xl font-semibold text-gray-900 mt-4">
                {currentTicket.customerName}
              </p>

              <p className="text-gray-500 mt-1">
                {currentTicket.service}
              </p>

              <div className="flex justify-center gap-3 mt-6">

                <button
                  type="button"
                  onClick={handleComplete}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle size={18} />

                  Complete
                </button>

                <button
                  type="button"
                  onClick={handleSkip}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <SkipForward size={18} />

                  Skip
                </button>

              </div>
            </div>
          ) : (
            <div className="text-center py-8">

              <Users
                size={48}
                className="mx-auto text-gray-300 mb-4"
              />

              <p className="text-gray-500">
                No customer is currently being served.
              </p>

              <button
                type="button"
                onClick={handleCallNext}
                disabled={
                  actionLoading ||
                  waitingTickets.length === 0
                }
                className="mt-5 inline-flex items-center gap-2 px-7 py-3 bg-[#F4400D] text-white rounded-xl font-bold hover:bg-[#d9380c] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Volume2 size={19} />

                {waitingTickets.length === 0
                  ? "No Customers Waiting"
                  : "Call Next Customer"}
              </button>

            </div>
          )}

        </div>
      </div>

      {/* TODAY'S QUEUE */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">

        <div className="px-6 py-5 border-b flex flex-col md:flex-row md:justify-between md:items-center gap-3">

          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Today's Queue
            </h2>

            <p className="text-sm text-gray-500">
              {waitingTickets.length} customer
              {waitingTickets.length !== 1
                ? "s"
                : ""}{" "}
              waiting
            </p>
          </div>

          <button
            type="button"
            onClick={handleCallNext}
            disabled={
              actionLoading ||
              waitingTickets.length === 0 ||
              !!currentTicket
            }
            className="px-5 py-2.5 bg-[#F4400D] text-white rounded-xl font-semibold hover:bg-[#d9380c] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Call Next
          </button>

        </div>

        {queue.length === 0 ? (
          <div className="p-10 text-center">

            <Users
              size={48}
              className="mx-auto text-gray-300 mb-4"
            />

            <p className="font-medium text-gray-700">
              No customers have joined the queue today.
            </p>

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

                </tr>

              </thead>

              <tbody>

                {queue.map((ticket) => (
                  <tr
                    key={ticket._id}
                    className="border-t hover:bg-gray-50"
                  >

                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-700">
                        #{ticket.position}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-bold text-[#F4400D]">
                      {ticket.ticketNumber}
                    </td>

                    <td className="px-6 py-4">
                      {ticket.customerName}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {ticket.service}
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge
                        status={ticket.status}
                      />
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
};

const StatCard = ({ title, value }) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">

    <p className="text-sm text-gray-500">
      {title}
    </p>

    <p className="text-3xl font-bold text-gray-900 mt-2">
      {value}
    </p>

  </div>
);

const StatusBadge = ({ status }) => {

  const styles = {
    waiting:
      "bg-yellow-100 text-yellow-700",

    serving:
      "bg-blue-100 text-blue-700",

    completed:
      "bg-green-100 text-green-700",

    skipped:
      "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
        styles[status] ||
        "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
};

export default QueueManagement;