import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import paymentService from "../services/paymentService";
const PaymentPage = () => {
  const location = useLocation();

  const [billing, setBilling] = useState(
    location.state?.billing || "monthly"
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get plan from Pricing page
  const plan = location.state?.plan || "Standard";

  const prices = {
    monthly: {
      Free: 0,
      Standard: 10000,
      Pro: 25000,
    },

    yearly: {
      Free: 0,
      Standard: 100000,
      Pro: 250000,
    },
  };

  const price = prices[billing][plan];

  // ==========================================
  // STRIPE PAYMENT
  // ==========================================

  const handlePayment = async () => {
  try {
    setLoading(true);
    setError("");

    // Convert Standard → standard
    // Convert Pro → pro
    const selectedPlan = plan.toLowerCase();

    const data =
      await paymentService.createCheckoutSession(
        selectedPlan,
        billing
      );

    // Redirect to Stripe Checkout
    window.location.href = data.url;

  } catch (error) {
    console.error(
      "Payment Error:",
      error.response?.data || error.message
    );

    setError(
      error.response?.data?.message ||
        "Unable to start payment. Please try again."
    );

  } finally {
    setLoading(false);
  }
};

  return (
    <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
  <h2 className="text-2xl font-semibold text-gray-900 mb-3">
    Secure payment
  </h2>

  <p className="text-gray-500 mb-8">
    You will be redirected to Stripe's secure checkout page to
    complete your subscription.
  </p>

  {/* Billing Toggle */}

  {plan !== "Free" && (
    <div className="mb-8">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Billing cycle
      </label>

      <div className="inline-flex rounded-xl border border-gray-200 p-1 bg-gray-50">
        <button
          type="button"
          onClick={() => setBilling("monthly")}
          className={
            billing === "monthly"
              ? "px-5 py-2 rounded-lg bg-[#F4400D] text-white font-medium"
              : "px-5 py-2 rounded-lg text-gray-600"
          }
        >
          Monthly
        </button>

        <button
          type="button"
          onClick={() => setBilling("yearly")}
          className={
            billing === "yearly"
              ? "px-5 py-2 rounded-lg bg-[#F4400D] text-white font-medium"
              : "px-5 py-2 rounded-lg text-gray-600"
          }
        >
          Yearly
        </button>
      </div>
    </div>
  )}

  {/* Error */}

  {error && (
    <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl">
      {error}
    </div>
  )}

  {/* Stripe Payment Button */}

  <button
    type="button"
    onClick={handlePayment}
    disabled={loading}
    className="w-full bg-[#F4400D] hover:bg-[#d93608] disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold transition flex items-center justify-center gap-2"
  >
    {loading ? (
      <>
        <Loader2 className="w-5 h-5 animate-spin" />
        Redirecting to Stripe...
      </>
    ) : (
      `Continue to Payment ₦${price.toLocaleString()}`
    )}
  </button>

  <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-5">
    <ShieldCheck className="w-5 h-5 text-green-600" />
    Secure payment powered by Stripe
  </div>
</div>
  );
};

export default PaymentPage;