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
import { getCurrencyContext } from "../utils/currencyHelper.js";

// ================= LOCALIZED ORDER SERIALIZATION =================
// Customer-facing serializer: converts to display currency (USD for foreign orders)
const serializeOrder = async (order, req) => {
  if (!order) return order;
  const context = await getCurrencyContext(req);
  const orderObj = order.toObject ? order.toObject() : order;

  // Get the currency to use: prefer the order's display currency
  const useCurrency = orderObj.displayCurrency || context.currency;
  const useSymbol = useCurrency === "USD" ? "$" : "₹";

  orderObj.currency = useCurrency;
  orderObj.currencySymbol = useSymbol;

  // For customer-facing responses, use display values (original paid currency)
  orderObj.itemsPrice = orderObj.displayItemsPrice || orderObj.itemsPrice;
  orderObj.shippingPrice = orderObj.displayShippingPrice || orderObj.shippingPrice;
  orderObj.taxPrice = orderObj.displayTaxPrice || orderObj.taxPrice;
  orderObj.totalPrice = orderObj.displayTotalPrice || orderObj.totalPrice;
  orderObj.discountAmount = orderObj.displayCurrency === "USD" && orderObj.exchangeRate
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
  // "CANCELLED" is deliberately excluded from the values updateOrderStatus
  // accepts. Cancellation must go through requestCancellation /
  // approveCancellation so refunds and stock restoration happen correctly.
];

const PAYMENT_METHODS = ["Razorpay", "ONLINE", "PAYPAL"];

// ================= CREATE RAZORPAY ORDER =================
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency } = req.body;

    // BUG FIX: amount was never validated, so a missing/negative/zero
    // amount would be sent straight to Razorpay's API.
    if (!amount || typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "A valid positive amount is required",
      });
    }

    const options = {
      amount: Math.round(amount * 100), // ₹100 => 10000 paise
      currency: currency || "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Razorpay Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create Razorpay order",
    });
  }
};

