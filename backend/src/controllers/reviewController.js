import Review from "../model/reviewModel.js";
import Product from "../model/productModel.js";
import Order from "../model/orderModel.js";
import cloudinary from "../config/cloudinary.js";



// ================= CREATE REVIEW =================
export const createReview = async (req, res) => {
  try {

    const {
      productId,
      rating,
      comment,
    } = req.body;


    // Validation
    if (!productId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }


    // Product Check
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }


    // Already Reviewed Check
    const existingReview = await Review.findOne({
      product: productId,
      user: req.user._id,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You already reviewed this product",
      });
    }


    // Check Verified Purchase
    const order = await Order.findOne({
      user: req.user._id,
      "orderItems.product": productId,
      orderStatus: "Delivered",
    });

    let verifiedPurchase = false;

    if (order) {
      verifiedPurchase = true;
    }


    // Upload Images
    let uploadedImages = [];

    if (req.files && req.files.length > 0) {

      uploadedImages = req.files.map((file) => ({
        url: file.path,
        public_id: file.filename,
      }));
    }


    // Create Review
    const review = await Review.create({
      product: productId,
      user: req.user._id,
      name: req.user.name,
      rating,
      comment,
      images: uploadedImages,
      isVerifiedPurchase: verifiedPurchase,
    });


    // Update Product Rating
    const reviews = await Review.find({
      product: productId,
      isApproved: true,
    });

    let averageRating;
    if (reviews.length === 0) {
      averageRating = product.defaultRating;
    } else {
      averageRating =
        reviews.reduce((acc, item) => acc + item.rating, 0) /
        reviews.length;
    }

    product.ratings = averageRating;
    product.numOfReviews = reviews.length;

    await product.save();


    res.status(201).json({
      success: true,
      message: "Review added successfully",
      review,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};





// ================= GET PRODUCT REVIEWS =================
export const getProductReviews = async (req, res) => {
  try {

    const reviews = await Review.find({
      product: req.params.productId,
      isApproved: true,
    })
      .populate("user", "name")
      .sort({ createdAt: -1 });


    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};





// ================= DELETE REVIEW =================
export const deleteReview = async (req, res) => {
  try {

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }


    // Delete Cloudinary Images
    if (review.images && review.images.length > 0) {

      for (const image of review.images) {

        if (image.public_id) {
          await cloudinary.uploader.destroy(image.public_id);
        }
      }
    }


    const productId = review.product;

    await review.deleteOne();


    // Recalculate Product Ratings
    const reviews = await Review.find({
      product: productId,
      isApproved: true,
    });

    const product = await Product.findById(productId);
    let averageRating;
    if (reviews.length === 0) {
      averageRating = product.defaultRating;
    } else {
      averageRating =
        reviews.reduce((acc, item) => acc + item.rating, 0) /
        reviews.length;
    }

    await Product.findByIdAndUpdate(productId, {
      ratings: averageRating,
      numOfReviews: reviews.length,
    });


    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};





// ================= GET ALL REVIEWS (ADMIN) =================
export const getAllReviews = async (req, res) => {
  try {

    const reviews = await Review.find()
      .populate("user", "name email")
      .populate("product", "name")
      .sort({ createdAt: -1 });


    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};