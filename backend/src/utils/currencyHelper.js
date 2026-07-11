import { getStoreSettingsCached } from "./settingsCache.js";
import { getActiveRegionsCached } from "./shippingCache.js";

// Helper to map country names to ISO 2-letter codes
export const getCountryCode = (countryNameOrCode) => {
  if (!countryNameOrCode) return "IN";
  const clean = countryNameOrCode.trim();
  if (clean.length === 2) return clean.toUpperCase();

  const map = {
    "india": "IN",
    "united states": "US",
    "united states of america": "US",
    "usa": "US",
    "canada": "CA",
    "mexico": "MX",
    "united kingdom": "GB",
    "uk": "GB",
    "germany": "DE",
    "france": "FR",
    "italy": "IT",
    "spain": "ES",
    "netherlands": "NL",
    "belgium": "BE",
    "austria": "AT",
    "portugal": "PT",
    "sweden": "SE",
    "denmark": "DK",
    "finland": "FI",
    "ireland": "IE",
    "poland": "PL",
    "czech republic": "CZ",
    "hungary": "HU",
    "romania": "RO",
    "greece": "GR",
    "luxembourg": "LU",
    "united arab emirates": "AE",
    "uae": "AE",
    "saudi arabia": "SA",
    "qatar": "QA",
    "kuwait": "KW",
    "bahrain": "BH",
    "oman": "OM",
    "singapore": "SG",
    "malaysia": "MY",
    "thailand": "TH",
    "japan": "JP",
    "south korea": "KR",
    "indonesia": "ID",
    "philippines": "PH",
    "vietnam": "VN",
    "australia": "AU",
    "new zealand": "NZ"
  };
  return map[clean.toLowerCase()] || "US"; // fallback to US
};

// Helper to map currency codes to symbols
export const getCurrencySymbol = (currencyCode) => {
  const symbols = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    AUD: "A$",
    CAD: "C$",
    AED: "AED",
  };
  return symbols[currencyCode.toUpperCase()] || currencyCode;
};

export const getCurrencyContext = async (req) => {
  try {
    const rawCountry =
      req?.headers?.["cf-ipcountry"] ||
      req?.headers?.["x-vercel-ip-country"] ||
      req?.headers?.["x-country-code"] ||
      req?.query?.countryCode ||
      "IN";

    const countryCode = getCountryCode(String(rawCountry));

    // Get active shipping regions from cache
    const activeRegions = await getActiveRegionsCached();

    // Match customer country to a shipping region
    let matchedRegion = activeRegions.find((r) => r.countries.includes(countryCode));
    if (!matchedRegion) {
      matchedRegion = activeRegions.find((r) => r.isDefault);
    }

    const currency = matchedRegion ? matchedRegion.currency : "USD";
    const currencySymbol = getCurrencySymbol(currency);

    const storeSettings = await getStoreSettingsCached();
    const usdConversionRate = storeSettings?.usdConversionRate || 94.4;
    const exchangeRates = storeSettings?.exchangeRates;

    if (currency === "INR") {
      return {
        countryCode,
        currency: "INR",
        currencySymbol: "₹",
        conversionRate: 1,
        usdConversionRate,
        regionName: matchedRegion ? matchedRegion.name : "India"
      };
    }

    const getRate = (rates, curr) => {
      if (!rates) return null;
      if (rates instanceof Map) {
        return rates.get(curr);
      }
      return rates[curr];
    };

    let targetRate = getRate(exchangeRates, currency);
    if (!targetRate) {
      const fallbacks = { USD: 1, EUR: 0.92, GBP: 0.78, AUD: 1.50, CAD: 1.36, AED: 3.6725 };
      targetRate = fallbacks[currency.toUpperCase()] || 1;
    }

    const conversionRate = Number((usdConversionRate / targetRate).toFixed(4));

    return {
      countryCode,
      currency,
      currencySymbol,
      conversionRate,
      usdConversionRate,
      regionName: matchedRegion ? matchedRegion.name : "Rest of World"
    };
  } catch (error) {
    console.error("Currency Context Error:", error);
    return {
      countryCode: "IN",
      currency: "INR",
      currencySymbol: "₹",
      conversionRate: 1,
      usdConversionRate: 94.4,
      regionName: "India"
    };
  }
};
