import ShippingRegion from "../model/shippingRegionModel.js";

let cachedRegions = null;
let cachedActiveRegions = null;

export const getRegionsCached = async () => {
  if (!cachedRegions) {
    cachedRegions = await ShippingRegion.find({}).sort({ isDefault: 1, name: 1 });
  }
  return cachedRegions;
};

export const getActiveRegionsCached = async () => {
  if (!cachedActiveRegions) {
    cachedActiveRegions = await ShippingRegion.find({ status: "Active" }).sort({ isDefault: 1, name: 1 });
  }
  return cachedActiveRegions;
};

export const clearShippingCache = () => {
  cachedRegions = null;
  cachedActiveRegions = null;
};
