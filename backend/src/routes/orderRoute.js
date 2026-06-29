import express from "express";

import {
    createOrder,
    getMyOrders,
    getSingleOrder,
    getAllOrders,
    updateOrderStatus,
    createRazorpayOrder,
    requestCancellation,
    getCancellationRequests,
    approveCancellation,
    rejectCancellation,
    syncRefundStatus,
    handleRazorpayWebhook,
    deleteCancellationRecord,
} from "../controllers/orderController.js";

import {
    protect,
    adminOnly,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// ================= USER ROUTES =================
router.post("/create", protect, createOrder);
router.post("/checkout", protect, createOrder);
router.post("/razorpay", protect, createRazorpayOrder);
router.get("/my-orders", protect, getMyOrders);
router.get("/single/:id", protect, getSingleOrder);

// Customer Cancellation Request
router.post("/:id/request-cancellation", protect, requestCancellation);


// ================= ADMIN ROUTES =================
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

// Unified/Legacy cancel route pointing to your actual approval logic
router.put(
    "/cancel/:id",
    protect,
    adminOnly,
    approveCancellation
);

// Admin Cancellation & Refund Management
router.get(
  "/admin/cancellation-requests",
  protect,
  adminOnly,
  getCancellationRequests
);

router.put(
  "/admin/:id/approve-cancellation",
  protect,
  adminOnly,
  approveCancellation
);

router.put(
  "/admin/:id/reject-cancellation",
  protect,
  adminOnly,
  rejectCancellation
);

router.get(
  "/admin/refund-status/:orderId",
  protect,
  adminOnly,
  syncRefundStatus
);

router.delete(
  "/admin/cancellation-record/:orderId",
  protect,
  adminOnly,
  deleteCancellationRecord
);

// Razorpay Webhook
router.post(
  "/webhook",
  handleRazorpayWebhook
);

export default router;