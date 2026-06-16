import Settings from "../model/settingsModel.js";
import cloudinary from "../config/cloudinary.js";

// ================= GET SETTINGS =================
export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    // Create default settings if none exist
    if (!settings) {
      settings = await Settings.create({});
    }

    res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error fetching settings",
    });
  }
};

// ================= UPDATE SETTINGS SECTION =================
// Dynamic update logic that updates specific sections (general, seo, order, etc.)
export const updateSettings = async (req, res) => {
  try {
    const { section } = req.params;
    const updateData = req.body;

    // Handle Image Uploads if any
    if (req.files) {
      for (const fieldName of Object.keys(req.files)) {
        const file = req.files[fieldName][0];
        
        // Find existing settings to delete old image if it exists
        const settings = await Settings.findOne();
        const currentImageUrl = settings[section]?.[fieldName]?.public_id;

        if (currentImageUrl) {
          await cloudinary.uploader.destroy(currentImageUrl);
        }

        // Add new image data to updateData
        updateData[fieldName] = {
          url: file.path,
          public_id: file.filename,
        };
      }
    }

    // Construct the dynamic update object (e.g., { "general.storeName": "..." })
    const finalUpdate = {};
    for (const key of Object.keys(updateData)) {
      finalUpdate[`${section}.${key}`] = updateData[key];
    }

    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: finalUpdate },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: `${section.charAt(0).toUpperCase() + section.slice(1)} settings updated`,
      settings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update settings",
    });
  }
};
