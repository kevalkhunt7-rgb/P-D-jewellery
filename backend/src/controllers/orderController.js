import Order from "../model/orderModel.js";
import Product from "../model/productModel.js";
import Coupon from "../model/couponModel.js";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import mongoose from "mongoose"; // Added for structural validation guards

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});

// ================= CREATE RAZORPAY ORDER =================
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency } = req.body;

    const options = {
      amount: amount,
      currency: currency || "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create Razorpay order",
    });
  }
};


// ================= CREATE ORDER =================
export const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      paymentId,
      razorpayOrderId,
      razorpaySignature,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      couponCode,
      discountAmount,
    } = req.body;

    // Validation
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No order items",
      });
    }

    // Stock Check
    for (const item of orderItems) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `${product.name} is out of stock`,
        });
      }
    }

    // Create Order
    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      paymentInfo: {
        id: paymentId || "",
        status: "paid",
        razorpayOrderId: razorpayOrderId || "",
        razorpayPaymentId: paymentId || "",
        razorpaySignature: razorpaySignature || "",
      },
      isPaid: true,
      paidAt: Date.now(),
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      couponCode,
      discountAmount,
    });

    // Update Coupon Usage
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (coupon) {
        coupon.usedCount += 1;
        coupon.usedBy.push(req.user._id);
        await coupon.save();
      }
    }

    // Reduce Stock
    for (const item of orderItems) {
      const product = await Product.findById(item.product);

      product.stock -= item.quantity;
      product.totalSales += item.quantity;

      await product.save();
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


// ================= GET MY ORDERS =================
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


// ================= GET SINGLE ORDER =================
export const getSingleOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // 🛡️ Guard against literal "undefined" string paths or missing keys
    if (!id || id === 'undefined') {
      return res.status(400).json({
        success: false,
        message: "Order lookup failed: parameter ID was received as undefined",
      });
    }

    // 🛡️ Verify that param string matches Mongoose Hex format requirements
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "CastError prevention: Invalid Order ID pattern structure passed",
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

    res.status(200).json({
      success: true,
      order,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


// ================= GET ALL ORDERS (ADMIN) =================
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    const totalAmount = orders
      .filter(order => order.orderStatus?.toUpperCase() === "DELIVERED")
      .reduce((acc, order) => acc + order.totalPrice, 0);

    res.status(200).json({
      success: true,
      totalOrders: orders.length,
      totalAmount,
      orders,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


// ================= UPDATE ORDER STATUS =================
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // 🛡️ ObjectId structural checking guard
    if (!id || id === 'undefined' || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Action rejected: Provided ID format is invalid or undefined",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const newStatus = req.body.status.toUpperCase();
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
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


// ================= CANCEL ORDER =================
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // 🛡️ ObjectId structural checking guard
    if (!id || id === 'undefined' || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Action rejected: Provided ID format is invalid or undefined",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.orderStatus?.toUpperCase() === "DELIVERED") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a delivered order",
      });
    }

    order.orderStatus = "CANCELLED";
    await order.save();

    // Restock items
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        product.totalSales -= item.quantity;
        await product.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};