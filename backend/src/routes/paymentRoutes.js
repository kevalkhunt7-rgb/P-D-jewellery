import express from "express";
import razorpay from "../config/razorpay.js";
import paypalClient from "../config/paypal.js";
import paypal from "@paypal/checkout-server-sdk";
import { getCurrencyContext } from "../utils/currencyHelper.js";

const router = express.Router();

// =======================
// Razorpay Order
// =======================
router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    const context = await getCurrencyContext(req);

    const amountINR =
      context.currency === "USD"
        ? amount * context.conversionRate
        : amount;

    const order = await razorpay.orders.create({
      amount: Math.round(amountINR * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    res.json({
      success: true,
      order,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// =======================
// PayPal Create Order
// =======================
router.post("/paypal/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    const request = new paypal.orders.OrdersCreateRequest();

    request.prefer("return=representation");

    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: Number(amount).toFixed(2),
          },
        },
      ],
    });

    const response = await paypalClient.execute(request);

    res.json({
      success: true,
      orderID: response.result.id,
    });
  } catch (err) {
    console.error("=========== PAYPAL CREATE ORDER ===========");
    console.dir(err, { depth: null });

    res.status(500).json({
      success: false,
      message: err.message,
      details: err.result || null,
    });
  }
});

// =======================
// PayPal Capture Order
// =======================
router.post("/paypal/capture-order", async (req, res) => {
  try {
    const { orderID } = req.body;

    const request = new paypal.orders.OrdersCaptureRequest(orderID);

    request.requestBody({});

    const response = await paypalClient.execute(request);

    res.json({
      success: true,
      captureID:
        response.result.purchase_units[0].payments.captures[0].id,
      status: response.result.status,
    });
  } catch (err) {
    console.error("=========== PAYPAL CAPTURE ORDER ===========");
    console.dir(err, { depth: null });

    res.status(500).json({
      success: false,
      message: err.message,
      details: err.result || null,
    });
  }
});

export default router;