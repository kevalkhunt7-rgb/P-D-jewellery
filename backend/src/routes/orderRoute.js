import express from "express";

import {
    initiateCheckout,
    confirmCheckout,
    cancelCheckout,
    getMyOrders,
    getSingleOrder,
    getAllOrders,
    updateOrderStatus,
    requestCancellation,
    getCancellationRequests,
    approveCancellation,
    rejectCancellation,
    syncRefundStatus,
    handleRazorpayWebhook,
    deleteCancellationRecord,
    adminCancelOrder,
    deleteOrder,
} from "../controllers/orderController.js";

import {
    protect,
    adminOnly,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// ================= USER ROUTES =================
router.post("/checkout/initiate", protect, initiateCheckout);
router.post("/checkout/confirm", protect, confirmCheckout);
router.post("/checkout/cancel", protect, cancelCheckout);
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
    adminCancelOrder
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

// Delete order record (Admin Only)
router.delete(
  "/delete/:id",
  protect,
  adminOnly,
  deleteOrder
);

export default router;