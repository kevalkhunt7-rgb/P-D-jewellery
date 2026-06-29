import Product from "../model/productModel.js";
import slugify from "slugify";
import cloudinary from "../config/cloudinary.js";
import { calculatePriceBreakdown } from "../utils/pricingCalculator.js";
import { getStoreSettingsCached } from "../utils/settingsCache.js";
import { getCurrencyContext } from "../utils/currencyHelper.js";


// ================= DYNAMIC PRICING HELPERS =================
const injectDynamicPricing = async (product, req) => {
  if (!product) return null;
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

  const productObj = product.toObject ? product.toObject() : product;
  const currencyCtx = await getCurrencyContext(req);

  let salePrice = calculation.salePrice;
  let originalPrice = calculation.originalPrice;
  let metalValue = calculation.metalValue;
  let makingCharge = calculation.makingCharge;
  let cgst = calculation.cgst;
  let sgst = calculation.sgst;

if (currencyCtx.currency === "USD") {
  salePrice = Number((salePrice / currencyCtx.conversionRate).toFixed(2));
  originalPrice = Number((originalPrice / currencyCtx.conversionRate).toFixed(2));
  metalValue = Number((metalValue / currencyCtx.conversionRate).toFixed(2));
  makingCharge = Number((makingCharge / currencyCtx.conversionRate).toFixed(2));

  if (cgst !== undefined) {
    cgst = Number((cgst / currencyCtx.conversionRate).toFixed(2));
  }

  if (sgst !== undefined) {
    sgst = Number((sgst / currencyCtx.conversionRate).toFixed(2));
  }
}

  return {
    ...productObj,
    price: salePrice, // root-level for backward compatibility
    originalPrice: originalPrice, // root-level for backward compatibility
    currency: currencyCtx.currency,
    currencySymbol: currencyCtx.currencySymbol,
    pricing: {
      metalValue,
      makingCharge,
      cgst,
      sgst,
      gstOnMetal: calculation.gstOnMetal !== undefined ? Number((calculation.gstOnMetal / currencyCtx.conversionRate).toFixed(2)) : undefined,
      gstOnLabour: calculation.gstOnLabour !== undefined ? Number((calculation.gstOnLabour / currencyCtx.conversionRate).toFixed(2)) : undefined,
      originalPrice,
      salePrice,
      discountPercentage: calculation.discountPercentage,
    }
  };
};

