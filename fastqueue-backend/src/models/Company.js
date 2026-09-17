import mongoose from "mongoose";

const staffSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    role: {
      type: String,
      enum: ["staff", "admin"],
      default: "staff",
    },
  },
  { _id: true }
);

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    businessType: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    queueName: {
      type: String,
      default: "Main Queue",
    },

    queuePrefix: {
      type: String,
      default: "A",
    },

    services: {
      type: [String],
      default: [],
    },

    openingTime: {
      type: String,
      default: "08:00",
    },

    closingTime: {
      type: String,
      default: "17:00",
    },

    dailyLimit: {
      type: Number,
      default: 50,
    },

    staff: {
      type: [staffSchema],
      default: [],
    },

    // =========================
    // SUBSCRIPTION DETAILS
    // =========================

    plan: {
      type: String,
      enum: ["free", "standard", "pro"],
      default: "free",
    },

    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly",
    },

    price: {
      type: String,
      default: "₦0",
    },

    // =========================
    // STRIPE DETAILS
    // =========================

    subscriptionStatus: {
      type: String,
      enum: ["active", "cancelled", "past_due", "inactive"],
      default: "inactive",
    },

    stripeCustomerId: {
      type: String,
      default: "",
    },

    stripeSubscriptionId: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Company = mongoose.model("Company", companySchema);

export default Company;