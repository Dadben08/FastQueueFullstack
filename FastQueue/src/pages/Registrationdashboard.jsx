import React, { useEffect, useMemo, useState } from "react";

import {
  Search,
  MapPin,
  Building2,
  School,
  Utensils,
  Hospital,
  Clock,
  CheckCircle,
  Home,
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Loader,
} from "lucide-react";

import axiosInstance from "../config/axiosinstance";
import dashboardService from "../services/dashboardService";  
const PRIMARY_COLOR = "#f4400d";

// ==========================================
// CATEGORY ICON
// ==========================================
const getCategoryIcon = (category) => {
  const iconProps = { size: 20 };

  switch (category) {
    case "Bank":
      return <Building2 {...iconProps} className="text-blue-500" />;

    case "School":
      return <School {...iconProps} className="text-green-500" />;

    case "Hospital":
    case "Hospital/Clinic":
      return <Hospital {...iconProps} className="text-red-500" />;

    case "Restaurant":
      return <Utensils {...iconProps} className="text-yellow-600" />;

    default:
      return <Building2 {...iconProps} className="text-gray-500" />;
  }
};

// ==========================================
// GENERATE TIME SLOTS
// ==========================================
const generateTimeSlots = () => {
  const slots = [];

  const start = 8 * 60;
  const end = 17 * 60;

  for (let m = start; m <= end; m += 30) {
    const hours = Math.floor(m / 60);
    const minutes = m % 60;

    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;

    const time = `${displayHours}:${
      minutes < 10 ? "0" + minutes : minutes
    } ${ampm}`;

    slots.push(time);
  }

  return slots;
};

