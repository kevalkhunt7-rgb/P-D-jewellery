import express from "express";

import {
    createOrder,
    getMyOrders,
    getSingleOrder,
    getAllOrders,
    updateOrderStatus,
    cancelOrder,
    createRazorpayOrder,
} from "../controllers/orderController.js";

import {
    protect,
    adminOnly,
} from "../middleware/authMiddleware.js";

const router = express.Router();



// User Routes
router.post("/create", protect, createOrder);
router.post("/razorpay", protect, createRazorpayOrder);

router.get("/my-orders", protect, getMyOrders);

router.get("/single/:id", protect, getSingleOrder);



// Admin Routes
router.get(
    "/all-orders",
    protect,
    adminOnly,
    getAllOrders
);

router.put(
    "/update-status/:id",
    protect,
    adminOnly,
    updateOrderStatus
);

router.put(
    "/cancel/:id",
    protect,
    adminOnly,
    cancelOrder
);

export default router;