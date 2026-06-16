import express from "express";

import {
  getDashboardStats,
  getAllCustomers,
  getCustomerDetails,
} from "../controllers/adminController.js";

import {
  protect,
  adminOnly,
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

export default router;