// ================= CREATE ORDER (SECURE CHECKOUT) =================
export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      paymentId,
      razorpayOrderId,
      razorpaySignature,
      paypalOrderId,
      shippingPrice = 0,
      taxPrice = 0,
      couponCode,
      discountAmount: requestedDiscount = 0,
    } = req.body;

    // Get currency context
    const context = await getCurrencyContext(req);

    // Validation
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No order items",
      });
    }

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

    // If payment method is Razorpay, verify signature; otherwise, for PayPal, just check we have paymentId and paypalOrderId
    if (paymentMethod === "Razorpay" || paymentMethod === "ONLINE") {
      if (!razorpayOrderId || !paymentId || !razorpaySignature) {
        return res.status(400).json({
          success: false,
          message: "Missing payment verification details",
        });
      }

      // Verify payment signature before touching stock or writing to the DB
      const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
        .update(`${razorpayOrderId}|${paymentId}`)
        .digest("hex");

      if (generatedSignature !== razorpaySignature) {
        return res.status(400).json({
          success: false,
          message: "Payment verification failed",
        });
      }
    } else if (paymentMethod === "PAYPAL") {
      if (!paymentId || !paypalOrderId) {
        return res.status(400).json({
          success: false,
          message: "Missing PayPal payment details",
        });
      }
    }

    // Fetch active gold rate from StoreSettings
    const storeSettings = await StoreSettings.findOne().session(session) ||
      await StoreSettings.create([{ goldRate24kt: 8000 }], { session }).then(arr => arr[0]);
    const goldRate24kt = storeSettings.goldRate24kt;

    // Fetch order rules from Settings
    const settings = await Settings.findOne().session(session) ||
      await Settings.create([{}], { session }).then(arr => arr[0]);
    const shippingCharge = settings.order?.shippingCharge || 0;
    const freeShippingMinAmount = settings.order?.freeShippingMinAmount || 0;
    const taxPercentage = settings.order?.taxPercentage || 0;

    let itemsPrice = 0;
    const verifiedOrderItems = [];

    // Rebuild and calculate price breakdown on server-side securely
    for (const item of orderItems) {
      const product = await Product.findById(item.product).session(session);

      if (!product) {
        throw new Error(`Product not found: ${item.name || item.product}`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`${product.name} is out of stock`);
      }

      const breakdown = calculatePriceBreakdown({
        goldRate24kt,
        purity: product.purity,
        netWeight: product.netWeight,
        makingChargeType: product.makingChargeType,
        makingChargeValue: product.makingChargeValue,
        discountPercentage: product.discountPercentage || 0,
      });

      const itemTotalPrice = Number((breakdown.salePrice * item.quantity).toFixed(2));
      itemsPrice += itemTotalPrice;

      // Calculate display prices for order item
      let itemDisplayPrice = breakdown.salePrice;
      let itemDisplaySalePrice = breakdown.salePrice;
      let itemDisplayOriginalPrice = breakdown.originalPrice;
      let itemDisplayTotalPrice = itemTotalPrice;

      if (context.currency === "USD") {
        itemDisplayPrice = Number((breakdown.salePrice / context.conversionRate).toFixed(2));
        itemDisplaySalePrice = Number((breakdown.salePrice / context.conversionRate).toFixed(2));
        itemDisplayOriginalPrice = Number((breakdown.originalPrice / context.conversionRate).toFixed(2));
        itemDisplayTotalPrice = Number((itemTotalPrice / context.conversionRate).toFixed(2));
      }

      verifiedOrderItems.push({
        product: product._id,
        name: product.name,
        image: item.image || (product.images?.[0]?.url || ""),
        price: breakdown.salePrice, // server computed price (INR)
        quantity: item.quantity,

        // Snapshot parameters
        goldRate24kt,
        purity: product.purity,
        netWeight: product.netWeight,
        makingChargeType: product.makingChargeType,
        makingChargeValue: product.makingChargeValue,
        metalValue: breakdown.metalValue,
        makingCharge: breakdown.makingCharge,
        gstOnMetal: breakdown.gstOnMetal,
        gstOnLabour: breakdown.gstOnLabour,
        originalPrice: breakdown.originalPrice,
        discountPercentage: breakdown.discountPercentage,
        salePrice: breakdown.salePrice,
        totalPrice: itemTotalPrice,

        // New display fields for order items
        displayCurrency: context.currency,
        displayPrice: itemDisplayPrice,
        displaySalePrice: itemDisplaySalePrice,
        displayOriginalPrice: itemDisplayOriginalPrice,
        displayTotalPrice: itemDisplayTotalPrice,
      });
    }

    // Calculate dynamic shipping cost
    const calculatedShippingPrice = (freeShippingMinAmount > 0 && itemsPrice >= freeShippingMinAmount) ? 0 : shippingCharge;

    // Validate and process coupon if applied
    let discountAmount = 0;
    let appliedCouponCode = "";
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() }).session(session);
      if (!coupon) {
        throw new Error("Invalid coupon code");
      }
      if (itemsPrice < coupon.minimumOrderAmount) {
        throw new Error(`Minimum order amount for coupon is not met`);
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

    // Compute dynamic boutique taxes
    const calculatedTaxPrice = Number(((itemsPrice - discountAmount) * (taxPercentage / 100)).toFixed(2));

    // Master grand total
    const totalPrice = Number((itemsPrice + calculatedShippingPrice + calculatedTaxPrice - discountAmount).toFixed(2));

    // Calculate display values
    const displayCurrency = context.currency;
    let displayItemsPrice = itemsPrice;
    let displayShippingPrice = calculatedShippingPrice;
    let displayTaxPrice = calculatedTaxPrice;
    let displayTotalPrice = totalPrice;

    if (displayCurrency === "USD") {
      displayItemsPrice = Number((itemsPrice / context.conversionRate).toFixed(2));
      displayShippingPrice = Number((calculatedShippingPrice / context.conversionRate).toFixed(2));
      displayTaxPrice = Number((calculatedTaxPrice / context.conversionRate).toFixed(2));
      displayTotalPrice = Number((totalPrice / context.conversionRate).toFixed(2));
    }

    // Reduce stock and increase totalSales atomically inside the transaction
    for (const item of verifiedOrderItems) {
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity, totalSales: item.quantity } },
        { new: true, session }
      );

      if (!updatedProduct) {
        throw new Error(`${item.name} went out of stock while placing your order`);
      }
    }

    // Create Order inside session
    let paymentInfo;
    if (paymentMethod === "Razorpay" || paymentMethod === "ONLINE") {
      paymentInfo = {
        id: paymentId,
        status: "paid",
        razorpayOrderId,
        razorpayPaymentId: paymentId,
        razorpaySignature,
      };
    } else if (paymentMethod === "PAYPAL") {
      paymentInfo = {
        id: paymentId,
        status: "COMPLETED",
        paypalOrderId,
      };
    }

    const [order] = await Order.create([{
      user: req.user._id,
      orderItems: verifiedOrderItems,
      shippingAddress,
      paymentMethod,
      paymentInfo,
      isPaid: true,
      paidAt: Date.now(),
      itemsPrice: Number(itemsPrice.toFixed(2)), // Always INR
      shippingPrice: calculatedShippingPrice, // Always INR
      taxPrice: calculatedTaxPrice, // Always INR
      totalPrice, // Always INR
      couponCode: appliedCouponCode,
      discountAmount: Number(discountAmount.toFixed(2)), // Always INR

      // Display fields for customer-facing views
      displayCurrency,
      displayItemsPrice,
      displayShippingPrice,
      displayTaxPrice,
      displayTotalPrice,
      exchangeRate: context.conversionRate,

      // Original payment currency and amount (what customer actually paid)
      paidCurrency: displayCurrency, // USD for foreign orders, INR for domestic
      paidAmount: displayTotalPrice, // The amount in the currency the customer paid
    }], { session });

    // Update coupon usage inside session
    if (appliedCouponCode) {
      await Coupon.updateOne(
        { code: appliedCouponCode },
        { $inc: { usedCount: 1 }, $push: { usedBy: req.user._id } },
        { session }
      );
    }

    // Clear cart upon successful order placement
    const cart = await Cart.findOne({ user: req.user._id }).session(session);
    if (cart) {
      cart.cartItems = [];
      cart.totalItems = 0;
      cart.totalPrice = 0;
      await cart.save({ session });
    }

    // Commit dynamic pricing order transaction
    await session.commitTransaction();

    const serializedOrder = await serializeOrder(order, req);
    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: serializedOrder,
    });
  } catch (error) {
  await session.abortTransaction();

  console.error("========== ORDER ERROR ==========");
  console.error(error);
  console.error(error.stack);
  console.error("================================");

  res.status(500).json({
    success: false,
    message: error.message,
  });

  } finally {
    session.endSession();
  }
};


// ================= GET MY ORDERS =================
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
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
      message: error.message || "Server Error",
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

    const order = await Order.findById(id)
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
      message: error.message || "Server Error",
    });
  }
};


// ================= GET ALL ORDERS (ADMIN) =================
export const getAllOrders = async (req, res) => {
  try {
    // NOTE: this loads every order into memory with no pagination. Fine for
    // a small catalog, but worth adding page/limit query params before this
    // gets used against a large order collection in production.
    const orders = await Order.find()
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
      message: error.message || "Server Error",
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

    order.orderStatus = newStatus;

    if (newStatus === "DELIVERED") {
      order.deliveredAt = Date.now();
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated",
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
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

    order.cancellationStatus = "Requested";
    order.cancellationReason = cancellationReason;
    order.cancellationRequestedAt = Date.now();
    order.refundStatus = order.isPaid ? "Pending" : "NotRequired";
    order.refundAmount = order.totalPrice;

    await order.save();

    res.status(200).json({
      success: true,
      message: "Cancellation request submitted successfully",
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
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
      message: error.message || "Server Error",
    });
  }
};

// ================= SYNC REFUND STATUS FROM RAZORPAY (ADMIN) =================
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

    // Fetch refund from Razorpay
    const refund = await razorpay.refunds.fetch(order.refundId);

    // Update order based on Razorpay status
    let newRefundStatus = order.refundStatus;
    let refundCompletedAt = order.refundCompletedAt;
    let refundFailureReason = order.refundFailureReason;

    if (refund.status === "processed") {
      newRefundStatus = "Completed";
      refundCompletedAt = new Date();
    } else if (refund.status === "failed") {
      newRefundStatus = "Failed";
      refundFailureReason = refund.error_description || "Refund failed";
    } else if (refund.status === "pending") {
      newRefundStatus = "Pending";
    }

    order.refundStatus = newRefundStatus;
    order.refundCompletedAt = refundCompletedAt;
    order.refundFailureReason = refundFailureReason;

    await order.save();

    res.status(200).json({
      success: true,
      message: "Refund status synced successfully",
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
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

    if (event.event === "refund.processed") {
      // Find order by refund ID
      const refundId = event.payload.refund.entity.id;
      const order = await Order.findOne({ refundId });

      if (order) {
        order.refundStatus = "Completed";
        order.refundCompletedAt = new Date();
        await order.save();
      }
    } else if (event.event === "refund.failed") {
      // Find order by refund ID
      const refundId = event.payload.refund.entity.id;
      const order = await Order.findOne({ refundId });

      if (order) {
        order.refundStatus = "Failed";
        order.refundFailureReason = event.payload.refund.entity.error_description || "Refund failed";
        await order.save();
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
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
    order.cancellationStatus = "None";
    order.cancellationReason = "";
    order.cancellationRequestedAt = undefined;
    order.cancellationReviewedAt = undefined;
    order.cancellationReviewedBy = undefined;
    order.refundStatus = "NotRequired";
    order.refundAmount = 0;
    order.refundId = "";
    order.refundProcessedAt = undefined;
    order.refundCompletedAt = undefined;
    order.refundFailureReason = "";
    order.refundInitiatedAt = undefined;

    await order.save();

    res.status(200).json({
      success: true,
      message: "Cancellation record deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
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
    if (order.isPaid && order.paymentInfo?.razorpayPaymentId) {
      try {
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
      } catch (razorpayError) {
        console.error("Razorpay refund failed:", razorpayError);
        order.refundStatus = "Failed";
        // BUG FIX: refundFailureReason exists on the schema but was never
        // being set, so failed refunds left no trace of why.
        order.refundFailureReason =
          razorpayError?.error?.description || razorpayError.message || "Refund failed";
      }
    } else if (order.isPaid) {
      // Paid but missing a Razorpay payment ID on record — flag it rather
      // than silently leaving refundStatus stuck on "Pending" forever.
      order.refundStatus = "Failed";
      order.refundFailureReason = "No Razorpay payment ID on record for this order";
    } else {
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

    order.orderStatus = "CANCELLED";
    order.cancellationStatus = "Approved";
    order.cancellationReviewedAt = Date.now();
    order.cancellationReviewedBy = req.user._id;

    await order.save();

    // Restock items. BUG FIX: switched from fetch -> mutate -> save per
    // item to an atomic $inc update, avoiding a race with any concurrent
    // stock changes on the same product.
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, totalSales: -item.quantity },
      });
    }

    res.status(200).json({
      success: true,
      message: "Cancellation approved and refund processed",
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
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

    order.cancellationStatus = "Rejected";
    order.cancellationReason = rejectionReason;
    order.cancellationReviewedAt = Date.now();
    order.cancellationReviewedBy = req.user._id;
    order.refundStatus = "NotRequired";

    await order.save();

    res.status(200).json({
      success: true,
      message: "Cancellation request rejected",
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};