import express from "express";
import { paypalRefund, handlePaypalWebhook } from "../controllers/paypalController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// NOTE: Legacy client-facing payment creation/capture routes ("/create-order", "/paypal/create-order", "/paypal/capture-order")
// have been removed. Gateway orders are now securely created and captured server-side inside
// the two-phase checkout endpoints (initiateCheckout and confirmCheckout) to prevent price/amount tampering.

// =======================
// PayPal Refund (Admin Only)
// =======================
router.post("/paypal/refund", protect, adminOnly, paypalRefund);

// =======================
// PayPal Webhook
// =======================
router.post("/paypal/webhook", handlePaypalWebhook);

export default router;