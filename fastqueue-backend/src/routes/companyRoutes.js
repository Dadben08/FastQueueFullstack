import express from "express";

import {
  createCompany,
  getCompany,
  updateCompany,
  getPublicCompanies,
} from "../controllers/companyController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// ==========================================
// PUBLIC ROUTE
// Customers can search for companies
// without logging in
// ==========================================
router.get("/public", getPublicCompanies);


// ==========================================
// PROTECTED ROUTES
// ==========================================

// Create company
router.post("/", protect, createCompany);

// Get logged-in user's company
router.get("/", protect, getCompany);

// Update logged-in user's company
router.put("/", protect, updateCompany);

export default router;