const injectDynamicPricingArray = async (products, req) => {
  if (!products || products.length === 0) return [];

  const currencyCtx = await getCurrencyContext(req);
  const storeSettings = await getStoreSettingsCached();
  const goldRate24kt = storeSettings.goldRate24kt;

  return products.map((product) => {

    // ✅ ALWAYS normalize FIRST
    const productObj =
      typeof product.toObject === "function"
        ? product.toObject()
        : product;

    // =========================
    // PRICE CALCULATION (INR BASE)
    // =========================
    const calculation = calculatePriceBreakdown({
      goldRate24kt,
      purity: productObj.purity || "22KT",
      netWeight: productObj.netWeight || 0,
      makingChargeType: productObj.makingChargeType || "per_gram",
      makingChargeValue: productObj.makingChargeValue || 0,
      discountPercentage: productObj.discountPercentage || 0,
    });

    let salePrice = calculation.salePrice;
    let originalPrice = calculation.originalPrice;
    let metalValue = calculation.metalValue;
    let makingCharge = calculation.makingCharge;
    let cgst = calculation.cgst;
    let sgst = calculation.sgst;

    // =========================
    // CURRENCY CONVERSION
    // =========================
    if (currencyCtx.currency === "USD") {
      const rate = currencyCtx.conversionRate;

      salePrice = Number((salePrice / rate).toFixed(2));
      originalPrice = Number((originalPrice / rate).toFixed(2));
      metalValue = Number((metalValue / rate).toFixed(2));
      makingCharge = Number((makingCharge / rate).toFixed(2));
      cgst = Number((cgst / rate).toFixed(2));
      sgst = Number((sgst / rate).toFixed(2));
    }

    return {
      ...productObj,

      price: salePrice,
      originalPrice,

      currency: currencyCtx.currency,
      currencySymbol: currencyCtx.currencySymbol,

      pricing: {
        metalValue,
        makingCharge,
        cgst,
        sgst,

        gstOnMetal: calculation.gstOnMetal
          ? Number((calculation.gstOnMetal / (currencyCtx.currency === "USD" ? currencyCtx.conversionRate : 1)).toFixed(2))
          : undefined,

        gstOnLabour: calculation.gstOnLabour
          ? Number((calculation.gstOnLabour / (currencyCtx.currency === "USD" ? currencyCtx.conversionRate : 1)).toFixed(2))
          : undefined,

        salePrice,
        originalPrice,
        discountPercentage: calculation.discountPercentage,
      },
    };
  });
};
// ================= CREATE PRODUCT =================
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      shortDescription,
      category,
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
      gemstoneDetails,
      bisHallmarkNumber,
      certificateDetails,
      certificateFile,
      makingChargeType,
      makingChargeValue,
      cgstRate,
      sgstRate,
      gst,
      gender,
    } = req.body;

    // FIX: Map public_id from file.filename to prevent orphaned assets
    const images = req.files ? req.files.map((file) => ({
      url: file.path,
      public_id: file.filename,
    })) : [];

    // Required Fields Validation
    if (
      !name ||
      !description ||
      !category ||
      images.length === 0 ||
      !purity ||
      netWeight === undefined ||
      !makingChargeType ||
      makingChargeValue === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: name, description, category, images, purity, netWeight, makingChargeType, and makingChargeValue.",
      });
    }

    // Generate Slug
    const slug = slugify(name, {
      lower: true,
      strict: true,
    });

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

    const calculatedDiscount = Number(discountPercentage) || 0;

    // Process tags and occasion if they are strings
    let processedTags = tags;
    if (typeof tags === 'string') {
      processedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== "");
    }

    let processedOccasion = occasion;
    if (typeof occasion === 'string') {
      processedOccasion = occasion.split(',').map(occ => occ.trim()).filter(occ => occ !== "");
    }

    let processedGemstones = [];
    if (gemstoneDetails) {
      if (typeof gemstoneDetails === 'string') {
        try {
          processedGemstones = JSON.parse(gemstoneDetails);
        } catch (parseError) {
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
      gemstoneDetails: processedGemstones,
      bisHallmarkNumber,
      certificateDetails,
      certificateFile,
      makingChargeType,
      makingChargeValue,
      gst: Number(gst) || 3,
      gender,
    });

    if (defaultRating) {
      product.ratings = defaultRating;
      await product.save();
    }

    const calculatedProduct = await injectDynamicPricing(product, req);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: calculatedProduct,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// ================= GET ALL PRODUCTS =================
export const getAllProducts = async (req, res) => {
  try {
    console.log("🔥 PRODUCT CONTROLLER HIT");
    const search = req.query.search?.trim() || "";

    if (!search) {
      const products = await Product.find({})
        .populate("category")
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 });

      const calculatedProducts = await injectDynamicPricingArray(products, req);

      return res.status(200).json({
        success: true,
        count: calculatedProducts.length,
        products: calculatedProducts,
      });
    }

    const products = await Product.aggregate([
      {
        $search: {
          index: "default",
          compound: {
            should: [
              {
                text: {
                  query: search,
                  path: "name",
                  score: { boost: { value: 10 } },
                  fuzzy: { maxEdits: 2, prefixLength: 1 }
                }
              },
              {
                text: {
                  query: search,
                  path: "tags",
                  score: { boost: { value: 3 } },
                  fuzzy: { maxEdits: 2, prefixLength: 1 }
                }
              },
              {
                text: {
                  query: search,
                  path: { wildcard: "*" },
                  fuzzy: { maxEdits: 2, prefixLength: 1 }
                }
              }
            ]
          }
        }
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category"
        }
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdBy"
        }
      },
      { $unwind: { path: "$createdBy", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          "createdBy.password": 0,
          "createdBy.salt": 0,
          "createdBy.role": 0
        }
      },
      {
        $addFields: {
          searchScore: { $meta: "searchScore" }
        }
      },
      { $sort: { searchScore: -1 } }
    ]);

    const calculatedProducts = await injectDynamicPricingArray(products, req);

    return res.status(200).json({
      success: true,
      count: calculatedProducts.length,
      products: calculatedProducts,
    });
  } catch (error) {
    console.error("Search API Error: ", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
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

    const calculatedProduct = await injectDynamicPricing(product, req);

    res.status(200).json({ success: true, product: calculatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};

// ================= GET SINGLE PRODUCT =================
export const getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate("category")
      .populate("createdBy", "name email");

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const calculatedProduct = await injectDynamicPricing(product, req);

    res.status(200).json({ success: true, product: calculatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Server Error" });
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

    let updateData = { ...req.body };

    // Remove static pricing references from updateData
    delete updateData.price;
    delete updateData.originalPrice;
    delete updateData.priceBreakup;

    // Handle previews and newly uploaded images in slot order
    if (req.body.previews) {
      let previews = [];
      try {
        previews = JSON.parse(req.body.previews);
      } catch (err) {
        return res.status(400).json({ success: false, message: "Invalid previews format" });
      }

      const existingImages = product.images || [];
      const newImages = [];
      let fileIndex = 0;

      // Track kept URLs to find which ones were deleted
      const keptUrls = previews.filter((p) => typeof p === "string" && p.startsWith("http"));

      // Clean up deleted images from Cloudinary
      for (const img of existingImages) {
        if (img.url && !keptUrls.includes(img.url)) {
          if (img.public_id) {
            await cloudinary.uploader.destroy(img.public_id).catch((err) =>
              console.log("Cloudinary cleanup error during product edit:", err)
            );
          }
        }
      }

      // Reconstruct the product images array according to slot order
      for (const preview of previews) {
        if (!preview) continue;

        if (typeof preview === "string" && preview.startsWith("http")) {
          // Keep existing image reference
          const existing = existingImages.find((img) => img.url === preview);
          if (existing) {
            newImages.push(existing);
          } else {
            newImages.push({ url: preview });
          }
        } else {
          // This represents a new image file in this slot
          if (req.files && req.files[fileIndex]) {
            const file = req.files[fileIndex];
            newImages.push({
              url: file.path,
              public_id: file.filename,
            });
            fileIndex++;
          }
        }
      }

      updateData.images = newImages;
    } else if (req.files && req.files.length > 0) {
      // Fallback merge strategy if previews array is not sent
      const newImages = req.files.map((file) => ({
        url: file.path,
        public_id: file.filename,
      }));
      updateData.images = [...product.images, ...newImages];
    }

    if (updateData.name) {
      updateData.slug = slugify(updateData.name, { lower: true, strict: true });
    }

    if (updateData.sku) {
      const existingSku = await Product.findOne({
        sku: updateData.sku,
        _id: { $ne: req.params.id },
      });
      if (existingSku) {
        return res.status(400).json({ success: false, message: "SKU already exists" });
      }
    }

    if (updateData.discountPercentage !== undefined) {
      updateData.discountPercentage = Number(updateData.discountPercentage) || 0;
    }

    if (typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== "");
    }

    if (typeof updateData.occasion === 'string') {
      updateData.occasion = updateData.occasion.split(',').map(occ => occ.trim()).filter(occ => occ !== "");
    }

    if (typeof updateData.gemstoneDetails === 'string') {
      try {
        updateData.gemstoneDetails = JSON.parse(updateData.gemstoneDetails);
      } catch (error) {
        return res.status(400).json({ success: false, message: "Invalid JSON format for gemstoneDetails" });
      }
    }

    if (updateData.defaultRating !== undefined && product.numOfReviews === 0) {
      updateData.ratings = updateData.defaultRating;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: "after", runValidators: true }
    );

    const calculatedProduct = await injectDynamicPricing(updatedProduct, req);

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: calculatedProduct,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// ================= DELETE PRODUCT =================
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // This loop now successfully targets Cloudinary public_ids!
    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        if (image.public_id) {
          await cloudinary.uploader.destroy(image.public_id);
        }
      }
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};