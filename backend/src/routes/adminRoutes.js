import express from "express";

import {
  getDashboardStats,
  getAllCustomers,
  getCustomerDetails,
  createAdminRequest,
  getAdminRequests,
  reviewAdminRequest,
  getAllAdmins,
  updateAdminRole,
  deleteAdmin,
  createAdmin,
} from "../controllers/adminController.js";

import {
  protect,
  adminOnly,
  superAdminOnly,
} from "../middleware/authMiddleware.js";

const router = express.Router();


// Dashboard Analytics
router.get(
  "/dashboard-stats",
  protect,
  adminOnly,
  getDashboardStats
);


// Customers
router.get(
  "/customers",
  protect,
  adminOnly,
  getAllCustomers
);


// Single Customer Details
router.get(
  "/customers/:id",
  protect,
  adminOnly,
  getCustomerDetails
);

// Admin Requests
router.post("/admin-requests", createAdminRequest); // Public endpoint
router.get("/admin-requests", protect, adminOnly, getAdminRequests);
router.put("/admin-requests/:id", protect, adminOnly, reviewAdminRequest);

// Admin Management (super admin only)
router.get("/admins", protect, superAdminOnly, getAllAdmins);
router.post("/admins", protect, superAdminOnly, createAdmin);
router.put("/admins/:id/role", protect, superAdminOnly, updateAdminRole);
router.delete("/admins/:id", protect, superAdminOnly, deleteAdmin);

export default router;