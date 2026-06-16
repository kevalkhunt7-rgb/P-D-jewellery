import Product from "../model/productModel.js";
import slugify from "slugify";
import cloudinary from "../config/cloudinary.js";



// ================= CREATE PRODUCT =================
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      shortDescription,
      category,
      price,
      originalPrice,
      discountPercentage,
      stock,
      sku,
      material,
      plating,
      color,
      weight,
      dimensions,
      occasion,
      tags,
      seoTitle,
      seoDescription,
      isFeatured,
      isTrending,
      isNewArrival,
      status,
      defaultRating,
      metalType,
      purity,
      grossWeight,
      netWeight,
      metalColor,
      diamondWeight,
      diamondPieces,
      gemstoneDetails, // 🌟 Destructured string payload
      bisHallmarkNumber,
      certificateDetails,
      certificateFile,
      makingCharges,
      gst,
      priceBreakup,
      warranty,
      buybackEligibility,
    } = req.body;

    const images = req.files.map((file) => ({
      url: file.path,
    }));

    // Required Fields Validation
    if (
      !name ||
      !description ||
      !category ||
      !price ||
      !images ||
      images.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Images Must Be Array
    if (!Array.isArray(images)) {
      return res.status(400).json({
        success: false,
        message: "Images must be an array",
      });
    }

    // Generate Slug
    const slug = slugify(name, {
      lower: true,
      strict: true,
    });

    console.log(req.body);
    console.log(req.files);

    // Check Existing SKU
    if (sku) {
      const existingSku = await Product.findOne({ sku });

      if (existingSku) {
        return res.status(400).json({
          success: false,
          message: "SKU already exists",
        });
      }
    }

    // Auto Calculate Discount Percentage
    let calculatedDiscount = discountPercentage;

    if (originalPrice && originalPrice > price) {
      calculatedDiscount = Math.round(
        ((originalPrice - price) / originalPrice) * 100
      );
    }

    // Process tags and occasion if they are strings
    let processedTags = tags;
    if (typeof tags === 'string') {
      processedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== "");
    }

    let processedOccasion = occasion;
    if (typeof occasion === 'string') {
      processedOccasion = occasion.split(',').map(occ => occ.trim()).filter(occ => occ !== "");
    }

    // 🌟 THE FIX: Parse gemstoneDetails JSON string back into a JavaScript Array of Objects
    let processedGemstones = [];
    if (gemstoneDetails) {
      if (typeof gemstoneDetails === 'string') {
        try {
          processedGemstones = JSON.parse(gemstoneDetails);
        } catch (parseError) {
          console.error("Failed to parse gemstoneDetails string:", parseError);
          return res.status(400).json({
            success: false,
            message: "Invalid format for gemstone details array data",
          });
        }
      } else {
        processedGemstones = gemstoneDetails;
      }
    }

    // Create Product
    const product = await Product.create({
      name,
      slug,
      description,
      shortDescription,
      category,
      images,
      price,
      originalPrice,
      discountPercentage: calculatedDiscount,
      stock,
      sku,
      material,
      plating,
      color,
      weight,
      dimensions,
      occasion: processedOccasion,
      tags: processedTags,
      seoTitle,
      seoDescription,
      isFeatured,
      isTrending,
      isNewArrival,
      status,
      defaultRating,
      createdBy: req.user._id,
      metalType,
      purity,
      grossWeight,
      netWeight,
      metalColor,
      diamondWeight,
      diamondPieces,
      gemstoneDetails: processedGemstones, // 🌟 Pass the cleanly parsed array here
      bisHallmarkNumber,
      certificateDetails,
      certificateFile,
      makingCharges,
      gst,
      priceBreakup,
      warranty,
      buybackEligibility,
    });

    // Set initial ratings to defaultRating if no reviews yet
    if (defaultRating) {
      product.ratings = defaultRating;
      await product.save();
    }

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message // Appended this for easier production debugging logs
    });
  }
};





// ================= GET ALL PRODUCTS =================
export const getAllProducts = async (req, res) => {
  try {
    const search = req.query.search?.trim() || "";
    let query = {};

    // E-commerce Native Text Search
    if (search) {
      query.$text = { $search: search };
    }

    // Build the query execution
    let mongoQuery = Product.find(query);

    // If searching, project and sort by metadata relevance score
    if (search) {
      mongoQuery = mongoQuery
        .select({ score: { $meta: "textScore" } })
        .sort({ score: { $meta: "textScore" } });
    } else {
      // Default sort for browsing without a search keyword
      mongoQuery = mongoQuery.sort({ createdAt: -1 });
    }

    const products = await mongoQuery
      .populate("category")
      .populate("createdBy", "name email");

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


// ================= GET PRODUCT BY ID =================
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category")
      .populate("createdBy", "name email");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================= GET SINGLE PRODUCT =================
export const getSingleProduct = async (req, res) => {
  try {

    const product = await Product.findOne({
      slug: req.params.slug,
    })
      .populate("category")
      .populate("createdBy", "name email");


    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }


    res.status(200).json({
      success: true,
      product,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};





// ================= UPDATE PRODUCT =================
export const updateProduct = async (req, res) => {
  try {

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }


    // Update Slug If Name Changes
    if (req.body.name) {
      req.body.slug = slugify(req.body.name, {
        lower: true,
        strict: true,
      });
    }


    // Check SKU Duplicate
    if (req.body.sku) {

      const existingSku = await Product.findOne({
        sku: req.body.sku,
        _id: { $ne: req.params.id },
      });

      if (existingSku) {
        return res.status(400).json({
          success: false,
          message: "SKU already exists",
        });
      }
    }


    // Auto Discount Calculation
    if (
      req.body.originalPrice &&
      req.body.originalPrice > req.body.price
    ) {
      req.body.discountPercentage = Math.round(
        ((req.body.originalPrice - req.body.price) /
          req.body.originalPrice) *
        100
      );
    }

    // Process tags and occasion if they are strings
    if (typeof req.body.tags === 'string') {
      req.body.tags = req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== "");
    }

    if (typeof req.body.occasion === 'string') {
      req.body.occasion = req.body.occasion.split(',').map(occ => occ.trim()).filter(occ => occ !== "");
    }

    // If defaultRating is being updated and there are no reviews, update the ratings field too
    if (req.body.defaultRating !== undefined && product.numOfReviews === 0) {
      req.body.ratings = req.body.defaultRating;
    }

console.log(req.body);
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        returnDocument: "after",
        runValidators: true,
      }
    );


    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};





// ================= DELETE PRODUCT =================
export const deleteProduct = async (req, res) => {
  try {

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }


    // Delete Images From Cloudinary
    if (product.images && product.images.length > 0) {

      for (const image of product.images) {

        if (image.public_id) {
          await cloudinary.uploader.destroy(image.public_id);
        }
      }
    }


    // Delete Product
    await product.deleteOne();


    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};