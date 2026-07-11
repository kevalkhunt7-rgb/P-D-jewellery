import Settings from "../model/settingsModel.js";
import StoreSettings from "../model/storeSettingsModel.js";
import GoldRateAudit from "../model/goldRateAuditModel.js";
import SilverRateAudit from "../model/silverRateAuditModel.js";
import { getStoreSettingsCached, clearSettingsCache } from "../utils/settingsCache.js";
import cloudinary from "../config/cloudinary.js";
import { getCurrencyContext } from "../utils/currencyHelper.js";

// ================= SERIALIZE SETTINGS FOR USER LOCALIZATION =================
const serializeSettings = async (settings, req) => {
  if (!settings) return settings;
  const context = await getCurrencyContext(req);
  const settingsObj = settings.toObject ? settings.toObject() : settings;

  if (settingsObj.general) {
    settingsObj.general.currency = context.currency;
    settingsObj.general.currencySymbol = context.currencySymbol;
  }

  if (context.currency === "USD" && settingsObj.order) {
    if (settingsObj.order.shippingCharge !== undefined) {
      settingsObj.order.shippingCharge = Number((settingsObj.order.shippingCharge / context.conversionRate).toFixed(2));
    }
    if (settingsObj.order.freeShippingMinAmount !== undefined) {
      settingsObj.order.freeShippingMinAmount = Number((settingsObj.order.freeShippingMinAmount / context.conversionRate).toFixed(2));
    }
  }

  return settingsObj;
};

// ================= GET SETTINGS =================
export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    // Create default settings if none exist
    if (!settings) {
      settings = await Settings.create({});
    } else if (!settings.inventory) {
      settings.inventory = {
        lowStockLimit: 5,
        autoOutOfStock: true,
        enableTracking: true,
      };
      await settings.save();
    }

    // Fetch cached gold rate settings
    const storeSettings = await getStoreSettingsCached();

    res.status(200).json({
      success: true,
      settings,
      goldRate24kt: storeSettings.goldRate24kt,
      storeSettings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || (error && typeof error === 'object' ? JSON.stringify(error) : String(error)),
    });
  }
};

// ================= GET PUBLIC SETTINGS (LOCALIZED) =================
export const getPublicSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    // Create default settings if none exist
    if (!settings) {
      settings = await Settings.create({});
    } else if (!settings.inventory) {
      settings.inventory = {
        lowStockLimit: 5,
        autoOutOfStock: true,
        enableTracking: true,
      };
      await settings.save();
    }

    // Fetch cached gold rate settings
    const storeSettings = await getStoreSettingsCached();
    const serializedSettings = await serializeSettings(settings, req);

    res.status(200).json({
      success: true,
      settings: serializedSettings,
      goldRate24kt: storeSettings.goldRate24kt,
      storeSettings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || (error && typeof error === 'object' ? JSON.stringify(error) : String(error)),
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
      let value = updateData[key];
      if (value === "true") value = true;
      if (value === "false") value = false;
      finalUpdate[`${section}.${key}`] = value;
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

// ================= GET GOLD RATE =================
export const getGoldRate = async (req, res) => {
  try {
    const storeSettings = await getStoreSettingsCached();

    // Also fetch audit logs for admin audit tracking
    let auditLogs = [];
    let silverAuditLogs = [];
    if (req.user && (req.user.role?.toLowerCase() === "admin" || req.user.role?.toLowerCase() === "superadmin")) {
      auditLogs = await GoldRateAudit.find()
        .populate("updatedBy", "name email")
        .sort({ createdAt: -1 })
        .limit(10);

      silverAuditLogs = await SilverRateAudit.find()
        .populate("updatedBy", "name email")
        .sort({ createdAt: -1 })
        .limit(10);
    }

    res.status(200).json({
      success: true,
      goldRate24kt: storeSettings.goldRate24kt,
      dailySilverRate999: storeSettings.dailySilverRate999 || 100,
      updatedAt: storeSettings.updatedAt,
      auditLogs,
      silverAuditLogs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch metal rates",
    });
  }
};

// ================= UPDATE GOLD RATE =================
export const updateGoldRate = async (req, res) => {
  try {
    const { goldRate24kt, dailySilverRate999 } = req.body;

    const updateObj = {};

    if (goldRate24kt !== undefined) {
      if (typeof goldRate24kt !== "number" || goldRate24kt <= 0) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid positive gold rate.",
        });
      }
      updateObj.goldRate24kt = goldRate24kt;
    }

    if (dailySilverRate999 !== undefined) {
      if (typeof dailySilverRate999 !== "number" || dailySilverRate999 <= 0) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid positive silver rate.",
        });
      }
      updateObj.dailySilverRate999 = dailySilverRate999;
    }

    const oldSettings = await StoreSettings.findOne();
    const oldRate = oldSettings ? oldSettings.goldRate24kt : 8000;
    const oldSilverRate = oldSettings ? (oldSettings.dailySilverRate999 || 100) : 100;

    const settings = await StoreSettings.findOneAndUpdate(
      {},
      updateObj,
      { new: true, upsert: true, runValidators: true }
    );

    // Create Admin Audit Log Entry (if gold rate changed)
    if (goldRate24kt !== undefined && goldRate24kt !== oldRate) {
      await GoldRateAudit.create({
        oldRate,
        newRate: goldRate24kt,
        updatedBy: req.user._id,
      });
    }

    // Create Admin Audit Log Entry (if silver rate changed)
    if (dailySilverRate999 !== undefined && dailySilverRate999 !== oldSilverRate) {
      await SilverRateAudit.create({
        oldRate: oldSilverRate,
        newRate: dailySilverRate999,
        updatedBy: req.user._id,
      });
    }

    // Clear settings cache to force reload on next call
    clearSettingsCache();

    res.status(200).json({
      success: true,
      message: "Metal rates updated successfully",
      goldRate24kt: settings.goldRate24kt,
      dailySilverRate999: settings.dailySilverRate999,
      updatedAt: settings.updatedAt,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update metal rates",
    });
  }
};
