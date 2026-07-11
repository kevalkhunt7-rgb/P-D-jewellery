import ShippingRegion from "../model/shippingRegionModel.js";
import { clearShippingCache, getActiveRegionsCached, getRegionsCached } from "../utils/shippingCache.js";
import { getCurrencyContext, getCountryCode } from "../utils/currencyHelper.js";

// Validation Helper
const validateRegionData = (data, isUpdate = false) => {
  const { name, currency, flatShippingCharge, freeShippingThreshold, deliveryTime, countries, weightRules } = data;
  const errors = [];

  if (!isUpdate || name !== undefined) {
    if (!name || name.trim() === "") {
      errors.push("Region name is required");
    }
  }

  if (!isUpdate || currency !== undefined) {
    if (!currency || currency.trim() === "") {
      errors.push("Currency is required");
    }
  }

  if (!isUpdate || flatShippingCharge !== undefined) {
    if (flatShippingCharge === undefined || flatShippingCharge === null || flatShippingCharge === "") {
      errors.push("Flat shipping charge is required");
    } else if (Number(flatShippingCharge) < 0) {
      errors.push("Flat shipping charge cannot be negative");
    }
  }

  if (freeShippingThreshold !== undefined && freeShippingThreshold !== null && freeShippingThreshold !== "") {
    if (Number(freeShippingThreshold) < 0) {
      errors.push("Free shipping threshold cannot be negative");
    }
  }

  if (!isUpdate || deliveryTime !== undefined) {
    if (!deliveryTime || deliveryTime.trim() === "") {
      errors.push("Delivery time is required");
    }
  }

  if (countries !== undefined) {
    if (!Array.isArray(countries)) {
      errors.push("Countries must be a list of 2-letter codes");
    } else {
      countries.forEach((code) => {
        if (!/^[A-Z]{2}$/.test(code.toUpperCase().trim())) {
          errors.push(`Invalid country code standard: "${code}"`);
        }
      });
    }
  }

  if (weightRules !== undefined && Array.isArray(weightRules)) {
    for (let i = 0; i < weightRules.length; i++) {
      const { minWeight, maxWeight, charge } = weightRules[i];
      if (minWeight === undefined || minWeight === null || minWeight < 0) {
        errors.push(`Weight rule ${i + 1} must have a valid non-negative min weight`);
      }
      if (maxWeight === undefined || maxWeight === null || maxWeight <= minWeight) {
        errors.push(`Weight rule ${i + 1} max weight must be greater than min weight`);
      }
      if (charge === undefined || charge === null || charge < 0) {
        errors.push(`Weight rule ${i + 1} charge cannot be negative`);
      }
    }
  }

  return errors;
};

// ================= GET ALL REGIONS =================
export const getRegions = async (req, res) => {
  try {
    const regions = await getRegionsCached();
    res.status(200).json({
      success: true,
      regions,
    });
  } catch (error) {
    console.error("Get Regions Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve shipping regions",
    });
  }
};

// ================= GET REGION BY ID =================
export const getRegionById = async (req, res) => {
  try {
    const region = await ShippingRegion.findById(req.params.id);
    if (!region) {
      return res.status(404).json({
        success: false,
        message: "Shipping region not found",
      });
    }
    res.status(200).json({
      success: true,
      region,
    });
  } catch (error) {
    console.error("Get Region By ID Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve shipping region",
    });
  }
};

// ================= CREATE REGION =================
export const createRegion = async (req, res) => {
  try {
    const validationErrors = validateRegionData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: validationErrors.join(", "),
      });
    }

    const {
      name,
      countries,
      currency,
      flatShippingCharge,
      freeShippingThreshold,
      deliveryTime,
      weightRules,
      status,
      isDefault
    } = req.body;

    const normalizedName = name.trim();
    const normalizedCountries = (countries || []).map(c => c.trim().toUpperCase());

    // Check duplicate region name
    const existingName = await ShippingRegion.findOne({ name: { $regex: new RegExp(`^${normalizedName}$`, "i") } });
    if (existingName) {
      return res.status(400).json({
        success: false,
        message: `A shipping region named "${normalizedName}" already exists.`,
      });
    }

    // Validate country duplicates across all regions
    if (normalizedCountries.length > 0) {
      const overlappingRegion = await ShippingRegion.findOne({
        countries: { $in: normalizedCountries }
      });
      if (overlappingRegion) {
        const intersection = overlappingRegion.countries.filter(c => normalizedCountries.includes(c));
        return res.status(400).json({
          success: false,
          message: `Country code ${intersection.join(", ")} is already assigned to region "${overlappingRegion.name}".`,
        });
      }
    }

    // Handle isDefault logic (only one rule can be the default fallback)
    if (isDefault) {
      await ShippingRegion.updateMany({}, { isDefault: false });
    }

    const newRegion = await ShippingRegion.create({
      name: normalizedName,
      countries: normalizedCountries,
      currency: currency.trim().toUpperCase(),
      flatShippingCharge: Number(flatShippingCharge),
      freeShippingThreshold: freeShippingThreshold ? Number(freeShippingThreshold) : null,
      deliveryTime: deliveryTime.trim(),
      weightRules: weightRules || [],
      status: status || "Active",
      isDefault: !!isDefault
    });

    clearShippingCache();

    res.status(201).json({
      success: true,
      message: "Shipping region created successfully",
      region: newRegion,
    });
  } catch (error) {
    console.error("Create Region Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create shipping region",
    });
  }
};

