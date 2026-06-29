import { getStoreSettingsCached } from "./settingsCache.js";

export const getCurrencyContext = async (req) => {
  try {
    if (!req) {
      return {
        countryCode: "IN",
        currency: "INR",
        currencySymbol: "₹",
        conversionRate: 1,
      };
    }

    // ✅ FIRST define raw value safely
    const rawCountry =
      req.headers?.["cf-ipcountry"] ||
      req.headers?.["x-vercel-ip-country"] ||
      req.headers?.["x-country-code"] ||
      req.query?.countryCode ||
      "IN";

    // ✅ THEN normalize
    const countryCode = String(rawCountry).toUpperCase();

    // IN case
    if (countryCode === "IN") {
      return {
        countryCode: "IN",
        currency: "INR",
        currencySymbol: "₹",
        conversionRate: 1,
      };
    }

    const storeSettings = await getStoreSettingsCached();
    const conversionRate = storeSettings?.usdConversionRate || 94.4;

    return {
      countryCode,
      currency: "USD",
      currencySymbol: "$",
      conversionRate,
    };
  } catch (error) {
    console.error("Currency Context Error:", error);

    return {
      countryCode: "IN",
      currency: "INR",
      currencySymbol: "₹",
      conversionRate: 1,
    };
  }
};
