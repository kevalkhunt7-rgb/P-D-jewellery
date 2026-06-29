import StoreSettings from "../model/storeSettingsModel.js";

let cachedSettings = null;

export const getStoreSettingsCached = async () => {
  if (cachedSettings) {
    return cachedSettings;
  }

  let settings = await StoreSettings.findOne();
  if (!settings) {
    settings = await StoreSettings.create({ goldRate24kt: 8000, usdConversionRate: 94.4 });
  }

  cachedSettings = {
    goldRate24kt: settings.goldRate24kt,
    usdConversionRate: settings.usdConversionRate,
    lastExchangeRateUpdate: settings.lastExchangeRateUpdate,
    updatedAt: settings.updatedAt,
  };

  return cachedSettings;
};

export const clearSettingsCache = () => {
  cachedSettings = null;
};
