import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import queueRoutes from "./routes/queueRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";

import notFound from "./middleware/notFound.js";
import errorMiddleware from "./middleware/errorMiddleware.js";

const app = express();

connectDB();

app.use(helmet());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://fast-queue-fullstack-mzp8.vercel.app",
    ],
    credentials: true,
  })
);

// ==========================================
// STRIPE WEBHOOK
// MUST COME BEFORE express.json()
// ==========================================

app.use("/api/webhook", webhookRoutes);

// ==========================================
// NORMAL MIDDLEWARE
// ==========================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// ==========================================
// ROUTES
// ==========================================

app.use("/api/payment", paymentRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "FastQueue API is running.",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/queue", queueRoutes);
app.use("/api/contact", contactRoutes);

// ==========================================
// ERROR HANDLING
// ==========================================

app.use(notFound);
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`FastQueue server running on port ${PORT}`);
});