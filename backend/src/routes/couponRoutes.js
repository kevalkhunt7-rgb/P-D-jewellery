import express from "express";

import {
  createCoupon,
  applyCoupon,
  getAllCoupons,
  deleteCoupon,
  updateCoupon,
} from "../controllers/couponController.js";

import {
  protect,
  adminOnly,
} from "../middleware/authMiddleware.js";

const router = express.Router();



// Admin Create Coupon
router.post(
  "/create",
  protect,
  adminOnly,
  createCoupon
);


// Apply Coupon
router.post(
  "/apply",
  protect,
 applyCoupon
);


// Get All Coupons
router.get(
  "/all",
  protect,
  adminOnly,
  getAllCoupons
);


// Delete Coupon
router.delete(
  "/delete/:id",
  protect,
  adminOnly,
  deleteCoupon
);

// Update Coupon
router.put(
  "/update/:id",
  protect,
  adminOnly,
  updateCoupon
);

export default router;