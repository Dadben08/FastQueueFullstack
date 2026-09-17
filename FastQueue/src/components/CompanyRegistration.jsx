import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  MapPin,
  Users,
  Clock,
  Ticket,
  Check,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

import bgImage from "../assets/img/fastqueue.png";
import { pricingOptions } from "../constants";
import axiosInstance from "../config/axiosinstance.js";

const STEPS = [
  { number: 1, title: "Organization" },
  { number: 2, title: "Queue Setup" },
  { number: 3, title: "Staff" },
  { number: 4, title: "Plan" },
];

const CompanyRegistration = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    // Organization
    companyName: "",
    businessType: "",
    address: "",

    // Queue
    queueName: "",
    queuePrefix: "A",
    services: "",
    openingTime: "08:00",
    closingTime: "17:00",
    dailyLimit: "50",

    // Staff
    staff: [],

    // Plan
    plan: "Free",
    billing: "monthly",
  });

  /*
   * Find selected pricing plan
   */
  const selectedPlan =
    pricingOptions.find(
      (option) => option.title === formData.plan
    ) || pricingOptions[0];

  /*
   * Calculate price
   */
  const price =
    formData.plan === "Free"
      ? "₦0"
      : formData.billing === "yearly"
      ? selectedPlan?.yearlyPrice || "₦0"
      : selectedPlan?.monthlyPrice || "₦0";

  /*
   * Handle normal inputs
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  /*
   * Continue to next step
   */
  const nextStep = () => {
    setError("");

    if (step === 1) {
      if (
        !formData.companyName.trim() ||
        !formData.businessType ||
        !formData.address.trim()
      ) {
        setError(
          "Please complete all organization fields."
        );
        return;
      }
    }

    if (step === 2) {
      if (
        !formData.queueName.trim() ||
        !formData.queuePrefix.trim() ||
        !formData.services.trim() ||
        !formData.openingTime ||
        !formData.closingTime
      ) {
        setError(
          "Please complete the queue setup."
        );
        return;
      }

      if (
        Number(formData.dailyLimit) < 1
      ) {
        setError(
          "Daily ticket limit must be at least 1."
        );
        return;
      }

      if (
        formData.openingTime >=
        formData.closingTime
      ) {
        setError(
          "Closing time must be later than opening time."
        );
        return;
      }
    }

    /*
     * Step 3 is optional
     */
    setStep((current) =>
      Math.min(current + 1, 4)
    );
  };

  /*
   * Go back
   */
  const previousStep = () => {
    setError("");

    setStep((current) =>
      Math.max(current - 1, 1)
    );
  };

  /*
   * Add staff member
   */
  const addStaff = () => {
    setFormData((prev) => ({
      ...prev,
      staff: [
        ...prev.staff,
        {
          id: Date.now(),
          name: "",
          email: "",
          role: "staff",
        },
      ],
    }));

    setError("");
  };

  /*
   * Update staff
   */
  const updateStaff = (
    id,
    field,
    value
  ) => {
    setFormData((prev) => ({
      ...prev,
      staff: prev.staff.map((member) =>
        member.id === id
          ? {
              ...member,
              [field]: value,
            }
          : member
      ),
    }));

    setError("");
  };

  /*
   * Remove staff
   */
  const removeStaff = (id) => {
    setFormData((prev) => ({
      ...prev,
      staff: prev.staff.filter(
        (member) => member.id !== id
      ),
    }));

    setError("");
  };

  /*
   * Finish company registration
   */
  const handleFinish = async () => {
  setError("");

  const token = localStorage.getItem("fastqueue_token");

  if (!token) {
    setError("Your account session was not found. Please login again.");
    navigate("/login");
    return;
  }

  const incompleteStaff = formData.staff.some(
    (member) =>
      !member.name.trim() ||
      !member.email.trim()
  );

  if (incompleteStaff) {
    setError(
      "Please complete or remove every staff member you added."
    );
    return;
  }

  try {
    setLoading(true);

    const registrationPayload = {
      name: formData.companyName.trim(),

      businessType: formData.businessType,

      address: formData.address.trim(),

      queueName: formData.queueName.trim(),

      queuePrefix: formData.queuePrefix.trim(),

      services: formData.services
        .split(",")
        .map((service) => service.trim())
        .filter(Boolean),

      openingTime: formData.openingTime,

      closingTime: formData.closingTime,

      dailyLimit: Number(formData.dailyLimit),

      staff: formData.staff.map(({ id, ...member }) => member),

      plan: formData.plan.toLowerCase(),

      billingCycle:
        formData.plan === "Free"
          ? "monthly"
          : formData.billing,

      price,
    };

    console.log(
      "Company registration payload:",
      registrationPayload
    );

    const response = await axiosInstance.post(
      "/company",
      registrationPayload
    );

    const company = response.data.company;

    if (!company?._id) {
      throw new Error("Company ID was not returned by the server.");
    }

    localStorage.setItem(
      "fastqueue_company_id",
      company._id
    );

    if (formData.plan === "Free") {
      navigate("/dashboard", {
        state: {
          companyId: company._id,
          onboardingComplete: true,
        },
      });

      return;
    }

    navigate("/payment", {
      state: {
        companyId: company._id,
        plan: formData.plan,
        billing: formData.billing,
        price,
      },
    });
  } catch (err) {
    console.error(
      "Company registration error:",
      err
    );

    setError(
      err.response?.data?.message ||
        "We could not save your company setup. Please try again."
    );
  } finally {
    setLoading(false);
  }
};
  /*
   * Reusable input
   */
  const renderInput = ({
    icon: Icon,
    label,
    name,
    type = "text",
    placeholder,
    required = true,
    min,
  }) => (
    <div>
      <label className="block text-sm font-medium mb-2">
        {label}
      </label>

      <div className="relative">
        <Icon
          className="absolute left-3 top-3 text-gray-400"
          size={20}
        />

        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          required={required}
          min={min}
          disabled={loading}
          className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#F4400D] focus:border-[#F4400D] outline-none disabled:bg-gray-100"
          placeholder={placeholder}
        />
      </div>
    </div>
  );

  /*
   * Render steps
   */
  const renderStep = () => {
    switch (step) {
      /*
       * STEP 1
       */
      case 1:
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Set up your organization
              </h2>

              <p className="text-gray-500 mt-1">
                Tell us about the business
                that will use FastQueue.
              </p>
            </div>

            {renderInput({
              icon: Building2,
              label: "Company Name",
              name: "companyName",
              placeholder:
                "Enter company name",
            })}

            <div>
              <label className="block text-sm font-medium mb-2">
                Business Type
              </label>

              <select
                name="businessType"
                value={
                  formData.businessType
                }
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#F4400D] focus:border-[#F4400D] outline-none bg-white disabled:bg-gray-100"
              >
                <option value="">
                  Select business type
                </option>

                <option value="Hospital">
                  Hospital
                </option>

                <option value="Bank">
                  Bank
                </option>

                <option value="Government Office">
                  Government Office
                </option>

                <option value="Restaurant">
                  Restaurant
                </option>

                <option value="Salon">
                  Salon
                </option>

                <option value="School">
                  School
                </option>

                <option value="Hotel">
                  Hotel
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </div>

            {renderInput({
              icon: MapPin,
              label: "Address",
              name: "address",
              placeholder:
                "Company address",
            })}
          </div>
        );

      /*
       * STEP 2
       */
      case 2:
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Set up your queue
              </h2>

              <p className="text-gray-500 mt-1">
                Configure the queue your
                customers will use.
              </p>
            </div>

            {renderInput({
              icon: Ticket,
              label: "Queue Name",
              name: "queueName",
              placeholder:
                "e.g. Main Queue",
            })}

            {renderInput({
              icon: Ticket,
              label: "Ticket Prefix",
              name: "queuePrefix",
              placeholder: "e.g. A",
            })}

            <div>
              <label className="block text-sm font-medium mb-2">
                Services Offered
              </label>

              <textarea
                name="services"
                value={
                  formData.services
                }
                onChange={handleChange}
                required
                disabled={loading}
                rows={3}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#F4400D] focus:border-[#F4400D] outline-none resize-none disabled:bg-gray-100"
                placeholder="e.g. Consultation, Account Opening, Customer Support"
              />

              <p className="text-xs text-gray-500 mt-1">
                Separate multiple services
                with commas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput({
                icon: Clock,
                label: "Opening Time",
                name: "openingTime",
                type: "time",
              })}

              {renderInput({
                icon: Clock,
                label: "Closing Time",
                name: "closingTime",
                type: "time",
              })}
            </div>

            {renderInput({
              icon: Ticket,
              label:
                "Daily Ticket Limit",
              name: "dailyLimit",
              type: "number",
              placeholder: "50",
              min: 1,
            })}
          </div>
        );

      /*
       * STEP 3
       */
      case 3:
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Add your staff
              </h2>

              <p className="text-gray-500 mt-1">
                This step is optional.
                You can also add staff
                later from Settings.
              </p>
            </div>

            {formData.staff.length ===
              0 && (
              <div className="border border-dashed border-gray-300 rounded-2xl p-8 text-center">
                <Users
                  className="mx-auto text-gray-400 mb-3"
                  size={36}
                />

                <p className="text-gray-600 mb-4">
                  No staff members added
                  yet.
                </p>

                <button
                  type="button"
                  onClick={addStaff}
                  disabled={loading}
                  className="px-5 py-2.5 bg-[#F4400D] text-white rounded-xl font-semibold hover:bg-[#d9380c] transition disabled:opacity-60"
                >
                  Add Staff Member
                </button>
              </div>
            )}

            {formData.staff.map(
              (member, index) => (
                <div
                  key={member.id}
                  className="border border-gray-200 rounded-2xl p-5 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">
                      Staff Member{" "}
                      {index + 1}
                    </h3>

                    <button
                      type="button"
                      onClick={() =>
                        removeStaff(
                          member.id
                        )
                      }
                      disabled={loading}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>

                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) =>
                      updateStaff(
                        member.id,
                        "name",
                        e.target.value
                      )
                    }
                    disabled={loading}
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#F4400D] outline-none disabled:bg-gray-100"
                    placeholder="Staff name"
                  />

                  <input
                    type="email"
                    value={member.email}
                    onChange={(e) =>
                      updateStaff(
                        member.id,
                        "email",
                        e.target.value
                      )
                    }
                    disabled={loading}
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#F4400D] outline-none disabled:bg-gray-100"
                    placeholder="Staff email"
                  />

                  <select
                    value={member.role}
                    onChange={(e) =>
                      updateStaff(
                        member.id,
                        "role",
                        e.target.value
                      )
                    }
                    disabled={loading}
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#F4400D] outline-none bg-white disabled:bg-gray-100"
                  >
                    <option value="staff">
                      Staff
                    </option>

                    <option value="admin">
                      Admin
                    </option>
                  </select>
                </div>
              )
            )}

            {formData.staff.length >
              0 && (
              <button
                type="button"
                onClick={addStaff}
                disabled={loading}
                className="w-full border border-[#F4400D] text-[#F4400D] py-3 rounded-xl font-semibold hover:bg-orange-50 transition disabled:opacity-60"
              >
                + Add Another Staff
                Member
              </button>
            )}
          </div>
        );

      /*
       * STEP 4
       */
      case 4:
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Choose your plan
              </h2>

              <p className="text-gray-500 mt-1">
                Select the plan and billing
                cycle for your organization.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plan
              </label>

              <select
                name="plan"
                value={formData.plan}
                onChange={(e) => {
                  const value =
                    e.target.value;

                  setFormData((prev) => ({
                    ...prev,
                    plan: value,
                    billing:
                      value === "Free"
                        ? "monthly"
                        : prev.billing,
                  }));

                  setError("");
                }}
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F4400D] focus:border-[#F4400D] outline-none bg-white disabled:bg-gray-100"
              >
                {pricingOptions.map(
                  (option) => (
                    <option
                      key={option.title}
                      value={option.title}
                    >
                      {option.title}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Billing Cycle
              </label>

              <select
                name="billing"
                value={formData.billing}
                onChange={handleChange}
                disabled={
                  formData.plan ===
                    "Free" || loading
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F4400D] focus:border-[#F4400D] outline-none bg-white disabled:bg-gray-100 disabled:text-gray-500"
              >
                <option value="monthly">
                  Monthly
                </option>

                <option value="yearly">
                  Yearly
                </option>
              </select>
            </div>

            <div className="rounded-2xl bg-gray-50 border border-gray-200 p-5">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">
                  Plan
                </span>

                <span className="font-semibold">
                  {formData.plan}
                </span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-gray-600">
                  Billing
                </span>

                <span className="font-semibold capitalize">
                  {formData.plan ===
                  "Free"
                    ? "No payment"
                    : formData.billing}
                </span>
              </div>

              <div className="flex justify-between py-2 border-t mt-2 pt-3">
                <span className="text-gray-600">
                  Price
                </span>

                <span className="font-bold text-xl text-[#F4400D]">
                  {price}
                </span>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-sm text-gray-700">
              {formData.plan ===
              "Free"
                ? "Your free workspace will be created without payment."
                : "After completing onboarding, you will continue to secure payment for your selected plan."}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center py-10 px-4 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${bgImage})`,
      }}
    >
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 max-w-6xl mx-auto w-full">
        <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-8 items-start">
          {/* LEFT SIDE */}

          <div className="text-white lg:sticky lg:top-10">
            <p className="text-[#F4400D] text-4xl font-bold mb-2">
              FASTQUEUE SETUP
            </p>

            <h1 className="text-4xl md:text-4xl sm:text-xl font-bold mb-4">
              Set up your FastQueue
              workspace
            </h1>

            <p className="text-white/90 mb-8 max-w-xl">
              Configure your organization
              and queue, add your team, and
              choose a plan before entering
              your dashboard.
            </p>

            <div className="bg-white/95 text-gray-900 rounded-3xl p-5 shadow-xl">
              <div className="space-y-4">
                {STEPS.map((item) => {
                  const completed =
                    step > item.number;

                  const active =
                    step === item.number;

                  return (
                    <div
                      key={item.number}
                      className="flex items-center gap-3"
                    >
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold ${
                          completed
                            ? "bg-green-500 text-white"
                            : active
                            ? "bg-[#F4400D] text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {completed ? (
                          <Check
                            size={18}
                          />
                        ) : (
                          item.number
                        )}
                      </div>

                      <span
                        className={`font-medium ${
                          active
                            ? "text-[#F4400D]"
                            : "text-gray-600"
                        }`}
                      >
                        {item.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}

          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-6 md:p-8">
            <div className="flex items-center justify-between mb-7">
              <div>
                <p className="text-sm text-gray-500">
                  Step {step} of{" "}
                  {STEPS.length}
                </p>

                <h3 className="font-semibold text-gray-900">
                  {STEPS[step - 1].title}
                </h3>
              </div>

              <div className="text-sm font-medium text-gray-500">
                {Math.round(
                  (step / STEPS.length) *
                    100
                )}
                %
              </div>
            </div>

            <div className="w-full h-2 bg-gray-100 rounded-full mb-8 overflow-hidden">
              <div
                className="h-full bg-[#F4400D] transition-all duration-300"
                style={{
                  width: `${
                    (step /
                      STEPS.length) *
                    100
                  }%`,
                }}
              />
            </div>

            {error && (
              <div className="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {renderStep()}

            {/* NAVIGATION */}

            <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-100">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={previousStep}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-60"
                >
                  <ArrowLeft
                    size={18}
                  />
                  Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    navigate("/login")
                  }
                  disabled={loading}
                  className="text-sm font-medium text-gray-600 hover:text-[#F4400D]"
                >
                  Already have an account?
                  Login
                </button>
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={loading}
                  className="ml-auto flex items-center gap-2 px-6 py-3 bg-[#F4400D] text-white rounded-xl font-semibold hover:bg-[#d9380c] transition disabled:opacity-60"
                >
                  Continue
                  <ArrowRight
                    size={18}
                  />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinish}
                  disabled={loading}
                  className="ml-auto flex items-center gap-2 px-6 py-3 bg-[#F4400D] text-white rounded-xl font-semibold hover:bg-[#d9380c] transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Saving registration..."
                    : formData.plan ===
                      "Free"
                    ? "Complete Setup"
                    : "Continue to Payment"}

                  {!loading && (
                    <ArrowRight
                      size={18}
                    />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyRegistration;