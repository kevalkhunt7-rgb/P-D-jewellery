import Wishlist from "../model/wishlistModel.js";
import Product from "../model/productModel.js";



// ================= ADD TO WISHLIST =================
export const addToWishlist = async (req, res) => {
  try {

    const {
      productId,
    } = req.body;


    // Product Check
    const product = await Product.findById(
      productId
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }


    // Find Wishlist
    let wishlist = await Wishlist.findOne({
      user: req.user._id,
    });


    // Create Wishlist If Not Exists
    if (!wishlist) {

      wishlist = await Wishlist.create({
        user: req.user._id,
        products: [],
      });
    }


    // Check Existing Product
    const alreadyExists =
      wishlist.products.find(
        (item) =>
          item.product.toString() === productId
      );


    if (alreadyExists) {
      return res.status(400).json({
        success: false,
        message:
          "Product already in wishlist",
      });
    }


    // Add Product
    wishlist.products.push({
      product: productId,
    });


    await wishlist.save();


    res.status(200).json({
      success: true,
      message:
        "Product added to wishlist",
      wishlist,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message || (error && typeof error === 'object' ? JSON.stringify(error) : String(error)),
    });
  }
};





// ================= GET MY WISHLIST =================
export const getMyWishlist = async (req, res) => {
  try {

    const wishlist = await Wishlist.findOne({
      user: req.user._id,
    }).populate({
      path: "products.product",
      populate: {
        path: "category",
      },
    });


    if (!wishlist) {
      return res.status(200).json({
        success: true,
        products: [],
      });
    }


    res.status(200).json({
      success: true,
      wishlist,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message || (error && typeof error === 'object' ? JSON.stringify(error) : String(error)),
    });
  }
};





// ================= REMOVE FROM WISHLIST =================
export const removeFromWishlist = async (
  req,
  res
) => {
  try {

    const wishlist = await Wishlist.findOne({
      user: req.user._id,
    });


    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }


    wishlist.products =
      wishlist.products.filter(
        (item) =>
          item.product.toString() !==
          req.params.productId
      );


    await wishlist.save();


    res.status(200).json({
      success: true,
      message:
        "Product removed from wishlist",
      wishlist,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message || (error && typeof error === 'object' ? JSON.stringify(error) : String(error)),
    });
  }
};





// ================= CLEAR WISHLIST =================
export const clearWishlist = async (
  req,
  res
) => {
  try {

    const wishlist = await Wishlist.findOne({
      user: req.user._id,
    });


    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }


    wishlist.products = [];

    await wishlist.save();


    res.status(200).json({
      success: true,
      message:
        "Wishlist cleared successfully",
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message || (error && typeof error === 'object' ? JSON.stringify(error) : String(error)),
    });
  }
};