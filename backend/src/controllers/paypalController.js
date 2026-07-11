import axios from "axios";
import crypto from "crypto";
import Order from "../model/orderModel.js";
import Product from "../model/productModel.js";
import Cart from "../model/cartModel.js";
import paypalClient from "../config/paypal.js";
import paypal from "@paypal/checkout-server-sdk";
import { sendOrderConfirmationEmail } from "../services/emailService.js";

/**
 * Generates a PayPal access token using OAuth2 client credentials.
 * Utilizes Sandbox or Live URL based on environment configuration.
 * 
 * @returns {Promise<string>} The access token.
 */
const getPaypalAccessToken = async () => {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET in environment variables.");
  }

  // Base64 encode clientId:clientSecret for Basic Auth
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const baseUrl = process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

  try {
    const response = await axios.post(
      `${baseUrl}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${credentials}`,
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error("PayPal OAuth2 Error:", error.response?.data || error.message);
    throw new Error(`Failed to generate PayPal access token: ${error.response?.data?.error_description || error.message}`);
  }
};

/**
 * Verifies the PayPal Webhook signature using PayPal's verification API endpoint.
 * 
 * @param {Object} req - Express request object.
 * @param {string} webhookId - Configured PayPal Webhook ID.
 * @param {string} accessToken - Active PayPal access token.
 * @param {string} baseUrl - PayPal API base URL.
 * @returns {Promise<boolean>} True if signature is valid, false otherwise.
 */
const verifyPaypalSignature = async (req, webhookId, accessToken, baseUrl) => {
  try {
    const authAlgo = req.headers["paypal-auth-algo"];
    const certUrl = req.headers["paypal-cert-url"];
    const transmissionId = req.headers["paypal-transmission-id"];
    const transmissionSig = req.headers["paypal-transmission-sig"];
    const transmissionTime = req.headers["paypal-transmission-time"];

    // Return early if any of the verification headers are missing
    if (!authAlgo || !certUrl || !transmissionId || !transmissionSig || !transmissionTime) {
      console.warn("[PayPal Webhook Verification] Missing signature headers. Request rejected.");
      return false;
    }

    if (!webhookId) {
      console.warn("[PayPal Webhook Verification] Webhook ID not configured. Cannot verify webhook signature.");
      return false;
    }

    const verificationPayload = {
      auth_algo: authAlgo,
      cert_url: certUrl,
      transmission_id: transmissionId,
      transmission_sig: transmissionSig,
      transmission_time: transmissionTime,
      webhook_id: webhookId,
      webhook_event: req.body,
    };

    const response = await axios.post(
      `${baseUrl}/v1/notifications/verify-webhook-signature`,
      verificationPayload,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
      }
    );

    return response.data?.verification_status === "SUCCESS";
  } catch (error) {
    console.error("[PayPal Webhook Verification Failed]:", error.response?.data || error.message);
    return false;
  }
};

/**
 * Helper function to perform a PayPal capture refund.
 * Can be called from routes directly, or internally from order flows.
 * 
 * @param {string} captureId - The PayPal capture ID.
 * @param {number|string} [amount] - Optional refund amount.
 * @param {string} [currencyCode] - Optional currency code.
 * @returns {Promise<Object>} The refund response data.
 */
export const refundPaypalCapture = async (captureId, amount, currencyCode) => {
  if (!captureId) {
    throw new Error("Missing captureId for PayPal refund.");
  }

  // Retrieve PayPal API access token
  const accessToken = await getPaypalAccessToken();

  const baseUrl = process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

  // Generate a unique request ID to satisfy idempotency requirements
  const paypalRequestId = crypto.randomUUID ? crypto.randomUUID() : `refund_${captureId}_${Date.now()}`;

  // Structure the payload for the refund endpoint.
  // If amount and currency are provided, we do a partial/explicit refund. Otherwise, PayPal performs a full refund.
  const payload = {};
  if (amount && currencyCode) {
    payload.amount = {
      value: Number(amount).toFixed(2),
      currency_code: currencyCode,
    };
  }

  console.log(`[PayPal Refund Helper] Requesting refund for capture ID: ${captureId}, Amount: ${amount || "Full"}, Currency: ${currencyCode || "Default"}`);

  const response = await axios.post(
    `${baseUrl}/v2/payments/captures/${captureId}/refund`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        "PayPal-Request-Id": paypalRequestId,
      },
    }
  );

  return response.data;
};

