import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    // General Settings
    general: {
      storeName: { type: String, default: "Imit Jewelry" },
      storeEmail: { type: String, default: "admin@imit.com" },
      phone: { type: String, default: "+91 9876543210" },
      address: { type: String, default: "123 Jewelry Street, Surat, Gujarat" },
      currency: { type: String, default: "INR" },
      timezone: { type: String, default: "Asia/Kolkata" },
      logo: {
        url: { type: String, default: "" },
        public_id: { type: String, default: "" },
      },
      favicon: {
        url: { type: String, default: "" },
        public_id: { type: String, default: "" },
      },
    },

    // SEO Settings
    seo: {
      metaTitle: { type: String, default: "Imit Jewelry - Premium Collections" },
      metaDescription: { type: String, default: "Discover exclusive handcrafted jewelry at Imit." },
      metaKeywords: { type: String, default: "jewelry, necklace, rings, surat jewelry" },
      googleAnalyticsId: { type: String, default: "" },
      ogImage: {
        url: { type: String, default: "" },
        public_id: { type: String, default: "" },
      },
    },

    // Order Settings
    order: {
      defaultStatus: { type: String, default: "PENDING" },
      enableCOD: { type: Boolean, default: true },
      shippingCharge: { type: Number, default: 0 },
      freeShippingMinAmount: { type: Number, default: 999 },
      taxPercentage: { type: Number, default: 3 },
      returnDays: { type: Number, default: 7 },
      allowCancellation: { type: Boolean, default: true },
    },

    // Payment Settings
    payment: {
      enableOnlinePayment: { type: Boolean, default: false },
      razorpayKey: { type: String, default: "" },
      razorpaySecret: { type: String, default: "" },
      stripePublicKey: { type: String, default: "" },
      stripeSecretKey: { type: String, default: "" },
    },

    // Email Settings
    email: {
      smtpHost: { type: String, default: "" },
      smtpPort: { type: String, default: "" },
      smtpEmail: { type: String, default: "" },
      smtpPassword: { type: String, default: "" },
      senderName: { type: String, default: "Imit Jewelry" },
    },

    // Inventory Settings
    inventory: {
      lowStockLimit: { type: Number, default: 5 },
      autoOutOfStock: { type: Boolean, default: true },
      enableTracking: { type: Boolean, default: true },
    },

    // Homepage Settings
    homepage: {
      featuredProductCount: { type: Number, default: 8 },
      trendingProductCount: { type: Number, default: 8 },
      newArrivalCount: { type: Number, default: 8 },
      heroBanner: {
        url: { type: String, default: "" },
        public_id: { type: String, default: "" },
      },
    },

    // Social Media Settings
    social: {
      instagram: { type: String, default: "" },
      facebook: { type: String, default: "" },
      whatsapp: { type: String, default: "" },
      youtube: { type: String, default: "" },
      twitter: { type: String, default: "" },
    },

    // Security Settings
    security: {
      twoFactorAuth: { type: Boolean, default: false },
      sessionTimeout: { type: Number, default: 60 }, // in minutes
    },
  },
  { timestamps: true }
);

// We only ever want one document in this collection
const Settings = mongoose.model("Settings", settingsSchema);

export default Settings;