// ==========================================
// STEP 1 - USER INFORMATION
// ==========================================
const RegStep1UserInfo = ({
  registrationData,
  setRegistrationData,
  nextRegStep,
  prevRegStep,
}) => {
  const handleChange = (e) => {
    setRegistrationData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const isFormValid =
    registrationData.fullName.trim() &&
    registrationData.sex &&
    registrationData.email.trim() &&
    registrationData.phoneNumber.trim() &&
    registrationData.location.trim() &&
    registrationData.description.trim();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-3">
        <h3 className="text-xl font-semibold text-gray-800">
          1. Your Contact Information
        </h3>

        <button
          onClick={prevRegStep}
          className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back
        </button>
      </div>

      {/* FULL NAME */}
      <label className="block">
        <span className="text-gray-700 font-medium flex items-center mb-2">
          <User size={16} className="mr-2" />
          Full Name
        </span>

        <input
          type="text"
          name="fullName"
          value={registrationData.fullName}
          onChange={handleChange}
          placeholder="Chidinma Okoro"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
        />
      </label>

      {/* SEX */}
      <div>
        <span className="text-gray-700 font-medium flex items-center mb-2">
          <User size={16} className="mr-2" />
          Sex
        </span>

        <div className="flex gap-4">
          {["Male", "Female"].map((sex) => (
            <button
              key={sex}
              type="button"
              onClick={() =>
                setRegistrationData((prev) => ({
                  ...prev,
                  sex,
                }))
              }
              className={`px-5 py-2 rounded-lg border-2 ${
                registrationData.sex === sex
                  ? "bg-red-500 text-white border-red-500"
                  : "bg-gray-100 text-gray-700 border-gray-300"
              }`}
            >
              {sex}
            </button>
          ))}
        </div>
      </div>

      {/* EMAIL + PHONE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label>
          <span className="text-gray-700 font-medium flex items-center mb-2">
            <Mail size={16} className="mr-2" />
            Email
          </span>

          <input
            type="email"
            name="email"
            value={registrationData.email}
            onChange={handleChange}
            placeholder="example@mail.com"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
          />
        </label>

        <label>
          <span className="text-gray-700 font-medium flex items-center mb-2">
            <Phone size={16} className="mr-2" />
            Phone Number
          </span>

          <input
            type="tel"
            name="phoneNumber"
            value={registrationData.phoneNumber}
            onChange={handleChange}
            placeholder="080XXXXXXXXX"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
          />
        </label>
      </div>

      {/* LOCATION */}
      <label>
        <span className="text-gray-700 font-medium flex items-center mb-2">
          <MapPin size={16} className="mr-2" />
          Your Location
        </span>

        <input
          type="text"
          name="location"
          value={registrationData.location}
          onChange={handleChange}
          placeholder="Surulere, Lagos"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
        />
      </label>

      {/* PURPOSE */}
      <label>
        <span className="text-gray-700 font-medium flex items-center mb-2">
          <User size={16} className="mr-2" />
          Purpose of Joining Queue
        </span>

        <textarea
          name="description"
          value={registrationData.description}
          onChange={handleChange}
          placeholder="Account opening, consultation, medication pickup..."
          rows="3"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
        />
      </label>

      <div className="flex justify-end pt-4">
        <button
          type="button"
          disabled={!isFormValid}
          onClick={nextRegStep}
          className={`px-6 py-3 rounded-full font-semibold ${
            isFormValid
              ? "bg-[#F4400D] text-white hover:bg-red-600"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Next: Select Time
        </button>
      </div>
    </div>
  );
};

// ==========================================
// STEP 2 - DATE & TIME
// ==========================================
const RegStep2DateTime = ({
  registrationData,
  setRegistrationData,
  nextRegStep,
  prevRegStep,
}) => {
  const timeSlots = generateTimeSlots();

  const isFormValid = registrationData.date && registrationData.time;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-3">
        <h3 className="text-xl font-semibold text-gray-800">
          2. Select Your Slot
        </h3>

        <button
          onClick={prevRegStep}
          className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back
        </button>
      </div>

      {/* DATE */}
      <label>
        <span className="text-gray-700 font-medium flex items-center mb-2">
          <Calendar size={16} className="mr-2" />
          Preferred Date
        </span>

        <input
          type="date"
          name="date"
          value={registrationData.date}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) =>
            setRegistrationData((prev) => ({
              ...prev,
              date: e.target.value,
            }))
          }
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
        />
      </label>

      {/* TIME */}
      <div>
        <span className="text-gray-700 font-medium flex items-center mb-2">
          <Clock size={16} className="mr-2" />
          Preferred Time
        </span>

        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-h-60 overflow-y-auto p-2 border rounded-lg bg-gray-50">
          {timeSlots.map((time) => (
            <button
              type="button"
              key={time}
              onClick={() =>
                setRegistrationData((prev) => ({
                  ...prev,
                  time,
                }))
              }
              className={`p-2 text-xs rounded-lg border-2 ${
                registrationData.time === time
                  ? "bg-red-500 text-white border-red-600"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-red-50"
              }`}
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={nextRegStep}
          disabled={!isFormValid}
          className={`px-6 py-3 rounded-full font-semibold ${
            isFormValid
              ? "bg-[#F4400D] text-white hover:bg-red-600"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Review & Join Queue
          <CheckCircle size={18} className="inline ml-2" />
        </button>
      </div>
    </div>
  );
};

// ==========================================
// STEP 3 - CONFIRMATION
// ==========================================
const RegStep3Confirmation = ({
  registrationData,
  selectedBusiness,
  submitQueue,
  submitting,
  error,
  prevRegStep,
}) => {
  return (
    <div className="space-y-8 text-center">
      <CheckCircle size={64} className="text-green-600 mx-auto" />

      <div>
        <h2 className="text-3xl font-bold text-gray-800">
          Confirm Queue Registration
        </h2>

        <p className="text-gray-500 mt-2">
          You are about to join{" "}
          <strong>{selectedBusiness.name}</strong>
        </p>
      </div>

      <div className="bg-gray-50 rounded-2xl p-6 text-left max-w-xl mx-auto space-y-3">
        <p>
          <strong>Name:</strong> {registrationData.fullName}
        </p>

        <p>
          <strong>Phone:</strong> {registrationData.phoneNumber}
        </p>

        <p>
          <strong>Email:</strong> {registrationData.email}
        </p>

        <p>
          <strong>Date:</strong> {registrationData.date}
        </p>

        <p>
          <strong>Time:</strong> {registrationData.time}
        </p>

        <p>
          <strong>Purpose:</strong> {registrationData.description}
        </p>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex justify-center gap-4">
        <button
          onClick={prevRegStep}
          disabled={submitting}
          className="px-6 py-3 border border-gray-300 rounded-full"
        >
          Back
        </button>

        <button
          onClick={submitQueue}
          disabled={submitting}
          className="px-8 py-3 bg-[#F4400D] text-white font-semibold rounded-full hover:bg-red-600 disabled:bg-gray-400"
        >
          {submitting ? (
            <>
              <Loader size={18} className="inline mr-2 animate-spin" />
              Joining Queue...
            </>
          ) : (
            "Join Queue"
          )}
        </button>
      </div>
    </div>
  );
};

// ==========================================
// SUCCESS
// ==========================================
const QueueSuccess = ({
  queue,
  selectedBusiness,
  resetView,
}) => {
  const [email, setEmail] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");
  const [emailError, setEmailError] = useState("");

  const handleSendTicketEmail = async () => {
    if (!email.trim()) {
      setEmailError("Please enter your email address.");
      return;
    }

    try {
      setSendingEmail(true);
      setEmailError("");
      setEmailMessage("");

      const response = await dashboardService.sendTicketEmail(
        queue._id,
        email
      );

      setEmailMessage(
        response.message ||
          "Ticket sent successfully to your email."
      );
    } catch (error) {
      console.error("SEND EMAIL ERROR:", error);

      setEmailError(
        error.response?.data?.message ||
          "Unable to send ticket email. Please try again."
      );
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="text-center space-y-8">

      <CheckCircle
        size={70}
        className="text-green-600 mx-auto"
      />

      <div>
        <h2 className="text-3xl font-bold text-green-700">
          You Are Now In The Queue!
        </h2>

        <p className="text-gray-600 mt-2">
          Your queue request for{" "}
          <strong>{selectedBusiness.name}</strong>{" "}
          was successful.
        </p>
      </div>

      {/* =====================================
          TICKET
      ====================================== */}
      <div className="bg-white p-8 rounded-2xl shadow-xl border-4 border-green-200 inline-block">

        <p className="text-gray-500 font-semibold">
          Your Queue Number
        </p>

        <div className="text-7xl font-extrabold text-[#F4400D] my-4">
          {queue?.ticketNumber ||
            queue?.number ||
            queue?.ticket ||
            "--"}
        </div>

        <p className="text-lg text-gray-700">
          Position:{" "}
          <strong>
            {queue?.position ?? "--"}
          </strong>
        </p>

        {queue?.estimatedWaitTime && (
          <p className="text-gray-500 mt-2">
            Estimated wait:{" "}
            <strong>
              {queue.estimatedWaitTime} minutes
            </strong>
          </p>
        )}
      </div>

      {/* =====================================
          SEND TICKET EMAIL
      ====================================== */}
      <div className="bg-gray-50 rounded-2xl p-6 max-w-xl mx-auto text-left">

        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Send Ticket to Your Email
        </h3>

        <p className="text-gray-500 mb-4">
          Enter your email address and we'll send your
          queue ticket to you.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            className="flex-1 p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500"
          />

          <button
            onClick={handleSendTicketEmail}
            disabled={sendingEmail}
            className="px-6 py-3 bg-[#F4400D] text-white font-semibold rounded-lg hover:bg-red-600 disabled:bg-gray-400"
          >
            {sendingEmail
              ? "Sending..."
              : "Send Ticket"}
          </button>

        </div>

        {emailMessage && (
          <p className="mt-3 text-green-600 font-medium">
            {emailMessage}
          </p>
        )}

        {emailError && (
          <p className="mt-3 text-red-600 font-medium">
            {emailError}
          </p>
        )}

      </div>

      {/* =====================================
          DONE BUTTON
      ====================================== */}
      <div>
        <button
          onClick={resetView}
          className="px-8 py-3 bg-[#F4400D] text-white rounded-full font-semibold hover:bg-red-600"
        >
          Done & Return to Companies
        </button>
      </div>

    </div>
  );
};

// ==========================================
// QUEUE REGISTRATION FORM
// ==========================================
const QueueRegistrationForm = ({
  selectedBusiness,
  setView,
  resetSelectedBusiness,
}) => {
  const [regStep, setRegStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [queue, setQueue] = useState(null);

  const [registrationData, setRegistrationData] = useState({
    fullName: "",
    sex: "",
    email: "",
    location: "",
    description: "",
    phoneNumber: "",
    date: "",
    time: "",
  });

  const nextRegStep = () => {
    setRegStep((prev) => Math.min(prev + 1, 3));
  };

  const prevRegStep = () => {
    setRegStep((prev) => Math.max(prev - 1, 1));
  };

  // ==========================================
  // ACTUALLY JOIN BACKEND QUEUE
  // ==========================================
  const submitQueue = async () => {
    try {
      setSubmitting(true);
      setError("");

      const payload = {
        companyId: selectedBusiness._id,

        customerName: registrationData.fullName,

        customerPhone: registrationData.phoneNumber,

        customerEmail: registrationData.email,

        sex: registrationData.sex,

        location: registrationData.location,

        description: registrationData.description,

        service:
          registrationData.description ||
          selectedBusiness.queueName ||
          "General Service",

        date: registrationData.date,

        time: registrationData.time,
      };

      console.log("Joining queue with:", payload);

      const response = await axiosInstance.post(
        "/queue/join",
        payload
      );

      console.log("Queue response:", response.data);

      setQueue(response.data.ticket || response.data.queue);

      setRegStep(4);
    } catch (err) {
      console.error("Join queue error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to join the queue. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetView = () => {
    resetSelectedBusiness();
    setView("search");
  };

  // ==========================================
  // SUCCESS PAGE
  // ==========================================
  if (regStep === 4) {
    return (
      <QueueSuccess
        queue={queue}
        selectedBusiness={selectedBusiness}
        resetView={resetView}
      />
    );
  }

  return (
    <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-100">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[#F4400D]">
            Join: {selectedBusiness.name}
          </h2>

          <p className="text-gray-500 mt-1">
            <MapPin size={15} className="inline mr-1" />
            {selectedBusiness.address}
          </p>
        </div>

        <button
          onClick={resetView}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-100"
        >
          <Home size={16} className="mr-2" />
          Back
        </button>
      </div>

      {/* PROGRESS */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className="flex flex-col items-center"
            >
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full font-bold border-2 ${
                  regStep >= step
                    ? "bg-[#F4400D] text-white border-[#F4400D]"
                    : "bg-white text-gray-500 border-gray-300"
                }`}
              >
                {step}
              </div>

              <span className="text-xs mt-2">
                {step === 1
                  ? "Your Details"
                  : step === 2
                  ? "Time"
                  : "Confirm"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {regStep === 1 && (
        <RegStep1UserInfo
          registrationData={registrationData}
          setRegistrationData={setRegistrationData}
          nextRegStep={nextRegStep}
          prevRegStep={resetView}
        />
      )}

      {regStep === 2 && (
        <RegStep2DateTime
          registrationData={registrationData}
          setRegistrationData={setRegistrationData}
          nextRegStep={nextRegStep}
          prevRegStep={prevRegStep}
        />
      )}

      {regStep === 3 && (
        <RegStep3Confirmation
          registrationData={registrationData}
          selectedBusiness={selectedBusiness}
          submitQueue={submitQueue}
          submitting={submitting}
          error={error}
          prevRegStep={prevRegStep}
        />
      )}
    </div>
  );
};

// ==========================================
// COMPANY CARD
// ==========================================
const SearchResultCard = ({
  business,
  handleJoinQueueClick,
}) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:shadow-xl transition">
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-2">
          {getCategoryIcon(business.businessType)}

          <h3 className="text-xl font-bold text-gray-800">
            {business.name}
          </h3>
        </div>

        <p className="text-sm text-gray-500 flex items-center">
          <MapPin size={14} className="mr-2 text-red-500" />
          {business.address || "Address not provided"}
        </p>

        <p className="text-sm text-gray-500 flex items-center">
          <Clock size={14} className="mr-2 text-amber-500" />

          Opening hours:{" "}
          <span className="font-semibold ml-1">
            {business.openingTime || "08:00"} -{" "}
            {business.closingTime || "17:00"}
          </span>
        </p>

        <p className="text-sm text-gray-500">
          Queue:{" "}
          <span className="font-semibold">
            {business.queueName || "Main Queue"}
          </span>
        </p>

        {business.services?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {business.services.map((service, index) => (
              <span
                key={index}
                className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded-full"
              >
                {typeof service === "string"
                  ? service
                  : service.name || service.title}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 sm:mt-0 sm:ml-5">
        <button
          onClick={() => handleJoinQueueClick(business)}
          className="px-6 py-3 font-semibold rounded-full shadow-md bg-[#F4400D] text-white hover:bg-red-600 transition"
        >
          Join Queue
        </button>
      </div>
    </div>
  );
};

// ==========================================
// MAIN DASHBOARD
// ==========================================
const RegistrationDashBoard = () => {
  const [view, setView] = useState("search");

  const [selectedBusiness, setSelectedBusiness] =
    useState(null);

  const [companies, setCompanies] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ==========================================
  // FETCH REAL COMPANIES FROM BACKEND
  // ==========================================
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axiosInstance.get(
          "/company/public"
        );

        console.log(
          "Companies received:",
          response.data
        );

        setCompanies(response.data.companies || []);
      } catch (err) {
        console.error(
          "Failed to fetch companies:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to load registered companies."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  // ==========================================
  // CATEGORIES FROM REAL DATA
  // ==========================================
  const categories = useMemo(() => {
    const types = companies
      .map((company) => company.businessType)
      .filter(Boolean);

    return ["All", ...new Set(types)];
  }, [companies]);

  // ==========================================
  // FILTER COMPANIES
  // ==========================================
  const filteredResults = useMemo(() => {
    return companies.filter((company) => {
      const categoryMatch =
        selectedCategory === "All" ||
        company.businessType === selectedCategory;

      const search = searchTerm.toLowerCase();

      const searchMatch =
        company.name?.toLowerCase().includes(search) ||
        company.address?.toLowerCase().includes(search) ||
        company.businessType?.toLowerCase().includes(search);

      return categoryMatch && searchMatch;
    });
  }, [
    companies,
    searchTerm,
    selectedCategory,
  ]);

  // ==========================================
  // JOIN BUTTON
  // ==========================================
  const handleJoinQueueClick = (business) => {
    console.log("Selected company:", business);

    setSelectedBusiness(business);
    setView("register");
  };

  // ==========================================
  // REGISTRATION VIEW
  // ==========================================
  if (view === "register" && selectedBusiness) {
    return (
      <div className="min-h-screen bg-gray-50 p-5 md:p-10">
        <div className="max-w-5xl mx-auto">
          <QueueRegistrationForm
            selectedBusiness={selectedBusiness}
            setView={setView}
            resetSelectedBusiness={() =>
              setSelectedBusiness(null)
            }
          />
        </div>
      </div>
    );
  }

  // ==========================================
  // SEARCH VIEW
  // ==========================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-100 px-5 py-10">
      <div className="max-w-7xl mx-auto">

        {/* HERO */}
        <div className="bg-[#F4400D] rounded-3xl p-8 md:p-12 text-white shadow-xl mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold">
            FastQueue Smart Portal
          </h1>

          <p className="mt-4 text-orange-100 text-lg max-w-xl">
            Find registered businesses, hospitals, schools
            and restaurants. Join their queues remotely and
            get notified before your turn.
          </p>

          <div className="flex gap-4 mt-6">
            <div className="bg-white/20 px-5 py-3 rounded-xl">
              <span className="block text-2xl font-bold">
                {companies.length}
              </span>
              Registered Companies
            </div>

            <div className="bg-white/20 px-5 py-3 rounded-xl">
              <span className="block text-2xl font-bold">
                24/7
              </span>
              Smart Queue
            </div>
          </div>
        </div>

        {/* SEARCH */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="relative">
            <Search
              className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              placeholder="Search business, location or category..."
              className="w-full pl-14 pr-5 py-5 rounded-2xl border border-gray-200 text-lg outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {/* CATEGORIES */}
        <div className="flex flex-wrap gap-3 mb-10">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() =>
                setSelectedCategory(category)
              }
              className={`px-5 py-2.5 rounded-full font-medium transition ${
                selectedCategory === category
                  ? "bg-[#F4400D] text-white shadow-lg"
                  : "bg-white text-gray-700 border hover:border-[#F4400D] hover:text-[#F4400D]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* RESULTS HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Registered Companies
          </h2>

          <span className="bg-red-100 text-red-600 px-4 py-2 rounded-full font-semibold">
            {filteredResults.length} Found
          </span>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="bg-white rounded-2xl p-12 text-center shadow">
            <Loader
              size={40}
              className="mx-auto text-red-500 animate-spin"
            />

            <p className="mt-4 text-gray-500">
              Loading registered companies...
            </p>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="bg-red-100 text-red-700 p-5 rounded-xl text-center">
            {error}
          </div>
        )}

        {/* RESULTS */}
        {!loading && !error && (
          <div className="space-y-5">
            {filteredResults.length > 0 ? (
              filteredResults.map((business) => (
                <SearchResultCard
                  key={business._id}
                  business={business}
                  handleJoinQueueClick={
                    handleJoinQueueClick
                  }
                />
              ))
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center shadow">
                <MapPin
                  size={50}
                  className="mx-auto text-red-500"
                />

                <h3 className="text-xl font-bold mt-4">
                  No registered company found
                </h3>

                <p className="text-gray-500 mt-2">
                  Try another company name, location or
                  category.
                </p>
              </div>
            )}
          </div>
        )}

        {/* BACK HOME */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gray-800 text-white font-semibold shadow-lg hover:bg-gray-700"
          >
            <Home size={18} />
            Back to Landing Page
          </a>
        </div>
      </div>
    </div>
  );
};

export default RegistrationDashBoard;