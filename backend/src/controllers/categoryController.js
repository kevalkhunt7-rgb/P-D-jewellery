import Category from "../model/categoryModel.js";
import slugify from "slugify";
import cloudinary from "../config/cloudinary.js";

// ================= CREATE CATEGORY =================
export const createCategory = async (req, res) => {
  try {
    const { name, description, isFeatured, status } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    // Handle Image Upload to Cloudinary cleanly
    let imageUrl = "";
    let imagePublicId = "";
    
    if (req.file) {
      // If your storage configuration handles upload automatically:
      imageUrl = req.file.path;
      imagePublicId = req.file.filename;
    }

    const slug = slugify(name, { lower: true, strict: true });
    const existingCategory = await Category.findOne({ slug });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category already exists",
      });
    }

    const category = await Category.create({
      name,
      slug,
      description,
      image: imageUrl,
      imagePublicId: imagePublicId, // Tracking public_id explicitly
      isFeatured,
      status,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// ================= GET ALL CATEGORIES =================
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};

// ================= GET SINGLE CATEGORY =================
export const getSingleCategory = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug })
      .populate("createdBy", "name email");

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.status(200).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};

// ================= UPDATE CATEGORY =================
export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    let updateData = { ...req.body };

    if (updateData.name) {
      updateData.slug = slugify(updateData.name, { lower: true, strict: true });
    }

    // Handle category image update and Cloudinary cleanup
    if (req.file) {
      // Destroy old asset from Cloudinary if it exists
      if (category.image && category.image.includes("cloudinary.com")) {
        const match = category.image.match(/\/v\d+\/(.+)\.[a-z0-9]+$/i);
        const publicId = match ? match[1] : null;
        if (publicId) {
          await cloudinary.uploader.destroy(publicId).catch((err) =>
            console.log("Cloudinary cleanup error during category update:", err)
          );
        }
      }

      // Assign newly uploaded file parameters
      updateData.image = req.file.path;
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: "after", runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// ================= DELETE CATEGORY =================
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Wipe associated image off Cloudinary storage upon structural delete
    if (category.image && category.image.includes("cloudinary.com")) {
      const match = category.image.match(/\/v\d+\/(.+)\.[a-z0-9]+$/i);
      const publicId = match ? match[1] : null;
      if (publicId) {
        await cloudinary.uploader.destroy(publicId).catch((err) =>
          console.log("Cloudinary cleanup error during category deletion:", err)
        );
      }
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};