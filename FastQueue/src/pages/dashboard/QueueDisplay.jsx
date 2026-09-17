import React, { useEffect, useState } from "react";
import { Volume2, Users, ArrowLeft, LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../config/axiosinstance.js";

const QueueDisplay = () => {
  const navigate = useNavigate();

  const [queue, setQueue] = useState([]);
  const [stats, setStats] = useState({});
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDisplay = async () => {
    try {
      const companyResponse = await axiosInstance.get("/company");

      const queueResponse = await axiosInstance.get("/queue/today");

      const statsResponse = await axiosInstance.get("/queue/stats");

      setCompany(companyResponse.data.company);
      setQueue(queueResponse.data.tickets || []);
      setStats(statsResponse.data || {});
    } catch (error) {
      console.error("Queue display error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDisplay();

    const interval = setInterval(loadDisplay, 3000);

    return () => clearInterval(interval);
  }, []);

  const currentTicket = queue.find(
    (ticket) => ticket.status === "serving"
  );

  const waitingTickets = queue
    .filter((ticket) => ticket.status === "waiting")
    .slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-xl">Loading queue...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* HEADER */}
      <header className="px-6 md:px-8 py-5 md:py-6 border-b border-white/10 flex items-center justify-between gap-4">

        {/* COMPANY INFO */}
        <div>
          <p className="text-[#F4400D] text-2xl font-black">
            FASTQUEUE
          </p>

          <h1 className="text-xl font-semibold mt-1">
            {company?.name || "Queue Display"}
          </h1>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3 md:gap-6">

          {/* WAITING COUNT */}
          <div className="hidden sm:flex items-center gap-2 text-gray-300">
            <Users size={20} />

            <span>
              {stats.waiting || 0} waiting
            </span>
          </div>

          {/* BACK TO DASHBOARD */}
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all"
          >
            <ArrowLeft size={18} />

            <span className="hidden md:inline">
              Back to Dashboard
            </span>

            <LayoutDashboard
              size={18}
              className="md:hidden"
            />
          </button>

        </div>

      </header>


      {/* MAIN */}
      <main className="p-6 md:p-10">

        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.4fr_0.8fr] gap-8">

          {/* NOW SERVING */}
          <section className="bg-white/5 border border-white/10 rounded-[2rem] p-8 md:p-12 text-center">

            <div className="flex items-center justify-center gap-2 text-gray-400 mb-5">

              <Volume2 size={22} />

              <span className="uppercase tracking-[0.2em] text-sm font-semibold">
                Now Serving
              </span>

            </div>

            {currentTicket ? (
              <>
                <div className="text-8xl md:text-[10rem] font-black text-[#F4400D] leading-none">
                  {currentTicket.ticketNumber}
                </div>

                <h2 className="text-3xl md:text-4xl font-bold mt-8">
                  {currentTicket.customerName}
                </h2>

                <p className="text-xl text-gray-400 mt-2">
                  {currentTicket.service}
                </p>
              </>
            ) : (
              <div className="py-20">

                <p className="text-5xl font-bold text-gray-500">
                  ---
                </p>

                <p className="text-xl text-gray-400 mt-5">
                  Please wait for the next customer
                </p>

              </div>
            )}

          </section>


          {/* NEXT IN QUEUE */}
          <section className="bg-white/5 border border-white/10 rounded-[2rem] p-8">

            <h2 className="text-xl font-bold mb-6">
              Next in Queue
            </h2>

            <div className="space-y-3">

              {waitingTickets.length > 0 ? (
                waitingTickets.map((ticket, index) => (
                  <div
                    key={ticket._id}
                    className={`flex items-center justify-between p-5 rounded-2xl ${
                      index === 0
                        ? "bg-[#F4400D]/20 border border-[#F4400D]/40"
                        : "bg-white/5"
                    }`}
                  >

                    <span className="text-gray-400">
                      #{index + 1}
                    </span>

                    <span className="text-2xl font-black">
                      {ticket.ticketNumber}
                    </span>

                    <span className="text-gray-400 text-sm">
                      {ticket.service}
                    </span>

                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No customers waiting.
                </div>
              )}

            </div>

          </section>

        </div>


        {/* FOOTER */}
        <div className="max-w-7xl mx-auto mt-8 text-center">

          <p className="text-gray-500">
            Please wait for your ticket number to be called.
          </p>

        </div>

      </main>

    </div>
  );
};

export default QueueDisplay;