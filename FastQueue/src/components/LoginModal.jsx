import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  X,
} from "lucide-react";

import axiosInstance from "../config/axiosinstance.js";

const LoginModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { id, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [id]: value,
    }));

    setError("");
  };

  // ==========================================
  // NORMAL EMAIL/PASSWORD LOGIN
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email.trim() || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await axiosInstance.post(
        "/auth/login",
        {
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }
      );

      console.log("Login response:", response.data);

      const token = response.data.token;

      if (!token) {
        throw new Error("Login token was not returned.");
      }

      localStorage.setItem(
        "fastqueue_token",
        token
      );

      if (response.data.user) {
        localStorage.setItem(
          "userData",
          JSON.stringify(response.data.user)
        );
      }

      // Check company
      const companyResponse =
        await axiosInstance.get("/company");

      console.log(
        "Company response:",
        companyResponse.data
      );

      onClose();

      if (companyResponse.data.hasCompany) {
        navigate("/dashboard");
      } else {
        navigate("/company-registration");
      }

    } catch (err) {
      console.error("Login error:", err);

      if (err.response?.status === 401) {
        setError("Invalid email or password.");
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to log in. Please try again."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // GOOGLE LOGIN
  // ==========================================

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setError("");

      console.log("Google credential received.");

      if (!credentialResponse?.credential) {
        throw new Error(
          "Google credential was not received."
        );
      }

      const response = await axiosInstance.post(
        "/auth/google",
        {
          credential: credentialResponse.credential,
        }
      );

      console.log(
        "Google login response:",
        response.data
      );

      const token = response.data.token;

      if (!token) {
        throw new Error(
          "Login token was not returned."
        );
      }

      // Save FastQueue JWT
      localStorage.setItem(
        "fastqueue_token",
        token
      );

      // Save user information
      if (response.data.user) {
        localStorage.setItem(
          "userData",
          JSON.stringify(response.data.user)
        );
      }

      onClose();

      // Redirect based on company status
      if (response.data.hasCompany) {
        navigate("/dashboard");
      } else {
        navigate("/company-registration");
      }

    } catch (err) {
      console.error(
        "Google login error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to sign in with Google. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError(
      "Google login failed. Please try again."
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-7 md:p-8 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
      >

        {/* CLOSE BUTTON */}

        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed"
          aria-label="Close login"
        >
          <X size={21} />
        </button>


        {/* HEADER */}

        <div className="mb-7 text-center">

          <h2
            id="login-title"
            className="mb-2 text-3xl font-bold text-[#2f2a76]"
          >
            Welcome Back
          </h2>

          <p className="text-sm text-gray-600">
            Log in to manage your FastQueue workspace.
          </p>

        </div>


        {/* ERROR */}

        {error && (
          <div
            className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {error}
          </div>
        )}


        {/* GOOGLE LOGIN */}

        <div className="mb-5 flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            text="continue_with"
            shape="rectangular"
            width="100%"
          />
        </div>


        {/* DIVIDER */}

        <div className="mb-5 flex items-center gap-3">

          <div className="h-px flex-1 bg-gray-200" />

          <span className="text-xs uppercase text-gray-400">
            or
          </span>

          <div className="h-px flex-1 bg-gray-200" />

        </div>


        {/* LOGIN FORM */}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* EMAIL */}

          <div>

            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>

            <div className="relative">

              <Mail
                size={19}
                className="absolute left-3 top-3.5 text-gray-400"
              />

              <input
                type="email"
                id="email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
                disabled={loading}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 outline-none transition focus:border-[#f4400d] focus:ring-2 focus:ring-[#f4400d]/20 disabled:cursor-not-allowed disabled:bg-gray-100"
              />

            </div>

          </div>


          {/* PASSWORD */}

          <div>

            <div className="mb-2 flex items-center justify-between">

              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>

              <Link
                to="/forgot-password"
                onClick={onClose}
                className="text-sm font-medium text-[#2f2a76] transition hover:text-[#f4400d]"
              >
                Forgot password?
              </Link>

            </div>

            <div className="relative">

              <Lock
                size={19}
                className="absolute left-3 top-3.5 text-gray-400"
              />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                id="password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
                disabled={loading}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-12 outline-none transition focus:border-[#f4400d] focus:ring-2 focus:ring-[#f4400d]/20 disabled:cursor-not-allowed disabled:bg-gray-100"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (prev) => !prev
                  )
                }
                disabled={loading}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-700"
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>

            </div>

          </div>


          {/* REMEMBER ME */}

          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">

            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) =>
                setRememberMe(
                  e.target.checked
                )
              }
              disabled={loading}
              className="h-4 w-4 accent-[#f4400d]"
            />

            Remember me

          </label>


          {/* LOGIN BUTTON */}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#f4400d] py-3 font-semibold text-white transition hover:bg-[#d9380c] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Logging in..."
              : "Log In"}
          </button>

        </form>


        {/* SIGNUP */}

        <div className="mt-7 text-center text-sm text-gray-500">

          Don't have a FastQueue account?{" "}

          <Link
            to="/signup"
            onClick={onClose}
            className="font-semibold text-[#2f2a76] transition hover:text-[#f4400d]"
          >
            Sign Up
          </Link>

        </div>

      </div>

    </div>
  );
};

export default LoginModal;