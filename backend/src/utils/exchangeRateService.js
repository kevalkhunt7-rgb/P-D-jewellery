import StoreSettings from "../model/storeSettingsModel.js";
import { clearSettingsCache } from "./settingsCache.js";

export const fetchAndUpdateExchangeRate = async () => {
  try {
    console.log("Fetching latest USD→INR exchange rate from Frankfurter API...");
    const response = await fetch("https://api.frankfurter.app/latest?from=USD&to=INR");
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    const rate = data.rates.INR;
    
    await StoreSettings.findOneAndUpdate(
      {},
      { usdConversionRate: rate, lastExchangeRateUpdate: new Date() },
      { new: true, upsert: true }
    );
    
    clearSettingsCache();
    console.log(`Exchange rate updated successfully: 1 USD = ${rate} INR`);
    return rate;
  } catch (error) {
    console.error("Failed to fetch exchange rate:", error.message);
    console.log("Falling back to last cached rate");
    return null;
  }
};
