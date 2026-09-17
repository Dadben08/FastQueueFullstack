import React, { useEffect, useState } from "react";
import { Bell, Clock, Menu } from "lucide-react";
import { useDashboard } from "../../context/dashboardContext";
import axiosInstance from "../../config/axiosinstance.js";

const Topbar = ({ setIsOpen }) => {
  const { stats } = useDashboard();

  const [company, setCompany] = useState(null);
  const [loadingCompany, setLoadingCompany] = useState(true);

  // ==========================================
  // FETCH REGISTERED COMPANY
  // ==========================================
  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await axiosInstance.get("/company");

        console.log("Topbar company:", response.data.company);

        setCompany(response.data.company);
      } catch (error) {
        console.error(
          "Failed to fetch company for Topbar:",
          error
        );
      } finally {
        setLoadingCompany(false);
      }
    };

    fetchCompany();
  }, []);

  // ==========================================
  // CURRENT DATE
  // ==========================================
  const getCurrentDate = () => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    return new Date().toLocaleDateString(
      "en-US",
      options
    );
  };

  // ==========================================
  // COMPANY INITIALS
  // ==========================================
  const getCompanyInitials = (name) => {
    if (!name) return "FQ";

    return name
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // ==========================================
  // COMPANY NAME
  // ==========================================
  const companyName =
    company?.name || "Organization";

  // ==========================================
  // BUSINESS TYPE
  // ==========================================
  const businessType =
    company?.businessType || "Queue Management";

  return (
    <header
      className="
        bg-white
        rounded-2xl
        shadow-sm
        p-4
        md:p-6
      "
    >
      <div
        className="
          flex
          items-center
          justify-between
          gap-4
        "
      >
        {/* ======================================
            LEFT SECTION
        ====================================== */}
        <div className="flex items-start gap-3">

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(true)}
            className="
              lg:hidden
              p-2
              rounded-lg
              bg-gray-100
              hover:bg-gray-200
            "
          >
            <Menu size={24} />
          </button>

          <div>

            {/* COMPANY NAME */}
            <h1
              className="
                text-xl
                md:text-2xl
                font-bold
                text-[#2F2A76]
              "
            >
              {loadingCompany
                ? "Loading..."
                : `Welcome back, ${companyName} 👋`}
            </h1>

            {/* DATE + CURRENT QUEUE */}
            <div
              className="
                flex
                flex-col
                sm:flex-row
                sm:items-center
                gap-2
                sm:gap-4
                mt-2
                text-gray-500
                text-sm
              "
            >
              <span>
                {getCurrentDate()}
              </span>

              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                <Clock size={16} />

                <span>
                  Current queue:{" "}
                  {stats?.currentQueue || "A001"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================
            RIGHT SECTION
        ====================================== */}
        <div
          className="
            flex
            items-center
            gap-3
          "
        >

          {/* Notification */}
          <button
            className="
              relative
              p-3
              rounded-xl
              bg-gray-100
              hover:bg-orange-50
            "
          >
            <Bell
              size={20}
              className="text-[#2F2A76]"
            />

            <span
              className="
                absolute
                -top-1
                -right-1
                w-5
                h-5
                bg-[#F4400D]
                text-white
                text-xs
                rounded-full
                flex
                items-center
                justify-center
                font-bold
              "
            >
              3
            </span>
          </button>

          {/* ==================================
              COMPANY PROFILE
          ================================== */}
          <div
            className="
              hidden
              sm:flex
              items-center
              gap-3
              px-4
              py-2
              bg-gray-100
              rounded-xl
            "
          >

            {/* Company Initials */}
            <div
              className="
                w-10
                h-10
                rounded-full
                bg-[#F4400D]
                flex
                items-center
                justify-center
                text-white
                font-bold
              "
            >
              {getCompanyInitials(
                company?.name
              )}
            </div>

            {/* Company Information */}
            <div>
              <p
                className="
                  text-sm
                  font-semibold
                  text-gray-800
                "
              >
                {loadingCompany
                  ? "Loading..."
                  : companyName}
              </p>

              <p
                className="
                  text-xs
                  text-gray-500
                "
              >
                {businessType}
              </p>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;