import Banner from "../model/bannerModel.js";
import cloudinary from "../config/cloudinary.js";



// ================= CREATE BANNER =================
export const createBanner = async (req, res) => {
  try {

    const {
      title,
      subtitle,
      description,
      buttonText,
      buttonLink,
      position,
      isActive,
    } = req.body;


    // Validation
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }


    // Desktop Image
    let bannerImage = {};

    if (
      req.files &&
      req.files.image &&
      req.files.image.length > 0
    ) {
      bannerImage = {
        url: req.files.image[0].path,
        public_id: req.files.image[0].filename,
      };
    } else {
      return res.status(400).json({
        success: false,
        message: "Banner image is required",
      });
    }




    // Create Banner
    const banner = await Banner.create({
      title,
      subtitle,
      description,
      image: bannerImage,
      buttonText,
      buttonLink,
      isActive,
      createdBy: req.user._id,
    });


    res.status(201).json({
      success: true,
      message: "Banner created successfully",
      banner,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message || (error && typeof error === 'object' ? JSON.stringify(error) : String(error)),
    });
  }
};





// ================= GET ALL ACTIVE BANNERS =================
export const getAllBanners = async (req, res) => {
  try {

    const currentDate = new Date();


    const banners = await Banner.find({
      isActive: true,

      $or: [
        {
          startDate: { $exists: false },
        },

        {
          startDate: { $lte: currentDate },
          endDate: { $gte: currentDate },
        },
      ],
    }).sort({ position: 1 });


    res.status(200).json({
      success: true,
      count: banners.length,
      banners,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message || (error && typeof error === 'object' ? JSON.stringify(error) : String(error)),
    });
  }
};





// ================= GET ADMIN BANNERS =================
export const getAdminBanners = async (req, res) => {
  try {

    const banners = await Banner.find()
      .sort({ position: 1 });


    res.status(200).json({
      success: true,
      count: banners.length,
      banners,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message || (error && typeof error === 'object' ? JSON.stringify(error) : String(error)),
    });
  }
};





// ================= UPDATE BANNER =================
export const updateBanner = async (req, res) => {
  try {

    const banner = await Banner.findById(
      req.params.id
    );

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }


    // Update Desktop Image
    if (
      req.files &&
      req.files.image &&
      req.files.image.length > 0
    ) {

      // Delete Old Image
      if (banner.image.public_id) {
        await cloudinary.uploader.destroy(
          banner.image.public_id
        );
      }

      req.body.image = {
        url: req.files.image[0].path,
        public_id: req.files.image[0].filename,
      };
    }


    // Update Mobile Image
    if (
      req.files &&
      req.files.mobileImage &&
      req.files.mobileImage.length > 0
    ) {

      if (banner.mobileImage.public_id) {
        await cloudinary.uploader.destroy(
          banner.mobileImage.public_id
        );
      }

      req.body.mobileImage = {
        url: req.files.mobileImage[0].path,
        public_id: req.files.mobileImage[0].filename,
      };
    }


    const updatedBanner =
      await Banner.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          returnDocument: "after",
          runValidators: true,
        }
      );


    res.status(200).json({
      success: true,
      message: "Banner updated successfully",
      banner: updatedBanner,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message || (error && typeof error === 'object' ? JSON.stringify(error) : String(error)),
    });
  }
};





// ================= DELETE BANNER =================
export const deleteBanner = async (req, res) => {
  try {

    const banner = await Banner.findById(
      req.params.id
    );

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }


    // Delete Desktop Image
    if (banner.image.public_id) {
      await cloudinary.uploader.destroy(
        banner.image.public_id
      );
    }


   
  


    await banner.deleteOne();


    res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message || (error && typeof error === 'object' ? JSON.stringify(error) : String(error)),
    });
  }
};

// ================= GET SINGLE BANNER =================
export const getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    res.status(200).json({
      success: true,
      banner,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message || (error && typeof error === 'object' ? JSON.stringify(error) : String(error)),
    });
  }
};