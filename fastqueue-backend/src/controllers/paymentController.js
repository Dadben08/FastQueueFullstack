import stripe from "../config/stripe.js";
import subscriptionPlans from "../config/subscriptionPlans.js";

// ==========================================
// CREATE STRIPE SUBSCRIPTION CHECKOUT
// ==========================================

export const createCheckoutSession = async (req, res) => {
  try {
    const { plan, billing } = req.body;

    // Validate plan
    if (
      !plan ||
      !["standard", "pro"].includes(plan)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid subscription plan",
      });
    }

    // Validate billing cycle
    if (
      !billing ||
      !["monthly", "yearly"].includes(billing)
    ) {
      return res.status(400).json({
        success: false,
        message: "Billing must be monthly or yearly",
      });
    }

    const selectedPlan = subscriptionPlans[plan];

    // Get amount
    const amount = selectedPlan[billing];

    // Determine recurring interval
    const interval =
      billing === "monthly" ? "month" : "year";

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],

      mode: "subscription",

      customer_email: req.user.email,

      line_items: [
        {
          price_data: {
            currency: "ngn",

            product_data: {
              name: `FastQueue ${selectedPlan.name}`,
              description: `FastQueue ${selectedPlan.name} ${billing} subscription`,
            },

            unit_amount: amount * 100,

            recurring: {
              interval,
            },
          },

          quantity: 1,
        },
      ],

      metadata: {
        userId: req.user._id.toString(),
        plan,
        billing,
      },

      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url: `${process.env.CLIENT_URL}/pricing`,
    });

    return res.status(200).json({
      success: true,
      message: "Stripe checkout session created",
      url: session.url,
    });

  } catch (error) {
    console.error("Stripe Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create payment session",
      error: error.message,
    });
  }
};