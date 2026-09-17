import Company from "../models/Company.js";

// ==========================================
// CREATE COMPANY
// ==========================================
export const createCompany = async (req, res, next) => {
  try {
    const {
      name,
      businessType,
      address,
      queueName,
      queuePrefix,
      services,
      openingTime,
      closingTime,
      dailyLimit,
      staff,
      plan,
      billingCycle,
      price,
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        message: "Company name is required.",
      });
    }

    // Check if this user already has a company
    const existingCompany = await Company.findOne({
      owner: req.user._id,
    });

    if (existingCompany) {
      return res.status(409).json({
        message: "You already have a registered company.",
        company: existingCompany,
      });
    }

    const company = await Company.create({
      name: name.trim(),
      owner: req.user._id,

      businessType: businessType || "",

      address: address?.trim() || "",

      queueName: queueName?.trim() || "Main Queue",

      queuePrefix: queuePrefix?.trim() || "A",

      services: Array.isArray(services) ? services : [],

      openingTime: openingTime || "08:00",

      closingTime: closingTime || "17:00",

      dailyLimit: Number(dailyLimit) || 50,

      staff: Array.isArray(staff) ? staff : [],

      plan: plan || "free",

      billingCycle: billingCycle || "monthly",

      price: price || "₦0",
    });

    return res.status(201).json({
      message: "Company registered successfully.",
      company,
    });
  } catch (error) {
    console.error("Create company error:", error);
    next(error);
  }
};


// ==========================================
// GET COMPANY FOR LOGGED-IN OWNER
// ==========================================
export const getCompany = async (req, res, next) => {
  try {
    const company = await Company.findOne({
      owner: req.user._id,
    });

    if (!company) {
      return res.status(404).json({
        message: "No company registered for this account.",
        hasCompany: false,
      });
    }

    return res.status(200).json({
      company,
      hasCompany: true,
    });
  } catch (error) {
    console.error("Get company error:", error);
    next(error);
  }
};


// ==========================================
// UPDATE COMPANY
// ==========================================
export const updateCompany = async (req, res, next) => {
  try {
    const company = await Company.findOneAndUpdate(
      { owner: req.user._id },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!company) {
      return res.status(404).json({
        message: "Company not found.",
      });
    }

    return res.status(200).json({
      message: "Company updated successfully.",
      company,
    });
  } catch (error) {
    console.error("Update company error:", error);
    next(error);
  }
};


// ==========================================
// GET ALL PUBLIC COMPANIES
// ==========================================
// Customers use this endpoint to find a
// company before joining its queue.
export const getPublicCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find({})
      .select(
        "_id name businessType address queueName queuePrefix services openingTime closingTime"
      )
      .sort({ name: 1 });

    return res.status(200).json({
      companies,
    });
  } catch (error) {
    console.error("Get public companies error:", error);
    next(error);
  }
};