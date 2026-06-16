import Cart from "../model/cartModel.js";
import Product from "../model/productModel.js";




export const addToCart = async (req, res) => {
  try {

    const {
      productId,
      quantity,
    } = req.body;

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
      (item) =>
        item.product.toString() === productId
    );


    // Product Already Exists
    if (itemIndex > -1) {

      cart.cartItems[itemIndex].quantity += quantity;

    } else {

      // Add New Product
      cart.cartItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0]?.url || product.images[0] || "",
        price: product.price,
        quantity,
        stock: product.stock,
      });
    }


    // Recalculate Totals
    cart.totalItems = cart.cartItems.reduce(
      (acc, item) => acc + item.quantity,
      0
    );

    cart.totalPrice = cart.cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );


    await cart.save();

    // Populate product details for the frontend
    const updatedCart = await Cart.findById(cart._id).populate("cartItems.product");

    res.status(200).json({
      success: true,
      message: "Product added to cart",
      cart: updatedCart,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};





// ================= GET MY CART =================
export const getMyCart = async (req, res) => {
  try {

    const cart = await Cart.findOne({
      user: req.user._id,
    }).populate("cartItems.product");


    if (!cart) {
      return res.status(200).json({
        success: true,
        cartItems: [],
        totalItems: 0,
        totalPrice: 0,
      });
    }


    res.status(200).json({
      success: true,
      cart,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};





// ================= UPDATE CART ITEM =================
export const updateCartItem = async (req, res) => {
  try {

    const {
      quantity,
    } = req.body;


    const cart = await Cart.findOne({
      user: req.user._id,
    });


    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }


    const item = cart.cartItems.find(
      (item) =>
        item.product.toString() === req.params.productId
    );


    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }


    item.quantity = quantity;


    // Recalculate Totals
    cart.totalItems = cart.cartItems.reduce(
      (acc, item) => acc + item.quantity,
      0
    );

    cart.totalPrice = cart.cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );


    await cart.save();


    res.status(200).json({
      success: true,
      message: "Cart updated",
      cart,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};





// ================= REMOVE CART ITEM =================
export const removeCartItem = async (req, res) => {
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


    cart.cartItems = cart.cartItems.filter(
      (item) =>
        item.product.toString() !== req.params.productId
    );


    // Recalculate Totals
    cart.totalItems = cart.cartItems.reduce(
      (acc, item) => acc + item.quantity,
      0
    );

    cart.totalPrice = cart.cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );


    await cart.save();


    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      cart,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
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
      message: "Server Error",
    });
  }
};