import Order from "../model/orderModel.js";
import Product from "../model/productModel.js";
import Coupon from "../model/couponModel.js";
import Cart from "../model/cartModel.js";
import StoreSettings from "../model/storeSettingsModel.js";
import Settings from "../model/settingsModel.js";
import { calculatePriceBreakdown } from "../utils/pricingCalculator.js";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import mongoose from "mongoose";
import crypto from "crypto";
import { getCurrencyContext, getCurrencySymbol, getCountryCode } from "../utils/currencyHelper.js";
import { getActiveRegionsCached } from "../utils/shippingCache.js";
import { refundPaypalCapture, getPaypalRefundStatus } from "./paypalController.js";
import paypalClient from "../config/paypal.js";
import paypal from "@paypal/checkout-server-sdk";
import cron from "node-cron";
import {
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
  sendCancellationApprovedEmail
} from "../services/emailService.js";

// ================= LOCALIZED ORDER SERIALIZATION =================
// Customer-facing serializer: converts to display currency (USD for foreign orders)
const serializeOrder = async (order, req) => {
  if (!order) return order;
  const context = await getCurrencyContext(req);
  const orderObj = order.toObject ? order.toObject() : order;

  // If order is not paid and is PENDING, show its status as FAILED
  if (!orderObj.isPaid && orderObj.orderStatus === "PENDING") {
    orderObj.orderStatus = "FAILED";
  }

  // Get the currency to use: prefer the order's display currency
  const useCurrency = orderObj.displayCurrency || context.currency;
  const useSymbol = getCurrencySymbol(useCurrency);

  orderObj.currency = useCurrency;
  orderObj.currencySymbol = useSymbol;

  // For customer-facing responses, use display values (original paid currency)
  orderObj.itemsPrice = orderObj.displayItemsPrice || orderObj.itemsPrice;
  orderObj.shippingPrice = orderObj.displayShippingPrice || orderObj.shippingPrice;
  orderObj.taxPrice = orderObj.displayTaxPrice || orderObj.taxPrice;
  orderObj.totalPrice = orderObj.displayTotalPrice || orderObj.totalPrice;
  orderObj.discountAmount = orderObj.displayCurrency !== "INR" && orderObj.exchangeRate
    ? Number((orderObj.discountAmount / orderObj.exchangeRate).toFixed(2))
    : orderObj.discountAmount;

  // Update order items to use display prices
  if (orderObj.orderItems) {
    orderObj.orderItems = orderObj.orderItems.map(item => {
      item.price = item.displayPrice || item.price;
      item.salePrice = item.displaySalePrice || item.salePrice;
      item.originalPrice = item.displayOriginalPrice || item.originalPrice;
      item.totalPrice = item.displayTotalPrice || item.totalPrice;
      return item;
    });
  }

  return orderObj;
};

// Admin serializer: always returns INR values for business metrics
const serializeOrderForAdmin = async (order) => {
  if (!order) return order;
  const orderObj = order.toObject ? order.toObject() : order;

  // If order is not paid and is PENDING, show its status as FAILED
  if (!orderObj.isPaid && orderObj.orderStatus === "PENDING") {
    orderObj.orderStatus = "FAILED";
  }

  // Admin always sees INR
  orderObj.currency = "INR";
  orderObj.currencySymbol = "₹";

  // Keep the original INR values (main fields are already INR)
  // itemsPrice, shippingPrice, taxPrice, totalPrice, discountAmount are already in INR

  // Add paid currency info for reference
  orderObj.paidCurrency = orderObj.paidCurrency || orderObj.displayCurrency || "INR";
  orderObj.paidAmount = orderObj.paidAmount || orderObj.displayTotalPrice || orderObj.totalPrice;

  // Update order items to use INR prices (original values)
  if (orderObj.orderItems) {
    orderObj.orderItems = orderObj.orderItems.map(item => {
      // Keep INR values (price, salePrice, originalPrice, totalPrice are already INR)
      item.currency = "INR";
      item.currencySymbol = "₹";
      return item;
    });
  }

  return orderObj;
};

const serializeOrders = async (orders, req) => {
  if (!orders || orders.length === 0) return [];
  return Promise.all(orders.map(order => serializeOrder(order, req)));
};

const serializeOrdersForAdmin = async (orders) => {
  if (!orders || orders.length === 0) return [];
  return Promise.all(orders.map(order => serializeOrderForAdmin(order)));
};

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});

const ORDER_STATUS_VALUES = [
  "PENDING",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "RETURNED",
  "FAILED",
];

const PAYMENT_METHODS = ["Razorpay", "ONLINE", "PAYPAL"];

// ================= CLEANUP EXPIRED PENDING ORDERS =================
// Automatically restocks inventory and marks pending orders older than 30 mins as FAILED
export const cleanupExpiredOrders = async () => {
  try {
    const expiredOrders = await Order.find({
      orderStatus: "PENDING",
      expiresAt: { $lt: new Date() }
    });

    for (const order of expiredOrders) {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        const dbOrder = await Order.findById(order._id).session(session);
        if (dbOrder && dbOrder.orderStatus === "PENDING") {
          // Restock items if they were tracked
          if (dbOrder.inventoryTracked !== false) {
            for (const item of dbOrder.orderItems) {
              await Product.findByIdAndUpdate(
                item.product,
                { $inc: { stock: item.quantity } },
                { session }
              );
            }
          }
          await Order.findByIdAndDelete(order._id).session(session);
          await session.commitTransaction();
          console.log(`[Checkout Cleanup] Restored stock and permanently deleted expired order ${order._id}.`);
        } else {
          await session.abortTransaction();
        }
      } catch (err) {
        await session.abortTransaction();
        console.error(`[Checkout Cleanup Error] Failed to clean up order ${order._id}:`, err);
      } finally {
        session.endSession();
      }
    }
  } catch (err) {
    console.error("[Checkout Cleanup Error] General error in cleanupExpiredOrders:", err);
  }
};

