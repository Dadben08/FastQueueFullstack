import stripe from "../config/stripe.js";
import Company from "../models/Company.js";

// ==========================================
// STRIPE WEBHOOK
// ==========================================

export const stripeWebhook = async (req, res) => {
  const signature = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error(
      "Webhook signature verification failed:",
      error.message
    );

    return res.status(400).send(
      `Webhook Error: ${error.message}`
    );
  }

  try {
    // ==========================================
    // PAYMENT SUCCESSFUL
    // ==========================================

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const userId = session.metadata.userId;
      const plan = session.metadata.plan;
      const billing = session.metadata.billing;

      // Find user's company
      const company = await Company.findOne({
        owner: userId,
      });

      if (company) {
        // Your model uses "plan", NOT subscriptionPlan
        company.plan = plan;
        company.billingCycle = billing;

        // Update price
        if (plan === "standard") {
          company.price =
            billing === "monthly"
              ? "₦10,000"
              : "₦100,000";
        }

        if (plan === "pro") {
          company.price =
            billing === "monthly"
              ? "₦25,000"
              : "₦250,000";
        }

        // Stripe details
        company.stripeCustomerId = session.customer || "";

        company.stripeSubscriptionId =
          session.subscription || "";

        company.subscriptionStatus = "active";

        await company.save();

        console.log(
          `Company upgraded to ${plan} plan (${billing})`
        );
      }
    }

    // ==========================================
    // SUBSCRIPTION CANCELLED
    // ==========================================

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;

      await Company.findOneAndUpdate(
        {
          stripeSubscriptionId: subscription.id,
        },
        {
          plan: "free",
          price: "₦0",
          subscriptionStatus: "cancelled",
        }
      );

      console.log("Subscription cancelled");
    }

    // ==========================================
    // PAYMENT FAILED
    // ==========================================

    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object;

      await Company.findOneAndUpdate(
        {
          stripeCustomerId: invoice.customer,
        },
        {
          subscriptionStatus: "past_due",
        }
      );

      console.log("Subscription payment failed");
    }

    // ==========================================
    // PAYMENT SUCCESSFUL (RENEWAL)
    // ==========================================

    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object;

      await Company.findOneAndUpdate(
        {
          stripeCustomerId: invoice.customer,
        },
        {
          subscriptionStatus: "active",
        }
      );

      console.log("Subscription payment successful");
    }

    return res.status(200).json({
      received: true,
    });

  } catch (error) {
    console.error(
      "Webhook processing error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Webhook processing failed",
    });
  }
};