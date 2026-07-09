import Cart from "../model/cartModel.js";
import Product from "../model/productModel.js";
import { calculatePriceBreakdown } from "../utils/pricingCalculator.js";
import { getStoreSettingsCached } from "../utils/settingsCache.js";
import { getCurrencyContext } from "../utils/currencyHelper.js";

// ================= LOCALIZED CART SERIALIZATION =================
const serializeCart = async (cart, req) => {
  if (!cart) return cart;
  
  const context = await getCurrencyContext(req);
  const cartObj = cart.toObject ? cart.toObject() : cart;

  cartObj.currency = context.currency;
  cartObj.currencySymbol = context.currencySymbol;

  if (context.currency === "USD") {
    cartObj.totalPrice = Number((cartObj.totalPrice / context.conversionRate).toFixed(2));
    if (cartObj.cartItems) {
      cartObj.cartItems = cartObj.cartItems.map(item => {
        item.price = Number((item.price / context.conversionRate).toFixed(2));
        if (item.product) {
          // Backward compat: update populated product details
          item.product.price = Number((item.product.price / context.conversionRate).toFixed(2));
          if (item.product.originalPrice) {
            item.product.originalPrice = Number((item.product.originalPrice / context.conversionRate).toFixed(2));
          }
          item.product.currency = context.currency;
          item.product.currencySymbol = context.currencySymbol;
          if (item.product.pricing) {
            item.product.pricing.metalValue = Number((item.product.pricing.metalValue / context.conversionRate).toFixed(2));
            item.product.pricing.makingCharge = Number((item.product.pricing.makingCharge / context.conversionRate).toFixed(2));
            if (item.product.pricing.cgst) item.product.pricing.cgst = Number((item.product.pricing.cgst / context.conversionRate).toFixed(2));
            if (item.product.pricing.sgst) item.product.pricing.sgst = Number((item.product.pricing.sgst / context.conversionRate).toFixed(2));
            item.product.pricing.originalPrice = Number((item.product.pricing.originalPrice / context.conversionRate).toFixed(2));
            item.product.pricing.salePrice = Number((item.product.pricing.salePrice / context.conversionRate).toFixed(2));
          }
        }
        // Format lockedPricing details if present
        if (item.lockedPricing) {
          item.lockedPricing.metalValue = Number((item.lockedPricing.metalValue / context.conversionRate).toFixed(2));
          item.lockedPricing.makingCharge = Number((item.lockedPricing.makingCharge / context.conversionRate).toFixed(2));
          item.lockedPricing.cgst = Number((item.lockedPricing.cgst / context.conversionRate).toFixed(2));
          item.lockedPricing.sgst = Number((item.lockedPricing.sgst / context.conversionRate).toFixed(2));
          item.lockedPricing.originalPrice = Number((item.lockedPricing.originalPrice / context.conversionRate).toFixed(2));
          item.lockedPricing.salePrice = Number((item.lockedPricing.salePrice / context.conversionRate).toFixed(2));
        }
        return item;
      });
    }
  } else {
    if (cartObj.cartItems) {
      cartObj.cartItems = cartObj.cartItems.map(item => {
        if (item.product) {
          item.product.currency = context.currency;
          item.product.currencySymbol = context.currencySymbol;
        }
        return item;
      });
    }
  }

  return cartObj;
};

// ================= DYNAMIC CART RECALCULATION (SUM TOTALS ONLY) =================
const recalculateCartTotals = async (cart) => {
  if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
    if (cart) {
      cart.totalItems = 0;
      cart.totalPrice = 0;
    }
    return cart;
  }

  const storeSettings = await getStoreSettingsCached();
  const goldRate24kt = storeSettings.goldRate24kt;

  let totalItems = 0;
  let totalPrice = 0;

  for (const item of cart.cartItems) {
    // If lockedPricing is missing (e.g. legacy/migration carts), initialize it
    if (!item.lockedPricing && item.product) {
      const product = item.product;
      const calculation = calculatePriceBreakdown({
        goldRate24kt,
        purity: product.purity || "22KT",
        netWeight: product.netWeight || 0,
        makingChargeType: product.makingChargeType || "per_gram",
        makingChargeValue: product.makingChargeValue || 0,
        discountPercentage: product.discountPercentage || 0,
      });

      item.lockedPricing = {
        goldRate24kt,
        purity: product.purity || "22KT",
        netWeight: product.netWeight || 0,
        makingChargeType: product.makingChargeType || "per_gram",
        makingChargeValue: product.makingChargeValue || 0,
        metalValue: calculation.metalValue,
        makingCharge: calculation.makingCharge,
        cgst: calculation.cgst,
        sgst: calculation.sgst,
        originalPrice: calculation.originalPrice,
        discountPercentage: calculation.discountPercentage,
        salePrice: calculation.salePrice,
        lockedAt: new Date(),
      };
      item.price = calculation.salePrice;
    }

    if (item.lockedPricing) {
      totalPrice += item.lockedPricing.salePrice * item.quantity;
      totalItems += item.quantity;
    }
  }

  cart.totalItems = totalItems;
  cart.totalPrice = Number(totalPrice.toFixed(2));
  return cart;
};

