import api from "./api.js";

const paymentService = {
  // Create Stripe Checkout Session
  createCheckoutSession: async (plan, billing) => {
    const response = await api.post(
      "/payment/create-checkout-session",
      {
        plan,
        billing,
      }
    );

    return response.data;
  },
};

export default paymentService;