// ================= INITIATE CHECKOUT (PHASE 1) =================
export const initiateCheckout = async (req, res) => {
  // Trigger cleanup of any expired PENDING checkouts asynchronously to keep stock accurate
  cleanupExpiredOrders().catch(err => console.error("Expired orders cleanup error:", err));

  const session = await mongoose.startSession();

  try {
    const { shippingAddress, couponCode, paymentMethod } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required",
      });
    }

    if (paymentMethod && !PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    // 1. Fetch static settings & cart OUTSIDE the transaction to minimize locking & read overhead.
    const settings = await Settings.findOne() || await Settings.create({});
    const taxPercentage = settings.order?.taxPercentage || 0;
    const enableTracking = settings.inventory?.enableTracking !== false;
    const activeRegions = await getActiveRegionsCached();

    const cart = await Cart.findOne({ user: req.user._id }).populate("cartItems.product");
    if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    const context = await getCurrencyContext(req);
    const storeSettings = await StoreSettings.findOne() || await StoreSettings.create({ goldRate24kt: 8000, dailySilverRate999: 100 });
    const goldRate24kt = storeSettings.goldRate24kt;
    const dailySilverRate999 = storeSettings.dailySilverRate999 || 100;

    let itemsPrice = 0; // INR
    const verifiedOrderItems = [];

    // Verify stock and populate order items from locked cart pricing
    for (const item of cart.cartItems) {
      const product = item.product;
      if (!product) {
        return res.status(400).json({
          success: false,
          message: "Product not found in cart",
        });
      }
      if (product.status !== "active") {
        return res.status(400).json({
          success: false,
          message: `Product ${product.name} is no longer active`,
        });
      }
      if (enableTracking && product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product: ${product.name}. Available: ${product.stock}`,
        });
      }

      // Always recalculate pricing using current rates and latest product details
      const breakdown = calculatePriceBreakdown({
        metalType: product.metalType || "GOLD",
        goldRate24kt,
        dailySilverRate999,
        purity: product.purity || "22KT",
        netWeight: product.netWeight || 0,
        makingChargeType: product.makingChargeType || "per_gram",
        makingChargeValue: product.makingChargeValue || 0,
        extraCharges: product.extraCharges || 0,
        discountPercentage: product.discountPercentage || 0,
      });

      const lp = {
        metalType: product.metalType || "GOLD",
        goldRate24kt,
        dailySilverRate999,
        purity: product.purity || "22KT",
        netWeight: product.netWeight || 0,
        makingChargeType: product.makingChargeType || "per_gram",
        makingChargeValue: product.makingChargeValue || 0,
        metalValue: breakdown.metalValue,
        extraCharges: breakdown.extraCharges,
        makingCharge: breakdown.makingCharge,
        cgst: breakdown.cgst,
        sgst: breakdown.sgst,
        originalPrice: breakdown.originalPrice,
        discountPercentage: breakdown.discountPercentage,
        salePrice: breakdown.salePrice,
        lockedAt: new Date(),
      };
      const itemTotalPrice = Number((lp.salePrice * item.quantity).toFixed(2));
      itemsPrice += itemTotalPrice;

      // Calculate display prices for order item
      let itemDisplayPrice = lp.salePrice;
      let itemDisplaySalePrice = lp.salePrice;
      let itemDisplayOriginalPrice = lp.originalPrice;
      let itemDisplayTotalPrice = itemTotalPrice;

      if (context.currency === "USD") {
        itemDisplayPrice = Number((lp.salePrice / context.conversionRate).toFixed(2));
        itemDisplaySalePrice = Number((lp.salePrice / context.conversionRate).toFixed(2));
        itemDisplayOriginalPrice = Number((lp.originalPrice / context.conversionRate).toFixed(2));
        itemDisplayTotalPrice = Number((itemTotalPrice / context.conversionRate).toFixed(2));
      }

      verifiedOrderItems.push({
        product: product._id,
        name: product.name,
        image: item.image || (product.images?.[0]?.url || ""),
        price: lp.salePrice,
        quantity: item.quantity,

        // Snapshot parameters
        goldRate24kt: lp.goldRate24kt,
        purity: lp.purity,
        netWeight: lp.netWeight,
        makingChargeType: lp.makingChargeType,
        makingChargeValue: lp.makingChargeValue,
        metalValue: lp.metalValue,
        makingCharge: lp.makingCharge,
        originalPrice: lp.originalPrice,
        discountPercentage: lp.discountPercentage,
        salePrice: lp.salePrice,
        totalPrice: itemTotalPrice,

        // Display fields
        displayCurrency: context.currency,
        displayPrice: itemDisplayPrice,
        displaySalePrice: itemDisplaySalePrice,
        displayOriginalPrice: itemDisplayOriginalPrice,
        displayTotalPrice: itemDisplayTotalPrice,
      });
    }

    // Dynamic shipping cost from region rules
    let calculatedShippingPrice = 0; // INR
    let shippingRegion = "Rest of World";
    let shippingCountry = "US";
    let shippingCurrency = "USD";
    let deliveryTime = "7–10 Business Days";
    let shippingMethod = "Flat";

    const orderCountryCode = getCountryCode(shippingAddress.country) || "IN";
    shippingCountry = orderCountryCode;

    let matchedRegion = activeRegions.find(r => r.countries.includes(orderCountryCode));
    if (!matchedRegion) {
      matchedRegion = activeRegions.find(r => r.isDefault === true);
    }

    if (matchedRegion) {
      shippingRegion = matchedRegion.name;
      shippingCurrency = matchedRegion.currency || "USD";
      deliveryTime = matchedRegion.deliveryTime || "5–7 Business Days";

      // Calculate total net weight (in grams) for cart items
      let totalWeight = 0;
      for (const item of cart.cartItems) {
        if (item.product) {
          totalWeight += (item.product.netWeight || 0) * (item.quantity || 1);
        }
      }

      let rawShippingCharge = matchedRegion.flatShippingCharge || 0;
      let threshold = matchedRegion.freeShippingThreshold;

      // Check for weight-wise rules
      if (matchedRegion.weightRules && matchedRegion.weightRules.length > 0) {
        const matchedWeightRule = matchedRegion.weightRules.find(
          r => totalWeight >= r.minWeight && totalWeight < r.maxWeight
        );
        if (matchedWeightRule) {
          rawShippingCharge = matchedWeightRule.charge;
          shippingMethod = "Weight";
        }
      }

      // Convert matched region's shipping charge (which is in USD or INR) to INR
      const storeSettings = await StoreSettings.findOne() || await StoreSettings.create({ goldRate24kt: 8000, dailySilverRate999: 100 });
      const usdConversionRate = storeSettings.usdConversionRate || 94.4;

      const ruleConversionRate = matchedRegion.currency === "INR" ? 1 : usdConversionRate;
      const itemsPriceInRuleCurrency = itemsPrice / ruleConversionRate;

      if (threshold !== null && threshold !== undefined && threshold > 0 && itemsPriceInRuleCurrency >= threshold) {
        calculatedShippingPrice = 0;
      } else {
        // Convert shipping charge back to INR for master totals
        calculatedShippingPrice = Number((rawShippingCharge * ruleConversionRate).toFixed(2));
      }
    } else {
      // General settings fallback logic (in case no regions or defaults are found)
      const settingsShippingCharge = settings.order?.shippingCharge || 0;
      const settingsFreeShippingThreshold = settings.order?.freeShippingMinAmount || 0;
      
      if (settingsFreeShippingThreshold > 0 && itemsPrice >= settingsFreeShippingThreshold) {
        calculatedShippingPrice = 0;
      } else {
        calculatedShippingPrice = settingsShippingCharge;
      }
    }

    // Validate coupon and compute discount
    let discountAmount = 0;
    let appliedCouponCode = "";
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (!coupon) {
        return res.status(400).json({ success: false, message: "Invalid or inactive coupon code" });
      }
      if (new Date() > new Date(coupon.expiryDate)) {
        return res.status(400).json({ success: false, message: "Coupon has expired" });
      }
      if (itemsPrice < coupon.minimumOrderAmount) {
        return res.status(400).json({ success: false, message: `Minimum order amount for coupon is not met` });
      }

      // Check usage limits
      const userUsageCount = coupon.usedBy.filter(
        (uid) => uid.toString() === req.user._id.toString()
      ).length;
      if (coupon.usageLimit > 0 && userUsageCount >= coupon.usageLimit) {
        return res.status(400).json({ success: false, message: `You have reached the usage limit for this coupon` });
      }

      if (coupon.discountType === "percentage") {
        discountAmount = (itemsPrice * coupon.discountValue) / 100;
        if (coupon.maximumDiscountAmount > 0 && discountAmount > coupon.maximumDiscountAmount) {
          discountAmount = coupon.maximumDiscountAmount;
        }
      } else {
        discountAmount = coupon.discountValue;
      }
      discountAmount = Math.min(Math.max(0, discountAmount), itemsPrice);
      appliedCouponCode = coupon.code;
    }

    // Dynamic tax calculation - Forced to 0 as requested
    const calculatedTaxPrice = 0;

    // Master grand total in INR
    let totalPrice = Number((itemsPrice + calculatedShippingPrice - discountAmount).toFixed(2));

    // Display values (converted to USD if applicable)
    const displayCurrency = context.currency;
    let displayItemsPrice = itemsPrice;
    let displayShippingPrice = calculatedShippingPrice;
    let displayTaxPrice = calculatedTaxPrice;
    let displayDiscountAmount = discountAmount;
    let displayTotalPrice = totalPrice;

    if (displayCurrency !== "INR") {
      displayItemsPrice = Number((itemsPrice / context.conversionRate).toFixed(2));
      displayShippingPrice = Number((calculatedShippingPrice / context.conversionRate).toFixed(2));
      displayTaxPrice = 0;
      displayDiscountAmount = Number((discountAmount / context.conversionRate).toFixed(2));

      // Calculate total in display currency as the exact sum of the rounded display values
      displayTotalPrice = Number((displayItemsPrice + displayShippingPrice + displayTaxPrice - displayDiscountAmount).toFixed(2));

      // Sync back to database INR values to guarantee absolute consistency with payment gateways
      itemsPrice = Number((displayItemsPrice * context.conversionRate).toFixed(2));
      calculatedShippingPrice = Number((displayShippingPrice * context.conversionRate).toFixed(2));
      discountAmount = Number((displayDiscountAmount * context.conversionRate).toFixed(2));
      totalPrice = Number((displayTotalPrice * context.conversionRate).toFixed(2));
    } else {
      displayItemsPrice = itemsPrice;
      displayShippingPrice = calculatedShippingPrice;
      displayTaxPrice = 0;
      displayDiscountAmount = discountAmount;
      totalPrice = Number((itemsPrice + calculatedShippingPrice - discountAmount).toFixed(2));
      displayTotalPrice = totalPrice;
    }

    // Set order expiry (10 mins from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // 2. Perform Stock Reservation & Order Document Creation inside a Retriable Transaction
    let createdOrder = null;

    await session.withTransaction(async () => {
      // Reserve stock atomically inside transaction if tracking is enabled
      if (enableTracking) {
        for (const item of verifiedOrderItems) {
          const updatedProduct = await Product.findOneAndUpdate(
            { _id: item.product, stock: { $gte: item.quantity } },
            { $inc: { stock: -item.quantity } },
            { returnDocument: "after", session }
          );
          if (!updatedProduct) {
            throw new Error(`${item.name} went out of stock while placing order`);
          }
        }
      }

      // Create PENDING order document
      const [order] = await Order.create([{
        user: req.user._id,
        orderItems: verifiedOrderItems,
        shippingAddress,
        paymentMethod,
        isPaid: false,
        itemsPrice: Number(itemsPrice.toFixed(2)),
        shippingPrice: calculatedShippingPrice,
        taxPrice: calculatedTaxPrice,
        totalPrice,
        couponCode: appliedCouponCode,
        discountAmount: Number(discountAmount.toFixed(2)),

        displayCurrency,
        displayItemsPrice,
        displayShippingPrice,
        displayTaxPrice,
        displayTotalPrice,
        exchangeRate: context.conversionRate,

        paidCurrency: displayCurrency,
        paidAmount: displayTotalPrice,

        shippingRegion,
        shippingCountry,
        shippingCurrency,
        deliveryTime,
        shippingMethod,

        orderStatus: "PENDING",
        checkoutInitiatedAt: new Date(),
        expiresAt,
        razorpayGatewayOrderId: "",
        paypalGatewayOrderId: "",
        inventoryTracked: enableTracking,
      }], { session });

      createdOrder = order;
    });

    // 3. Make External Network Calls outside of the transaction block.
    // This prevents slow network calls from holding document locks and causing WriteConflicts.
    let razorpayGatewayOrderId = "";
    let paypalGatewayOrderId = "";

    try {
      if (paymentMethod === "Razorpay" || paymentMethod === "ONLINE") {
        const options = {
          amount: Math.round(totalPrice * 100), // paise
          currency: "INR",
          receipt: `receipt_${createdOrder._id.toString()}`,
        };
        const razorpayOrder = await razorpay.orders.create(options);
        razorpayGatewayOrderId = razorpayOrder.id;
      } else if (paymentMethod === "PAYPAL") {
        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        request.prefer("return=representation");
        request.requestBody({
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: displayCurrency === "INR" ? "USD" : displayCurrency,
                value: Number(displayTotalPrice).toFixed(2),
              },
            },
          ],
        });
        const response = await paypalClient.execute(request);
        paypalGatewayOrderId = response.result.id;
      }

      // 4. Update the order with the gateway order ID (non-transaction, quick update)
      if (razorpayGatewayOrderId || paypalGatewayOrderId) {
        await Order.findByIdAndUpdate(createdOrder._id, {
          $set: {
            razorpayGatewayOrderId,
            paypalGatewayOrderId,
          }
        });
      }

    } catch (gatewayError) {
      console.error("[Checkout Gateway Error]: Failed to create payment gateway order:", gatewayError);

      // Fallback: If gateway order creation failed, immediately release stock & mark order as FAILED
      try {
        if (enableTracking) {
          for (const item of verifiedOrderItems) {
            await Product.findByIdAndUpdate(item.product, {
              $inc: { stock: item.quantity }
            });
          }
        }
        await Order.findByIdAndDelete(createdOrder._id);
      } catch (cleanupErr) {
        console.error("[Checkout Gateway Fallback Error]: Failed to restore stock & mark order as failed:", cleanupErr);
      }

      return res.status(500).json({
        success: false,
        message: `Failed to initiate payment gateway: ${gatewayError.message || gatewayError}`,
      });
    }

    res.status(201).json({
      success: true,
      message: "Checkout initiated successfully",
      orderId: createdOrder._id,
      orderSummary: {
        itemsPrice: displayItemsPrice,
        shippingPrice: displayShippingPrice,
        taxPrice: displayTaxPrice,
        discountAmount: displayCurrency === "USD" ? Number((discountAmount / context.conversionRate).toFixed(2)) : discountAmount,
        totalPrice: displayTotalPrice,
        currency: displayCurrency,
        currencySymbol: context.currencySymbol,
      },
      razorpayOrder: razorpayGatewayOrderId ? { id: razorpayGatewayOrderId, amount: totalPrice * 100, currency: "INR" } : null,
      paypalOrderId: paypalGatewayOrderId || null,
    });

  } catch (error) {
    console.error("========== INITIATE CHECKOUT ERROR ==========");
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to initiate checkout",
    });
  } finally {
    session.endSession();
  }
};

// ================= CONFIRM CHECKOUT (PHASE 2) =================
export const confirmCheckout = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { orderId, paymentId, razorpayOrderId, razorpaySignature, paypalOrderId } = req.body;

    const order = await Order.findById(orderId).session(session);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to order",
      });
    }

    // Verify status is PENDING
    if (order.orderStatus !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: `Checkout already processed or expired. Current status: ${order.orderStatus}`,
      });
    }

    let paymentInfo = {};
    if (order.paymentMethod === "Razorpay" || order.paymentMethod === "ONLINE") {
      if (!paymentId || !razorpayOrderId || !razorpaySignature) {
        return res.status(400).json({
          success: false,
          message: "Missing Razorpay verification details",
        });
      }

      // Verify Razorpay HMAC signature
      const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
        .update(`${razorpayOrderId}|${paymentId}`)
        .digest("hex");

      if (generatedSignature !== razorpaySignature) {
        if (order.inventoryTracked !== false) {
          for (const item of order.orderItems) {
            await Product.findByIdAndUpdate(
              item.product,
              { $inc: { stock: item.quantity } },
              { session }
            );
          }
        }
        await Order.findByIdAndDelete(orderId).session(session);
        await session.commitTransaction();
        return res.status(400).json({
          success: false,
          message: "Razorpay signature verification failed",
        });
      }

      paymentInfo = {
        id: paymentId,
        status: "paid",
        razorpayOrderId,
        razorpayPaymentId: paymentId,
        razorpaySignature,
      };
    } else if (order.paymentMethod === "PAYPAL") {
      if (!paypalOrderId) {
        return res.status(400).json({
          success: false,
          message: "Missing PayPal order ID",
        });
      }

      // Capture PayPal order on the server-side to prevent client-side spoofing
      const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
      request.requestBody({});
      const response = await paypalClient.execute(request);

      if (response.result.status !== "COMPLETED") {
        if (order.inventoryTracked !== false) {
          for (const item of order.orderItems) {
            await Product.findByIdAndUpdate(
              item.product,
              { $inc: { stock: item.quantity } },
              { session }
            );
          }
        }
        await Order.findByIdAndDelete(orderId).session(session);
        await session.commitTransaction();
        return res.status(400).json({
          success: false,
          message: `PayPal capture status is ${response.result.status}, expected COMPLETED`,
        });
      }

      const captureId = response.result.purchase_units[0].payments.captures[0].id;
      paymentInfo = {
        id: captureId,
        status: "COMPLETED",
        paypalOrderId,
      };
    }

    // Mark as paid and confirmed, remove expiry time so index won't delete it
    order.paymentInfo = paymentInfo;
    order.isPaid = true;
    order.paidAt = Date.now();
    order.orderStatus = "CONFIRMED";
    order.expiresAt = undefined;

    await order.save({ session });

    // Increment product total sales since payment is successful
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { totalSales: item.quantity } },
        { session }
      );
    }

    // Update coupon usage
    if (order.couponCode) {
      await Coupon.updateOne(
        { code: order.couponCode },
        { $inc: { usedCount: 1 }, $push: { usedBy: req.user._id } },
        { session }
      );
    }

    // Clear cart upon successful payment
    const cart = await Cart.findOne({ user: req.user._id }).session(session);
    if (cart) {
      cart.cartItems = [];
      cart.totalItems = 0;
      cart.totalPrice = 0;
      await cart.save({ session });
    }

    await session.commitTransaction();

    // Trigger order confirmation email asynchronously
    sendOrderConfirmationEmail(order);

    const serializedOrder = await serializeOrder(order, req);
    res.status(200).json({
      success: true,
      message: "Order placed and payment confirmed",
      order: serializedOrder,
    });

  } catch (error) {
    await session.abortTransaction();
    console.error("========== CONFIRM CHECKOUT ERROR ==========");
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to confirm checkout",
    });
  } finally {
    session.endSession();
  }
};

// ================= CANCEL CHECKOUT (PHASE 1 ABORT) =================
export const cancelCheckout = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId).session(session);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (order.orderStatus !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: `Only PENDING checkouts can be cancelled. Current status is ${order.orderStatus}`,
      });
    }

    // Restock items atomically if they were tracked
    if (order.inventoryTracked !== false) {
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: item.quantity } },
          { session }
        );
      }
    }

    await Order.findByIdAndDelete(orderId).session(session);
    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Checkout cancelled and inventory restocked",
    });

  } catch (error) {
    await session.abortTransaction();
    console.error("========== CANCEL CHECKOUT ERROR ==========");
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to cancel checkout",
    });
  } finally {
    session.endSession();
  }
};
;


// ================= GET MY ORDERS =================
export const getMyOrders = async (req, res) => {
  try {
    // Trigger cleanup of any expired pending checkouts asynchronously
    cleanupExpiredOrders().catch(err => console.error("Expired orders cleanup error:", err));

    const orders = await Order.find({
      user: req.user._id,
      isPaid: true,
    }).sort({ createdAt: -1 });

    const serializedOrders = await serializeOrders(orders, req);
    res.status(200).json({
      success: true,
      count: orders.length,
      orders: serializedOrders,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || (error && typeof error === 'object' ? JSON.stringify(error) : String(error)),
    });
  }
};


// ================= GET SINGLE ORDER =================
export const getSingleOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({
        success: false,
        message: "Order lookup failed: parameter ID was received as undefined",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Order ID format",
      });
    }

    const order = await Order.findOne({ _id: id, isPaid: true })
      .populate("user", "name email")
      .populate("orderItems.product");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Use admin serializer for admin users, customer serializer for regular users
    const userRole = req.user?.role ? req.user.role.toLowerCase() : "";
    const isAdmin = userRole === "admin" || userRole === "superadmin";

    const serializedOrder = isAdmin
      ? await serializeOrderForAdmin(order)
      : await serializeOrder(order, req);

    res.status(200).json({
      success: true,
      order: serializedOrder,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || (error && typeof error === 'object' ? JSON.stringify(error) : String(error)),
    });
  }
};


// ================= GET ALL ORDERS (ADMIN) =================
export const getAllOrders = async (req, res) => {
  try {
    // Trigger cleanup of any expired pending checkouts asynchronously
    cleanupExpiredOrders().catch(err => console.error("Expired orders cleanup error:", err));

    // NOTE: this loads every order into memory with no pagination. Fine for
    // a small catalog, but worth adding page/limit query params before this
    // gets used against a large order collection in production.
    const orders = await Order.find({ isPaid: true })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    // totalAmount is always calculated from raw INR values stored in DB
    const totalAmount = orders
      .filter(order => order.orderStatus?.toUpperCase() === "DELIVERED")
      .reduce((acc, order) => acc + order.totalPrice, 0);

    // Admin always sees INR values
    const serializedOrders = await serializeOrdersForAdmin(orders);

    res.status(200).json({
      success: true,
      totalOrders: orders.length,
      totalAmount, // INR
      orders: serializedOrders,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || (error && typeof error === 'object' ? JSON.stringify(error) : String(error)),
    });
  }
};


// ================= UPDATE ORDER STATUS =================
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || id === 'undefined' || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Action rejected: Provided ID format is invalid or undefined",
      });
    }

    // BUG FIX: req.body.status was used without ever checking it existed,
    // so a missing status would throw trying to call .toUpperCase() on
    // undefined. It was also accepted as-is with no validation against the
    // allowed set, and CANCELLED could be set directly here, bypassing the
    // refund/restock logic in approveCancellation entirely.
    if (!status || typeof status !== "string") {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const newStatus = status.toUpperCase();

    if (!ORDER_STATUS_VALUES.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: newStatus === "CANCELLED"
          ? "Use the cancellation request flow to cancel an order"
          : "Invalid status value",
      });
    }

    // BUG FIX: previously `order` was referenced in these guards before it
    // had been fetched/declared, which throws a ReferenceError on every
    // call. The fetch now happens first.
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.orderStatus === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Cancelled order cannot be updated",
      });
    }

    if (order.orderStatus === "DELIVERED") {
      return res.status(400).json({
        success: false,
        message: "Delivered order cannot be updated",
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      {
        $set: {
          orderStatus: newStatus,
          deliveredAt: newStatus === "DELIVERED" ? Date.now() : order.deliveredAt,
        }
      },
      { returnDocument: "after", runValidators: false }
    );

    if (updatedOrder) {
      sendOrderStatusUpdateEmail(updatedOrder);
    }

    res.status(200).json({
      success: true,
      message: "Order status updated",
      order: updatedOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || (error && typeof error === 'object' ? JSON.stringify(error) : String(error)),
    });
  }
};


// ================= CUSTOMER REQUEST CANCELLATION =================
export const requestCancellation = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;

    if (!id || id === 'undefined' || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Order ID format",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to modify this order",
      });
    }

    if (order.cancellationStatus !== "None") {
      return res.status(400).json({
        success: false,
        message: "Cancellation has already been requested",
      });
    }

    const eligibleStatuses = ["PENDING", "CONFIRMED", "PACKED"];
    if (!eligibleStatuses.includes(order.orderStatus?.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled at this status",
      });
    }

    if (!cancellationReason || cancellationReason.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Cancellation reason is required",
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      {
        $set: {
          cancellationStatus: "Requested",
          cancellationReason: cancellationReason,
          cancellationRequestedAt: Date.now(),
          refundStatus: order.isPaid ? "Pending" : "NotRequired",
          refundAmount: order.totalPrice,
        }
      },
      { returnDocument: "after", runValidators: false }
    );

    res.status(200).json({
      success: true,
      message: "Cancellation request submitted successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || (error && typeof error === 'object' ? JSON.stringify(error) : String(error)),
    });
  }
};

// ================= GET ALL CANCELLATION REQUESTS (ADMIN) =================
export const getCancellationRequests = async (req, res) => {
  try {
    const { status } = req.query;
    let query = { cancellationStatus: { $ne: "None" } };

    if (status && status !== "All") {
      if (status === "RefundPending") {
        query.refundStatus = "Pending";
      } else if (status === "RefundCompleted") {
        query.refundStatus = "Completed";
      } else if (status === "RefundFailed") {
        query.refundStatus = "Failed";
      } else {
        query.cancellationStatus = status;
      }
    }

    const requests = await Order.find(query)
      .populate("user", "name email")
      .sort({ cancellationRequestedAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || (error && typeof error === 'object' ? JSON.stringify(error) : String(error)),
    });
  }
};

// ================= SYNC REFUND STATUS FROM GATEWAY (ADMIN) =================
export const syncRefundStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (!order.refundId) {
      return res.status(400).json({
        success: false,
        message: "No refund ID found for this order",
      });
    }

    let newRefundStatus = order.refundStatus;
    let refundCompletedAt = order.refundCompletedAt;
    let refundFailureReason = order.refundFailureReason;

    if (order.paymentMethod === "Razorpay" || order.paymentMethod === "ONLINE") {
      // Fetch refund from Razorpay
      console.log(`[Sync Refund Status] Fetching Razorpay refund status for Refund ID: ${order.refundId}`);
      const refund = await razorpay.refunds.fetch(order.refundId);

      if (refund.status === "processed") {
        newRefundStatus = "Completed";
        refundCompletedAt = refundCompletedAt || new Date();
      } else if (refund.status === "failed") {
        newRefundStatus = "Failed";
        refundFailureReason = refund.error_description || "Refund failed";
      } else if (refund.status === "pending") {
        newRefundStatus = "Pending";
      }
    } else if (order.paymentMethod === "PAYPAL") {
      // Fetch refund from PayPal
      console.log(`[Sync Refund Status] Fetching PayPal refund status for Refund ID: ${order.refundId}`);
      const refund = await getPaypalRefundStatus(order.refundId);

      // PayPal refund status values: COMPLETED, PENDING, CANCELLED, FAILED, etc.
      if (refund.status === "COMPLETED") {
        newRefundStatus = "Completed";
        refundCompletedAt = refundCompletedAt || new Date();
      } else if (refund.status === "FAILED" || refund.status === "CANCELLED") {
        newRefundStatus = "Failed";
        refundFailureReason = refund.status_details?.reason || `PayPal refund status is ${refund.status}`;
      } else if (refund.status === "PENDING") {
        newRefundStatus = "Pending";
      }
    } else {
      return res.status(400).json({
        success: false,
        message: `Refund status synchronization is not supported for payment method: ${order.paymentMethod}`,
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        $set: {
          refundStatus: newRefundStatus,
          refundCompletedAt: refundCompletedAt,
          refundFailureReason: refundFailureReason,
        }
      },
      { returnDocument: "after", runValidators: false }
    );

    res.status(200).json({
      success: true,
      message: "Refund status synced successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("[Sync Refund Status Error]:", error.response?.data || error.message || error);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || error.message || "Server Error",
      details: error.response?.data || null,
    });
  }
};


// ================= HANDLE RAZORPAY WEBHOOK =================
export const handleRazorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify webhook signature if needed
    // For now, just process the event
    const event = req.body;

    if (event.event === "order.paid" || event.event === "payment.captured") {
      const razorpayOrderId = event.event === "order.paid"
        ? event.payload.order.entity.id
        : event.payload.payment.entity.order_id;

      const paymentId = event.payload.payment?.entity?.id || "";

      if (razorpayOrderId) {
        const order = await Order.findOne({ razorpayGatewayOrderId: razorpayOrderId, orderStatus: "PENDING" });
        if (order) {
          order.isPaid = true;
          order.paidAt = Date.now();
          order.orderStatus = "CONFIRMED";
          order.expiresAt = undefined;
          order.paymentInfo = {
            id: paymentId,
            status: "COMPLETED",
            razorpayOrderId,
            razorpayPaymentId: paymentId,
          };
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

          console.log(`[Razorpay Webhook Success] Fulfilling order ${order._id} for Razorpay Order ID: ${razorpayOrderId}`);
          sendOrderConfirmationEmail(order);
        }
      }
    } else if (event.event === "refund.processed") {
      // Find order by refund ID
      const refundId = event.payload.refund.entity.id;
      const order = await Order.findOne({ refundId });

      if (order) {
        await Order.findByIdAndUpdate(
          order._id,
          {
            $set: {
              refundStatus: "Completed",
              refundCompletedAt: new Date()
            }
          },
          { runValidators: false }
        );
      }
    } else if (event.event === "refund.failed") {
      // Find order by refund ID
      const refundId = event.payload.refund.entity.id;
      const order = await Order.findOne({ refundId });

      if (order) {
        await Order.findByIdAndUpdate(
          order._id,
          {
            $set: {
              refundStatus: "Failed",
              refundFailureReason: event.payload.refund.entity.error_description || "Refund failed"
            }
          },
          { runValidators: false }
        );
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || (error && typeof error === 'object' ? JSON.stringify(error) : String(error)),
    });
  }
};

// ================= DELETE CANCELLATION RECORD (ADMIN) =================
export const deleteCancellationRecord = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Reset all cancellation and refund fields
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        $set: {
          cancellationStatus: "None",
          cancellationReason: "",
          cancellationRequestedAt: undefined,
          cancellationReviewedAt: undefined,
          cancellationReviewedBy: undefined,
          refundStatus: "NotRequired",
          refundAmount: 0,
          refundId: "",
          refundProcessedAt: undefined,
          refundCompletedAt: undefined,
          refundFailureReason: "",
          refundInitiatedAt: undefined,
        }
      },
      { returnDocument: "after", runValidators: false }
    );

    res.status(200).json({
      success: true,
      message: "Cancellation record deleted successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || (error && typeof error === 'object' ? JSON.stringify(error) : String(error)),
    });
  }
};

// ================= APPROVE CANCELLATION & REFUND (ADMIN) =================
export const approveCancellation = async (req, res) => {
  try {
    const { id } = req.params;

    // BUG FIX: previously `order` was referenced (twice, redundantly) and
    // the coupon-refund block ran, all before `order` was ever fetched —
    // this threw a ReferenceError on every call. ID validation now happens
    // first, then the order is fetched once, before anything else touches it.
    if (!id || id === 'undefined' || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Order ID format",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // BUG FIX: there was no check that a cancellation had actually been
    // requested — an admin could "approve" an order that never asked to be
    // cancelled. Now requires cancellationStatus === "Requested".
    if (order.cancellationStatus !== "Requested") {
      return res.status(400).json({
        success: false,
        message: "This order has no pending cancellation request",
      });
    }

    // Process the refund (or mark why one isn't happening)
    if (order.paymentMethod === "COD") {
      console.log(`[Order Refund Status] Order ${order._id} is COD. Refund is NotRequired.`);
      order.refundStatus = "NotRequired";
    } else if (order.isPaid) {
      if (order.paymentMethod === "Razorpay" || order.paymentMethod === "ONLINE") {
        if (order.paymentInfo?.razorpayPaymentId) {
          try {
            console.log(`[Order Refund Init] Processing Razorpay refund for order ${order._id}. Payment ID: ${order.paymentInfo.razorpayPaymentId}`);
            const refund = await razorpay.payments.refund(
              order.paymentInfo.razorpayPaymentId,
              {
                amount: Math.round(order.refundAmount * 100),
                speed: "normal",
                notes: {
                  orderId: order._id.toString(),
                  customer: order.shippingAddress.fullName,
                  reason: order.cancellationReason,
                },
              }
            );

            order.refundId = refund.id;
            order.refundStatus = refund.status === "processed" ? "Completed" : "Pending";
            order.refundProcessedAt = new Date();
            console.log(`[Order Refund Success] Razorpay refund initiated successfully. Refund ID: ${refund.id}, Status: ${order.refundStatus}`);
          } catch (razorpayError) {
            console.error("[Order Refund Error] Razorpay refund failed:", razorpayError);
            order.refundStatus = "Failed";
            order.refundFailureReason =
              razorpayError?.error?.description || razorpayError.message || "Refund failed";
          }
        } else {
          console.warn(`[Order Refund Error] Paid order ${order._id} has no Razorpay Payment ID stored.`);
          order.refundStatus = "Failed";
          order.refundFailureReason = "No Razorpay payment ID on record for this order";
        }
      } else if (order.paymentMethod === "PAYPAL") {
        const captureId = order.paymentInfo?.id;
        const captureStatus = order.paymentInfo?.status;

        // 1. Verify capture status is COMPLETED
        if (!captureStatus || captureStatus.toUpperCase() !== "COMPLETED") {
          const errMsg = `PayPal capture status is '${captureStatus || "UNKNOWN"}', expected 'COMPLETED'`;
          console.error(`[PayPal Refund Error] Order ID: ${order._id}. ${errMsg}`);
          order.refundStatus = "Failed";
          order.refundFailureReason = errMsg;
        } else if (!captureId) {
          console.warn(`[PayPal Refund Error] Paid order ${order._id} has no PayPal Capture ID stored.`);
          order.refundStatus = "Failed";
          order.refundFailureReason = "No PayPal capture ID on record for this order";
        } else {
          try {
            // Determine refund currency and amount
            const refundCurrency = order.paidCurrency || "USD";
            let refundVal = order.refundAmount;

            if (refundCurrency === "USD") {
              // Convert INR refund amount to USD using exchangeRate
              const calculatedUSD = Number((order.refundAmount / (order.exchangeRate || 1)).toFixed(2));

              // Validate that the refund amount matches the original paidAmount (within a small tolerance)
              const difference = Math.abs(calculatedUSD - order.paidAmount);
              if (difference > 0.05) {
                console.warn(`[PayPal Refund Warning] Calculated USD refund (${calculatedUSD}) differs from original paidAmount (${order.paidAmount}). Using original paidAmount to ensure full refund.`);
                refundVal = order.paidAmount;
              } else {
                refundVal = calculatedUSD;
              }
            } else {
              // For INR domestic (if any PayPal transaction was in INR)
              const difference = Math.abs(order.refundAmount - order.totalPrice);
              if (difference > 1) {
                console.warn(`[PayPal Refund Warning] Refund amount (${order.refundAmount}) differs from original totalPrice (${order.totalPrice}). Using totalPrice.`);
                refundVal = order.totalPrice;
              }
            }

            // 2. Validate refund amount and currency match original payment
            if (refundCurrency !== order.paidCurrency) {
              console.warn(`[PayPal Refund Currency Mismatch] Refund Currency: ${refundCurrency}, Paid Currency: ${order.paidCurrency}`);
            }

            // Construct payload for logging
            const refundPayload = {
              amount: {
                value: Number(refundVal).toFixed(2),
                currency_code: refundCurrency,
              }
            };

            // 3. Detailed logging of refund parameters BEFORE calling the API
            console.log("=================================================");
            console.log("[PayPal Refund Execution Details]");
            console.log(`- Order ID: ${order._id.toString()}`);
            console.log(`- Capture ID: ${captureId}`);
            console.log(`- Capture Status: ${captureStatus}`);
            console.log(`- Original Paid Amount: ${order.paidAmount} ${order.paidCurrency}`);
            console.log("- Refund Payload Sent to PayPal:", JSON.stringify(refundPayload, null, 2));
            console.log("=================================================");

            // Call the PayPal refund API using the helper
            const refundResponse = await refundPaypalCapture(captureId, refundVal, refundCurrency);

            // 4. Detailed logging of PayPal API response
            console.log("=================================================");
            console.log("[PayPal Refund API Response Success]");
            console.log(`- Order ID: ${order._id.toString()}`);
            console.log(`- Capture ID: ${captureId}`);
            console.log("- Response Data:", JSON.stringify(refundResponse, null, 2));
            console.log("=================================================");

            order.refundId = refundResponse.id;
            order.refundStatus = refundResponse.status === "COMPLETED" ? "Completed" : "Pending";
            order.refundProcessedAt = new Date();
          } catch (paypalError) {
            const apiErrorDetails = paypalError.response?.data || null;

            // 5. Detailed logging of PayPal API failure (business validation errors)
            console.error("=================================================");
            console.error("[PayPal Refund API Response Failure]");
            console.error(`- Order ID: ${order._id.toString()}`);
            console.error(`- Capture ID: ${captureId}`);
            console.error(`- Status Code: ${paypalError.response?.status || "N/A"}`);
            console.error("- API Error Details:", JSON.stringify(apiErrorDetails, null, 2));
            console.error(`- Message: ${paypalError.message}`);
            console.error("=================================================");

            order.refundStatus = "Failed";
            order.refundFailureReason =
              apiErrorDetails?.message ||
              (apiErrorDetails?.details && JSON.stringify(apiErrorDetails.details)) ||
              paypalError.message ||
              "PayPal refund failed";
          }
        }
      } else {
        console.warn(`[Order Refund Warning] Unknown paid payment method: ${order.paymentMethod} for order ${order._id}. Marking refund as NotRequired.`);
        order.refundStatus = "NotRequired";
      }
    } else {
      console.log(`[Order Refund Status] Order ${order._id} is unpaid. Refund is NotRequired.`);
      order.refundStatus = "NotRequired";
    }

    // Release the coupon usage tied to this order, if any
    if (order.couponCode) {
      const coupon = await Coupon.findOne({ code: order.couponCode });
      if (coupon) {
        coupon.usedCount = Math.max(0, coupon.usedCount - 1);
        coupon.usedBy = coupon.usedBy.filter(
          (uid) => uid.toString() !== order.user.toString()
        );
        await coupon.save();
      }
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      {
        $set: {
          refundId: order.refundId,
          refundStatus: order.refundStatus,
          refundProcessedAt: order.refundProcessedAt,
          refundFailureReason: order.refundFailureReason,
          orderStatus: "CANCELLED",
          cancellationStatus: "Approved",
          cancellationReviewedAt: Date.now(),
          cancellationReviewedBy: req.user._id,
        }
      },
      { returnDocument: "after", runValidators: false }
    );

    // Restock items if they were tracked
    if (order.inventoryTracked !== false) {
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
    }
    // Decrement totalSales only if the order was paid
    if (order.isPaid) {
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { totalSales: -item.quantity },
        });
      }
    }

    if (updatedOrder) {
      sendCancellationApprovedEmail(updatedOrder);
    }

    res.status(200).json({
      success: true,
      message: "Cancellation approved and refund processed",
      order: updatedOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || (error && typeof error === 'object' ? JSON.stringify(error) : String(error)),
    });
  }
};

// ================= REJECT CANCELLATION (ADMIN) =================
export const rejectCancellation = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!id || id === 'undefined' || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Order ID format",
      });
    }

    // BUG FIX: rejectionReason was accepted as fully optional, so an order
    // could be rejected with no explanation recorded anywhere. Now required,
    // matching how requestCancellation requires a reason. Drop this check
    // if you'd rather keep it optional.
    if (!rejectionReason || rejectionReason.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // BUG FIX: same missing guard as approveCancellation — without this,
    // an admin could reject an order with no pending cancellation request.
    if (order.cancellationStatus !== "Requested") {
      return res.status(400).json({
        success: false,
        message: "This order has no pending cancellation request",
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      {
        $set: {
          cancellationStatus: "Rejected",
          cancellationReason: rejectionReason,
          cancellationReviewedAt: Date.now(),
          cancellationReviewedBy: req.user._id,
          refundStatus: "NotRequired",
        }
      },
      { returnDocument: "after", runValidators: false }
    );

    res.status(200).json({
      success: true,
      message: "Cancellation request rejected",
      order: updatedOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || (error && typeof error === 'object' ? JSON.stringify(error) : String(error)),
    });
  }
};

// ================= ADMIN DIRECT ORDER CANCELLATION & REFUND =================
export const adminCancelOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    if (!id || id === 'undefined' || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Order ID format",
      });
    }

    const order = await Order.findById(id).session(session);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Prevent cancellation of orders that are already cancelled, refunded, or delivered
    if (order.orderStatus === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "This order is already cancelled",
      });
    }

    if (order.orderStatus === "DELIVERED") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a delivered order",
      });
    }

    if (order.refundStatus === "Completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel an already refunded order",
      });
    }

    let refundId = order.refundId;
    let refundStatus = order.refundStatus;
    let refundProcessedAt = order.refundProcessedAt;
    let refundFailureReason = order.refundFailureReason;

    // Process refund only if isPaid is true
    if (order.isPaid) {
      const refundAmount = order.totalPrice; // Full refund

      if (order.paymentMethod === "Razorpay" || order.paymentMethod === "ONLINE") {
        if (order.paymentInfo?.razorpayPaymentId) {
          try {
            console.log(`[Admin Order Refund Init] Processing Razorpay refund for order ${order._id}. Payment ID: ${order.paymentInfo.razorpayPaymentId}`);
            const refund = await razorpay.payments.refund(
              order.paymentInfo.razorpayPaymentId,
              {
                amount: Math.round(refundAmount * 100),
                speed: "normal",
                notes: {
                  orderId: order._id.toString(),
                  customer: order.shippingAddress.fullName,
                  reason: "Cancelled by Admin",
                },
              }
            );

            refundId = refund.id;
            refundStatus = refund.status === "processed" ? "Completed" : "Pending";
            refundProcessedAt = new Date();
          } catch (razorpayError) {
            console.error("[Admin Order Refund Error] Razorpay refund failed:", razorpayError);
            throw new Error(
              `Razorpay refund failed: ${razorpayError?.error?.description || razorpayError.message || "Unknown error"}`
            );
          }
        } else {
          throw new Error("No Razorpay payment ID on record for this order");
        }
      } else if (order.paymentMethod === "PAYPAL") {
        const captureId = order.paymentInfo?.id;
        const captureStatus = order.paymentInfo?.status;

        if (!captureStatus || captureStatus.toUpperCase() !== "COMPLETED") {
          throw new Error(`PayPal capture status is '${captureStatus || "UNKNOWN"}', expected 'COMPLETED'`);
        } else if (!captureId) {
          throw new Error("No PayPal capture ID on record for this order");
        } else {
          try {
            const refundCurrency = order.paidCurrency || "USD";
            let refundVal = refundAmount;

            if (refundCurrency === "USD") {
              refundVal = order.paidAmount || Number((refundAmount / (order.exchangeRate || 1)).toFixed(2));
            }

            console.log(`[Admin Order Refund Init] Processing PayPal refund for order ${order._id}. Capture ID: ${captureId}`);
            const refundResponse = await refundPaypalCapture(captureId, refundVal, refundCurrency);

            refundId = refundResponse.id;
            refundStatus = refundResponse.status === "COMPLETED" ? "Completed" : "Pending";
            refundProcessedAt = new Date();
          } catch (paypalError) {
            const apiErrorDetails = paypalError.response?.data || null;
            const errMsg = apiErrorDetails?.message || paypalError.message || "PayPal refund failed";
            console.error("[Admin Order Refund Error] PayPal refund failed:", errMsg);
            throw new Error(`PayPal refund failed: ${errMsg}`);
          }
        }
      } else {
        refundStatus = "NotRequired";
      }
    } else {
      refundStatus = "NotRequired";
    }

    // Release coupon usage if applicable
    if (order.couponCode) {
      const coupon = await Coupon.findOne({ code: order.couponCode }).session(session);
      if (coupon) {
        coupon.usedCount = Math.max(0, coupon.usedCount - 1);
        coupon.usedBy = coupon.usedBy.filter(
          (uid) => uid.toString() !== order.user.toString()
        );
        await coupon.save({ session });
      }
    }

    // Update order status and details
    order.orderStatus = "CANCELLED";
    order.refundId = refundId;
    order.refundStatus = refundStatus;
    if (refundProcessedAt) order.refundProcessedAt = refundProcessedAt;
    if (refundFailureReason) order.refundFailureReason = refundFailureReason;

    // Set cancellation metadata
    order.cancellationStatus = "Approved";
    order.cancellationReason = "Cancelled by Admin";
    order.cancellationReviewedAt = Date.now();
    order.cancellationReviewedBy = req.user._id;
    order.expiresAt = undefined; // prevent deletion by TTL

    await order.save({ session });

    // Restock items if they were tracked
    if (order.inventoryTracked !== false) {
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: item.quantity } },
          { session }
        );
      }
    }

    // Reverse product sales/analytics if order was previously counted (i.e. if it was paid)
    if (order.isPaid) {
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { totalSales: -item.quantity } },
          { session }
        );
      }
    }

    await session.commitTransaction();
    session.endSession();

    // Send cancellation/refund notification email asynchronously
    sendCancellationApprovedEmail(order);

    res.status(200).json({
      success: true,
      message: order.isPaid && refundStatus === "Completed"
        ? "Order cancelled and refund processed successfully"
        : "Order cancelled successfully",
      order,
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("========== ADMIN CANCEL ORDER ERROR ==========");
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to cancel order by admin",
    });
  }
};

// ================= DELETE ORDER (ADMIN) =================
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined' || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Order ID format",
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Prevent deleting active paid orders (must be cancelled/failed first)
    if (order.isPaid && order.orderStatus !== "CANCELLED" && order.orderStatus !== "FAILED") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete an active paid order. Please cancel it first.",
      });
    }

    await Order.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Order record deleted successfully",
    });
  } catch (error) {
    console.error("Delete order error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete order",
    });
  }
};

// ================= AUTOMATIC CRON CLEANUP =================
// Automatically runs every minute to delete expired checkouts and restock their inventory
cron.schedule("* * * * *", () => {
  cleanupExpiredOrders().catch((err) =>
    console.error("[Cron Cleanup Error] Failed to run scheduled checkout cleanup:", err)
  );
});