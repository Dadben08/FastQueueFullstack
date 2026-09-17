import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Phone,
  Lock,
  User,
  ArrowRight,
} from "lucide-react";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import axiosInstance from "../config/axiosinstance.js";

const Signup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate fields
    if (
      !form.fullName.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError("Please complete all fields.");
      return;
    }

    // Validate password
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    // Confirm password
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await axiosInstance.post("/auth/register", {
        name: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
      });

      console.log("Signup response:", response.data);

      /*
       * Save JWT token
       *
       * This must match the key used by axiosInstance
       * and CompanyRegistration.
       */
      if (response.data?.token) {
        localStorage.setItem(
          "fastqueue_token",
          response.data.token
        );
      } else {
        // If your backend does not return a token,
        // the user must login before continuing.
        toast.success(
          "Account created successfully! Please login to continue.",
          {
            position: "top-right",
            autoClose: 1800,
          }
        );

        setTimeout(() => {
          navigate("/login");
        }, 1800);

        return;
      }

      // Save user information
      if (response.data?.user) {
        localStorage.setItem(
          "userData",
          JSON.stringify(response.data.user)
        );
      }

      toast.success(
        "Account created successfully! Let's set up your company.",
        {
          position: "top-right",
          autoClose: 1200,
        }
      );

      /*
       * Go directly to company registration.
       */
      setTimeout(() => {
        navigate("/company-registration");
      }, 1200);

    } catch (err) {
      console.error("Signup error:", err);

      const message =
        err.response?.data?.message ||
        "Unable to create account. Please try again.";

      setError(message);

      toast.error(message, {
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  const input = (
    Icon,
    label,
    name,
    type,
    placeholder
  ) => (
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
          value={form[name]}
          onChange={handleChange}
          required
          disabled={loading}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 border rounded-xl
          focus:ring-2 focus:ring-[#F4400D]
          focus:border-[#F4400D]
          outline-none
          disabled:bg-gray-100"
        />
      </div>
    </div>
  );

  return (
    <>
      <ToastContainer />

      <div className="relative min-h-screen flex items-center py-10 px-4 bg-black/50">

        <div className="relative z-10 max-w-5xl mx-auto w-full grid lg:grid-cols-2 gap-8 items-center">

          {/* LEFT */}
          <div className="text-white">

            <p className="text-[#F4400D] text-4xl font-bold mb-2">
              FASTQUEUE
            </p>

            <h1 className="text-4xl font-bold mb-4">
              Create your company account
            </h1>

            <p className="text-white/90 max-w-xl">
              Create your FastQueue account first.
              After signup, you will set up your company,
              configure your queue, add your team and
              select a plan.
            </p>

          </div>

          {/* RIGHT */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-6 md:p-8 space-y-5"
          >

            <div>
              <p className="text-sm text-gray-500">
                Step 1 of 2
              </p>

              <h2 className="text-2xl font-bold text-gray-900">
                Create your account
              </h2>

              <p className="text-gray-500 mt-1">
                Create your account to continue with FastQueue.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {input(
              User,
              "Full Name",
              "fullName",
              "text",
              "Enter your full name"
            )}

            {input(
              Mail,
              "Email",
              "email",
              "email",
              "you@example.com"
            )}

            {input(
              Phone,
              "Phone",
              "phone",
              "tel",
              "+234 xxx xxx xxxx"
            )}

            <div className="grid md:grid-cols-2 gap-4">

              {input(
                Lock,
                "Password",
                "password",
                "password",
                "Create a password"
              )}

              {input(
                Lock,
                "Confirm Password",
                "confirmPassword",
                "password",
                "Confirm password"
              )}

            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full flex justify-center items-center gap-2 px-6 py-3 bg-[#F4400D] text-white rounded-xl font-semibold hover:bg-[#d9380c] transition disabled:opacity-60"
            >
              {loading
                ? "Creating Account..."
                : "Create Account"}

              {!loading && <ArrowRight size={18} />}
            </button>

            <p className="text-center text-sm text-gray-500">
              Already have a FastQueue account?{" "}

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="font-semibold text-[#2f2a76] hover:text-[#f4400d]"
              >
                Login
              </button>
            </p>

          </form>

        </div>
      </div>
    </>
  );
};

export default Signup;