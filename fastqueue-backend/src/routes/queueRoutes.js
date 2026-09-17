import express from "express";

import protect from "../middleware/authMiddleware.js";

import {
  joinQueue,
  getTodayQueue,
  getQueueStats,
  callNextCustomer,
  completeCustomer,
  skipCustomer,
    getTicketStatus,
sendTicketEmail,
} from "../controllers/queueController.js";

const router = express.Router();

// ==========================================
// PUBLIC ROUTE
// Customers can join a queue without logging in
// ==========================================
router.post("/join", joinQueue);


// ==========================================
// PROTECTED COMPANY/STAFF ROUTES
// ==========================================

// Get today's queue
router.get("/today", protect, getTodayQueue);

// Get queue statistics
router.get("/stats", protect, getQueueStats);

// Call next customer
router.put("/next", protect, callNextCustomer);

// Complete customer
router.put("/:id/complete", protect, completeCustomer);

// Skip customer
router.put("/:id/skip", protect, skipCustomer);

// Get ticket status
router.get("/ticket/:id", getTicketStatus);

// ==========================================
// SEND TICKET BY EMAIL
// POST /api/queue/send-ticket
// PUBLIC
// ==========================================
router.post("/send-ticket", sendTicketEmail);
export default router;