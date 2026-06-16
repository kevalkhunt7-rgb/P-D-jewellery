import express from "express";

import {
  addToCart,
  getMyCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cartController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

const router = express.Router();



// Add To Cart
router.post(
  "/add",
  protect,
  addToCart
);


// Get Cart
router.get(
  "/my-cart",
  protect,
  getMyCart
);


// Update Quantity
router.put(
  "/update/:productId",
  protect,
  updateCartItem
);


// Remove Item
router.delete(
  "/remove/:productId",
  protect,
  removeCartItem
);


// Clear Cart
router.delete(
  "/clear",
  protect,
  clearCart
);

export default router;