import Coupon from "../model/couponModel.js";



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
      message: "Server Error",
    });
  }
};





// ================= APPLY COUPON =================
export const applyCoupon = async (req, res) => {
  try {

    const {
      code,
      cartTotal,
    } = req.body;


    // Validation
    if (!code || !cartTotal) {
      return res.status(400).json({
        success: false,
        message: "Coupon code and cart total are required",
      });
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


    // Minimum Order Check
    if (cartTotal < coupon.minimumOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount is ₹${coupon.minimumOrderAmount}`,
      });
    }


    // Per User Usage Count
    const userUsageCount = coupon.usedBy.filter(
      (id) =>
        id.toString() === req.user._id.toString()
    ).length;


    // Per Customer Usage Limit Check
    if (
      coupon.usageLimit > 0 &&
      userUsageCount >= coupon.usageLimit
    ) {
      return res.status(400).json({
        success: false,
        message: `You can only use this coupon ${coupon.usageLimit} times`,
      });
    }


    // Calculate Discount
    let discountAmount = 0;


    // Percentage Discount
    if (coupon.discountType === "percentage") {

      discountAmount =
        (cartTotal * coupon.discountValue) / 100;


      // Maximum Discount Limit
      if (
        coupon.maximumDiscountAmount > 0 &&
        discountAmount > coupon.maximumDiscountAmount
      ) {
        discountAmount =
          coupon.maximumDiscountAmount;
      }

    } else {

      // Fixed Discount
      discountAmount = coupon.discountValue;
    }


    // Prevent Negative Total
    if (discountAmount > cartTotal) {
      discountAmount = cartTotal;
    }


    const finalAmount =
      cartTotal - discountAmount;


    res.status(200).json({
      success: true,
      couponCode: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      finalAmount,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
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
      message: "Server Error",
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
      message: "Server Error",
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
      message: "Server Error",
    });
  }
};