// ================= ADD TO CART =================
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    console.log("REQ BODY:", req.body);
    console.log("USER:", req.user);
    
    // Product Check
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Product is not active and cannot be purchased",
      });
    }

    // Stock Check
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock",
      });
    }

    // Find User Cart
    let cart = await Cart.findOne({
      user: req.user._id,
    });

    // If Cart Not Exists
    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        cartItems: [],
      });
    }

    // Check Existing Product
    const itemIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId
    );

    const storeSettings = await getStoreSettingsCached();
    const goldRate24kt = storeSettings.goldRate24kt;
    const calculation = calculatePriceBreakdown({
      goldRate24kt,
      purity: product.purity || "22KT",
      netWeight: product.netWeight || 0,
      makingChargeType: product.makingChargeType || "per_gram",
      makingChargeValue: product.makingChargeValue || 0,
      discountPercentage: product.discountPercentage || 0,
    });

    const lockedPricing = {
      goldRate24kt,
      purity: product.purity || "22KT",
      netWeight: product.netWeight || 0,
      makingChargeType: product.makingChargeType || "per_gram",
      makingChargeValue: product.makingChargeValue || 0,
      metalValue: calculation.metalValue,
      makingCharge: calculation.makingCharge,
      cgst: calculation.cgst,
      sgst: calculation.sgst,
      originalPrice: calculation.originalPrice,
      discountPercentage: calculation.discountPercentage,
      salePrice: calculation.salePrice,
      lockedAt: new Date(),
    };

    // Product Already Exists
    if (itemIndex > -1) {
      cart.cartItems[itemIndex].quantity += quantity;
      cart.cartItems[itemIndex].lockedPricing = lockedPricing;
      cart.cartItems[itemIndex].price = calculation.salePrice;
    } else {
      // Add New Product
      cart.cartItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0]?.url || product.images[0] || "",
        price: calculation.salePrice,
        quantity,
        stock: product.stock,
        lockedPricing,
      });
    }

    // Recalculate Totals (Sum only)
    await cart.populate("cartItems.product");
    await recalculateCartTotals(cart);
    await cart.save();

    const serializedCart = await serializeCart(cart, req);
    res.status(200).json({
      success: true,
      message: "Product added to cart",
      cart: serializedCart,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || String(error),
    });
  }
};

// ================= GET MY CART =================
export const getMyCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({
      user: req.user._id,
    }).populate("cartItems.product");

    if (!cart) {
      const context = await getCurrencyContext(req);
      return res.status(200).json({
        success: true,
        cart: {
          cartItems: [],
          totalItems: 0,
          totalPrice: 0,
          currency: context.currency,
          currencySymbol: context.currencySymbol,
        }
      });
    }

    // Recalculate totals without changing existing locked prices
    await recalculateCartTotals(cart);
    await cart.save();

    const serializedCart = await serializeCart(cart, req);
    res.status(200).json({
      success: true,
      cart: serializedCart,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message || String(error),
    });
  }
};

// ================= UPDATE CART ITEM =================
export const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;

    let cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const item = cart.cartItems.find(
      (item) => item.product.toString() === req.params.productId
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    // Verify product still exists and stock is available
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product no longer exists",
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items left in stock`,
      });
    }

    item.quantity = quantity;

    // Recalculate Totals (keeps locked price, just adjusts quantity summation)
    await cart.populate("cartItems.product");
    await recalculateCartTotals(cart);
    await cart.save();

    const serializedCart = await serializeCart(cart, req);
    res.status(200).json({
      success: true,
      message: "Cart updated",
      cart: serializedCart,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message || String(error),
    });
  }
};

// ================= REMOVE CART ITEM =================
export const removeCartItem = async (req, res) => {
  try {
    let cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.cartItems = cart.cartItems.filter(
      (item) => item.product.toString() !== req.params.productId
    );

    // Recalculate Totals
    await cart.populate("cartItems.product");
    await recalculateCartTotals(cart);
    await cart.save();

    const serializedCart = await serializeCart(cart, req);
    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      cart: serializedCart,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message || String(error),
    });
  }
};

// ================= CLEAR CART =================
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.cartItems = [];
    cart.totalItems = 0;
    cart.totalPrice = 0;

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message || String(error),
    });
  }
};

// ================= REFRESH/RE-LOCK CART PRICES =================
export const refreshCartPrices = async (req, res) => {
  try {
    let cart = await Cart.findOne({
      user: req.user._id,
    }).populate("cartItems.product");

    if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    const storeSettings = await getStoreSettingsCached();
    const goldRate24kt = storeSettings.goldRate24kt;

    for (const item of cart.cartItems) {
      const product = item.product;
      if (product) {
        // Recalculate breakdown using current gold rate
        const calculation = calculatePriceBreakdown({
          goldRate24kt,
          purity: product.purity || "22KT",
          netWeight: product.netWeight || 0,
          makingChargeType: product.makingChargeType || "per_gram",
          makingChargeValue: product.makingChargeValue || 0,
          discountPercentage: product.discountPercentage || 0,
        });

        item.lockedPricing = {
          goldRate24kt,
          purity: product.purity || "22KT",
          netWeight: product.netWeight || 0,
          makingChargeType: product.makingChargeType || "per_gram",
          makingChargeValue: product.makingChargeValue || 0,
          metalValue: calculation.metalValue,
          makingCharge: calculation.makingCharge,
          cgst: calculation.cgst,
          sgst: calculation.sgst,
          originalPrice: calculation.originalPrice,
          discountPercentage: calculation.discountPercentage,
          salePrice: calculation.salePrice,
          lockedAt: new Date(),
        };
        item.price = calculation.salePrice;
      }
    }

    await recalculateCartTotals(cart);
    await cart.save();

    const serializedCart = await serializeCart(cart, req);
    res.status(200).json({
      success: true,
      message: "Cart prices successfully updated to current gold rates",
      cart: serializedCart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || String(error),
    });
  }
};