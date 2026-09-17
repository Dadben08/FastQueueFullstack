import React from "react";
import {
  Ticket,
  ArrowRight,
  CheckCircle,
  Monitor,
} from "lucide-react";

import { useDashboard } from "../../context/dashboardContext";

const QuickActions = () => {
  const {
    callNextCustomer,
    completeCurrentCustomer,
    currentTicket,
  } = useDashboard();

  const generateTicket = () => {
    alert(
      "Generate ticket feature will be connected to the customer queue."
    );
  };

  const openDisplayScreen = () => {
    window.open("/display", "_blank", "noopener,noreferrer");
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        Quick actions
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* GENERATE TICKET */}
        <button
          onClick={generateTicket}
          className="flex items-center justify-center gap-3 px-6 py-4 bg-[#F4400D] text-white rounded-xl font-semibold hover:bg-[#d93608] transition-all duration-200"
        >
          <Ticket size={20} />

          <span>Generate ticket</span>
        </button>

        {/* CALL NEXT */}
        <button
          onClick={callNextCustomer}
          disabled={!!currentTicket}
          className="flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowRight size={20} />

          <span>
            {currentTicket
              ? `${currentTicket.ticketNumber} Serving`
              : "Call next customer"}
          </span>
        </button>

        {/* COMPLETE */}
        <button
          onClick={completeCurrentCustomer}
          disabled={!currentTicket}
          className="flex items-center justify-center gap-3 px-6 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCircle size={20} />

          <span>Complete service</span>
        </button>

        {/* DISPLAY SCREEN */}
        <button
          onClick={openDisplayScreen}
          className="flex items-center justify-center gap-3 px-6 py-4 bg-white text-[#2F2A76] border-2 border-[#2F2A76] rounded-xl font-semibold hover:bg-[#2F2A76] hover:text-white transition-all duration-200"
        >
          <Monitor size={20} />

          <span>Display queue screen</span>
        </button>
      </div>
    </div>
  );
};

export default QuickActions;