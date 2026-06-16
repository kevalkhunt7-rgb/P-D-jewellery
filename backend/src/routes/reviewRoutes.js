import express from "express";

import {
  createReview,
  getProductReviews,
  deleteReview,
  getAllReviews,
} from "../controllers/reviewController.js";

import {
  protect,
  adminOnly,
} from "../middleware/authMiddleware.js";

import upload from "../middleware/multer.js";

const router = express.Router();



// Create Review
router.post(
  "/create",
  protect,
  upload.array("images", 3),
  createReview
);


// Get Product Reviews
router.get(
  "/product/:productId",
  getProductReviews
);


// Delete Review
router.delete(
  "/delete/:id",
  protect,
  deleteReview
);


// Admin All Reviews
router.get(
  "/all",
  protect,
  adminOnly,
  getAllReviews
);

export default router;