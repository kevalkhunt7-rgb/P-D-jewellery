import Coupon from "../model/couponModel.js";
import Cart from "../model/cartModel.js";
import Product from "../model/productModel.js";
import { calculatePriceBreakdown } from "../utils/pricingCalculator.js";
import { getStoreSettingsCached } from "../utils/settingsCache.js";
import { getCurrencyContext } from "../utils/currencyHelper.js";



// ================= CREATE COUPON =================
export const createCoupon = async (req, res) => {
  try {

    const {
      code,
      description,
      discountType,
      discountValue,
      minimumOrderAmount,
      maximumDiscountAmount,
      usageLimit,
      expiryDate,
      applicableCategories,
      applicableProducts,
      isActive,
    } = req.body;


    // Validation
    if (
      !code ||
      !discountType ||
      !discountValue ||
      !expiryDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }


    // Existing Coupon Check
    const existingCoupon = await Coupon.findOne({
      code: code.toUpperCase(),
    });

    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: "Coupon already exists",
      });
    }


    // Create Coupon
    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      minimumOrderAmount,
      maximumDiscountAmount,
      usageLimit,
      expiryDate,
      applicableCategories,
      applicableProducts,
      isActive,
      createdBy: req.user._id,
    });


    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      coupon,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message || (error && typeof error === 'object' ? JSON.stringify(error) : String(error)),
    });
  }
};





// ================= APPLY COUPON =================
export const applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;

    // Validation
    if (!code || typeof code !== "string") {
      return res.status(400).json({
        success: false,
        message: "Coupon code must be a string",
      });
    }

    // Resolve user cart to calculate real cartTotal in INR
    const cart = await Cart.findOne({ user: req.user._id }).populate("cartItems.product");
    if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    let recalculatedCartTotalINR = 0;
    for (const item of cart.cartItems) {
      if (item.product) {
        // Use the server-locked price of the item
        const itemPrice = item.lockedPricing?.salePrice || item.price;
        recalculatedCartTotalINR += itemPrice * item.quantity;
      }
    }

    // Find Coupon
    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid coupon code",
      });
    }

    // Expiry Check
    if (new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({
        success: false,
        message: "Coupon expired",
      });
    }

    const context = await getCurrencyContext(req);

    // Minimum Order Check (INR threshold checks)
    if (recalculatedCartTotalINR < coupon.minimumOrderAmount) {
      const minAmountMsg = context.currency === "USD" 
        ? `$${(coupon.minimumOrderAmount / context.conversionRate).toFixed(2)}` 
        : `₹${coupon.minimumOrderAmount.toLocaleString('en-IN')}`;
      return res.status(400).json({
        success: false,
        message: `Minimum order amount is ${minAmountMsg}`,
      });
    }

    // Per User Usage Count
    const userUsageCount = coupon.usedBy.filter(
      (id) => id.toString() === req.user._id.toString()
    ).length;

    // Per Customer Usage Limit Check
    if (coupon.usageLimit > 0 && userUsageCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: `You can only use this coupon ${coupon.usageLimit} times`,
      });
    }

    // Calculate Discount in INR
    let discountAmountINR = 0;

    // Percentage Discount
    if (coupon.discountType === "percentage") {
      discountAmountINR = (recalculatedCartTotalINR * coupon.discountValue) / 100;

      // Maximum Discount Limit
      if (coupon.maximumDiscountAmount > 0 && discountAmountINR > coupon.maximumDiscountAmount) {
        discountAmountINR = coupon.maximumDiscountAmount;
      }
    } else {
      // Fixed Discount
      discountAmountINR = coupon.discountValue;
    }

    // Prevent Negative Total
    if (discountAmountINR > recalculatedCartTotalINR) {
      discountAmountINR = recalculatedCartTotalINR;
    }

    const finalAmountINR = recalculatedCartTotalINR - discountAmountINR;

    // Convert values for client presentation
    let responseDiscountAmount = discountAmountINR;
    let responseFinalAmount = finalAmountINR;

    if (context.currency === "USD") {
      responseDiscountAmount = Number((discountAmountINR / context.conversionRate).toFixed(2));
      responseFinalAmount = Number((finalAmountINR / context.conversionRate).toFixed(2));
    }

    res.status(200).json({
      success: true,
      couponCode: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: responseDiscountAmount,
      finalAmount: responseFinalAmount,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message || (error && typeof error === 'object' ? JSON.stringify(error) : String(error)),
    });
  }
};



// ================= GET ALL COUPONS =================
export const getAllCoupons = async (req, res) => {
  try {

    const coupons = await Coupon.find()
      .sort({ createdAt: -1 });


    res.status(200).json({
      success: true,
      count: coupons.length,
      coupons,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message || (error && typeof error === 'object' ? JSON.stringify(error) : String(error)),
    });
  }
};





// ================= DELETE COUPON =================
export const deleteCoupon = async (req, res) => {
  try {

    const coupon = await Coupon.findById(
      req.params.id
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }


    await coupon.deleteOne();


    res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message || (error && typeof error === 'object' ? JSON.stringify(error) : String(error)),
    });
  }
};

// ================= UPDATE COUPON =================
export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    const {
      code,
      description,
      discountType,
      discountValue,
      minimumOrderAmount,
      maximumDiscountAmount,
      usageLimit,
      expiryDate,
      isActive,
    } = req.body;

    // Update fields
    if (code) coupon.code = code.toUpperCase();
    if (description !== undefined) coupon.description = description;
    if (discountType) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = discountValue;
    if (minimumOrderAmount !== undefined) coupon.minimumOrderAmount = minimumOrderAmount;
    if (maximumDiscountAmount !== undefined) coupon.maximumDiscountAmount = maximumDiscountAmount;
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
    if (expiryDate) coupon.expiryDate = expiryDate;
    if (isActive !== undefined) coupon.isActive = isActive;

    await coupon.save();

    res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      coupon,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message || (error && typeof error === 'object' ? JSON.stringify(error) : String(error)),
    });
  }
};