// ================= UPDATE REGION =================
export const updateRegion = async (req, res) => {
  try {
    const validationErrors = validateRegionData(req.body, true);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: validationErrors.join(", "),
      });
    }

    const regionId = req.params.id;
    const region = await ShippingRegion.findById(regionId);
    if (!region) {
      return res.status(404).json({
        success: false,
        message: "Shipping region not found",
      });
    }

    const {
      name,
      countries,
      currency,
      flatShippingCharge,
      freeShippingThreshold,
      deliveryTime,
      weightRules,
      status,
      isDefault
    } = req.body;

    // Check duplicate region name
    if (name !== undefined) {
      const normalizedName = name.trim();
      if (normalizedName.toLowerCase() !== region.name.toLowerCase()) {
        const existingName = await ShippingRegion.findOne({
          _id: { $ne: regionId },
          name: { $regex: new RegExp(`^${normalizedName}$`, "i") }
        });
        if (existingName) {
          return res.status(400).json({
            success: false,
            message: `A shipping region named "${normalizedName}" already exists.`,
          });
        }
      }
      region.name = normalizedName;
    }

    // Validate country duplicates across all other regions
    if (countries !== undefined) {
      const normalizedCountries = countries.map(c => c.trim().toUpperCase());
      const overlappingRegion = await ShippingRegion.findOne({
        _id: { $ne: regionId },
        countries: { $in: normalizedCountries }
      });
      if (overlappingRegion) {
        const intersection = overlappingRegion.countries.filter(c => normalizedCountries.includes(c));
        return res.status(400).json({
          success: false,
          message: `Country code ${intersection.join(", ")} is already assigned to region "${overlappingRegion.name}".`,
        });
      }
      region.countries = normalizedCountries;
    }

    if (currency !== undefined) region.currency = currency.trim().toUpperCase();
    if (flatShippingCharge !== undefined) region.flatShippingCharge = Number(flatShippingCharge);
    if (freeShippingThreshold !== undefined) {
      region.freeShippingThreshold = freeShippingThreshold ? Number(freeShippingThreshold) : null;
    }
    if (deliveryTime !== undefined) region.deliveryTime = deliveryTime.trim();
    if (weightRules !== undefined) region.weightRules = weightRules;
    if (status !== undefined) region.status = status;

    if (isDefault !== undefined) {
      if (!isDefault && region.isDefault) {
        // Enforce Rest of World default constraint
        return res.status(400).json({
          success: false,
          message: "A default fallback region must always exist. Mark another region as default first.",
        });
      }
      
      region.isDefault = !!isDefault;
      if (isDefault) {
        // Clear all other defaults
        await ShippingRegion.updateMany({ _id: { $ne: regionId } }, { isDefault: false });
      }
    }

    await region.save();
    clearShippingCache();

    res.status(200).json({
      success: true,
      message: "Shipping region updated successfully",
      region,
    });
  } catch (error) {
    console.error("Update Region Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update shipping region",
    });
  }
};

// ================= DELETE REGION =================
export const deleteRegion = async (req, res) => {
  try {
    const regionId = req.params.id;
    const region = await ShippingRegion.findById(regionId);
    if (!region) {
      return res.status(404).json({
        success: false,
        message: "Shipping region not found",
      });
    }

    // Rest of World region cannot be deleted.
    if (region.isDefault || region.name.toLowerCase() === "rest of world") {
      return res.status(400).json({
        success: false,
        message: "The default fallback shipping region (Rest of World) cannot be deleted.",
      });
    }

    await ShippingRegion.findByIdAndDelete(regionId);
    clearShippingCache();

    res.status(200).json({
      success: true,
      message: "Shipping region deleted successfully",
    });
  } catch (error) {
    console.error("Delete Region Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete shipping region",
    });
  }
};

// ================= GET PUBLIC REGIONS =================
export const getPublicRegions = async (req, res) => {
  try {
    const activeRegions = await getActiveRegionsCached();
    const currencyContext = await getCurrencyContext(req);

    const detectedCountryCode = currencyContext.countryCode;

    // Find region matching the visitor
    let detectedRegion = activeRegions.find((r) => r.countries.includes(detectedCountryCode));
    if (!detectedRegion) {
      detectedRegion = activeRegions.find((r) => r.isDefault === true);
    }

    res.status(200).json({
      success: true,
      regions: activeRegions,
      detectedCountry: detectedCountryCode,
      detectedRegion,
      currencyContext,
    });
  } catch (error) {
    console.error("Get Public Regions Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve public shipping regions",
    });
  }
};
