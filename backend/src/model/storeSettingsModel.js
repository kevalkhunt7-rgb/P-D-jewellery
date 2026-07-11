import mongoose from "mongoose";

const storeSettingsSchema = new mongoose.Schema(
  {
    goldRate24kt: {
      type: Number,
      required: true,
      default: 8000,
    },
    dailySilverRate999: {
      type: Number,
      required: true,
      default: 100,
    },
    usdConversionRate: {
      type: Number,
      required: true,
      default: 94.4, // 1 USD = 94.4 INR
    },
    exchangeRates: {
      type: Map,
      of: Number,
      default: {},
    },
    lastExchangeRateUpdate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const StoreSettings = mongoose.model("StoreSettings", storeSettingsSchema, "storesettings");
export default StoreSettings;