/**
 * Helper function to retrieve the details/status of a PayPal refund.
 * 
 * @param {string} refundId - The PayPal refund ID.
 * @returns {Promise<Object>} The refund resource data from PayPal.
 */
export const getPaypalRefundStatus = async (refundId) => {
  if (!refundId) {
    throw new Error("Missing refundId for PayPal status check.");
  }

  const accessToken = await getPaypalAccessToken();

  const baseUrl = process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

  console.log(`[PayPal Refund Status Check Helper] Fetching details for Refund ID: ${refundId}`);

  const response = await axios.get(
    `${baseUrl}/v2/payments/refunds/${refundId}`,
    {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
};


// =========================================================================
// 1. BACKEND CONTROLLER FUNCTION (paypalRefund)
// =========================================================================
export const paypalRefund = async (req, res) => {
  try {
    const { captureId, amount, currencyCode } = req.body;

    // Validate request inputs
    if (!captureId) {
      return res.status(400).json({
        success: false,
        message: "Missing 'captureId' in request body.",
      });
    }

    if (amount && (isNaN(Number(amount)) || Number(amount) <= 0)) {
      return res.status(400).json({
        success: false,
        message: "If provided, 'amount' must be a valid positive number.",
      });
    }

    const data = await refundPaypalCapture(captureId, amount, currencyCode);

    console.log(`[PayPal Refund Success] Refund processed. Refund ID: ${data.id}`);

    // Return the response safely without updating database directly yet
    return res.status(200).json({
      success: true,
      message: "PayPal refund processed successfully.",
      data,
    });
  } catch (error) {
    console.error("[PayPal Refund Exception]:", error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || error.message || "Failed to process PayPal refund.",
      details: error.response?.data || null,
    });
  }
};


// =========================================================================
// 2. EXPRESS WEBHOOK ROUTE LISTENER (handlePaypalWebhook)
// =========================================================================
export const handlePaypalWebhook = async (req, res) => {
  // Immediately acknowledge receipt to PayPal with a 200 status code
  res.status(200).json({
    success: true,
    message: "Webhook event received successfully.",
  });

  // Perform processing asynchronously to avoid webhook timeouts
  try {
    const event = req.body;
    if (!event || !event.event_type) {
      console.warn("[PayPal Webhook Warning] Webhook received with empty or invalid payload.");
      return;
    }

    console.log(`[PayPal Webhook Info] Processing Event: ${event.event_type}, ID: ${event.id}`);

    // Retrieve credentials and token for signature verification
    const accessToken = await getPaypalAccessToken();
    const webhookId = process.env.PAYPAL_WEBHOOK_ID || "YOUR_PAYPAL_WEBHOOK_ID";
    const baseUrl = process.env.PAYPAL_MODE === "live"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

    // Perform robust signature verification
    const isSignatureValid = await verifyPaypalSignature(req, webhookId, accessToken, baseUrl);
    if (!isSignatureValid) {
      console.warn(`[PayPal Webhook Warning] Invalid signature for event ID: ${event.id}. Processing aborted.`);
      return;
    }

    console.log(`[PayPal Webhook Info] Signature verified successfully for event ID: ${event.id}`);

    // Listen for the PAYMENT.CAPTURE.REFUNDED event type
    if (event.event_type === "PAYMENT.CAPTURE.REFUNDED") {
      const resource = event.resource;

      // Extract original capture ID and refund status
      // In a refund payload:
      // - resource.amount.capture_id is the original capture transaction ID.
      // - resource.id is the ID of this specific refund resource.
      const captureId = resource.amount?.capture_id || resource.id;
      const status = resource.status; // e.g., 'COMPLETED', 'PENDING', 'FAILED'

      console.log(`[PayPal Webhook Process] Event PAYMENT.CAPTURE.REFUNDED for Capture ID: ${captureId}, Status: ${status}`);

      try {
        // Find the order paid via this Capture ID.
        const order = await Order.findOne({
          $or: [
            { "paymentInfo.id": captureId },
            { "paymentInfo.paypalOrderId": captureId }
          ]
        });

        if (order) {
          if (status === "COMPLETED" && order.orderStatus !== "CANCELLED") {
            order.refundStatus = "Completed";
            order.orderStatus = "CANCELLED";
            order.refundCompletedAt = new Date();
            order.refundId = resource.id; // Store PayPal's refund ID

            // Restock items if they were tracked
            if (order.inventoryTracked !== false) {
              for (const item of order.orderItems) {
                await Product.findByIdAndUpdate(item.product, {
                  $inc: { stock: item.quantity },
                });
              }
            }
            // Decrement totalSales since this order was paid
            for (const item of order.orderItems) {
              await Product.findByIdAndUpdate(item.product, {
                $inc: { totalSales: -item.quantity },
              });
            }
            await order.save();
            console.log(`[Database Sync Success] Order ID ${order._id} successfully updated to 'CANCELLED' & restocked via Webhook.`);
          } else {
            order.refundStatus = status === "PENDING" ? "Processing" : status === "FAILED" ? "Failed" : order.refundStatus;
            if (status === "FAILED") {
              order.refundFailureReason = resource.status_details?.reason || "PayPal refund failed.";
            }
            await order.save();
          }
        } else {
          console.warn(`[Database Sync Warning] No order found in database matching capture ID: ${captureId}`);
        }
      } catch (dbError) {
        console.error("[Database Sync Error] Failed to update database query:", dbError);
      }

    } else if (event.event_type === "CHECKOUT.ORDER.APPROVED") {
      const paypalOrderId = event.resource.id;
      console.log(`[PayPal Webhook Process] Event CHECKOUT.ORDER.APPROVED for PayPal Order ID: ${paypalOrderId}`);

      try {
        const order = await Order.findOne({ paypalGatewayOrderId: paypalOrderId, orderStatus: "PENDING" });
        if (order) {
          // Capture order securely
          const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
          request.requestBody({});
          const response = await paypalClient.execute(request);

          if (response.result.status === "COMPLETED") {
            const captureId = response.result.purchase_units[0].payments.captures[0].id;
            order.paymentInfo = {
              id: captureId,
              status: "COMPLETED",
              paypalOrderId,
            };
            order.isPaid = true;
            order.paidAt = Date.now();
            order.orderStatus = "CONFIRMED";
            order.expiresAt = undefined;
            await order.save();

            // Increment product total sales since payment is successful
            for (const item of order.orderItems) {
              await Product.findByIdAndUpdate(
                item.product,
                { $inc: { totalSales: item.quantity } }
              );
            }

            // Clear Cart
            const cart = await Cart.findOne({ user: order.user });
            if (cart) {
              cart.cartItems = [];
              cart.totalItems = 0;
              cart.totalPrice = 0;
              await cart.save();
            }

            console.log(`[PayPal Webhook Capture Success] Order ID ${order._id} captured & confirmed via Webhook.`);
            sendOrderConfirmationEmail(order);
          } else {
            console.warn(`[PayPal Webhook Capture Warning] Capture status is ${response.result.status}, expected COMPLETED`);
          }
        }
      } catch (captureErr) {
        console.error("[PayPal Webhook Capture Exception]:", captureErr.message);
      }
    } else {
      console.log(`[PayPal Webhook Info] Ignored event type: ${event.event_type}`);
    }
  } catch (error) {
    console.error("[PayPal Webhook Processing Exception]:", error.message);
  }
};
