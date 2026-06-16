import express from "express";

import {
  addToWishlist,
  getMyWishlist,
  removeFromWishlist,
  clearWishlist,
} from "../controllers/wishlistController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

const router = express.Router();



// Add To Wishlist
router.post(
  "/add",
  protect,
  addToWishlist
);


// Get Wishlist
router.get(
  "/my-wishlist",
  protect,
  getMyWishlist
);


// Remove Product
router.delete(
  "/remove/:productId",
  protect,
  removeFromWishlist
);


// Clear Wishlist
router.delete(
  "/clear",
  protect,
  clearWishlist
);

export default router;