import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    customerPhone: {
      type: String,
      default: "",
      trim: true,
    },

    customerEmail: {
      type: String,
      default: "",
      trim: true,
    },

    sex: {
      type: String,
      default: "",
    },

    service: {
      type: String,
      required: true,
      trim: true,
    },

    ticketNumber: {
      type: String,
      required: true,
    },

    position: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "waiting",
        "serving",
        "completed",
        "skipped",
      ],
      default: "waiting",
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },

    calledAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Ticket", ticketSchema);