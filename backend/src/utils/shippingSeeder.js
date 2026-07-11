import ShippingRegion from "../model/shippingRegionModel.js";

const DEFAULT_REGIONS = [
  {
    name: "India",
    countries: ["IN"],
    currency: "INR",
    flatShippingCharge: 250,
    freeShippingThreshold: null,
    deliveryTime: "3–5 Business Days",
    status: "Active",
    isDefault: false
  },
  {
    name: "North America",
    countries: ["US", "CA", "MX"],
    currency: "USD",
    flatShippingCharge: 20,
    freeShippingThreshold: null,
    deliveryTime: "5–7 Business Days",
    status: "Active",
    isDefault: false
  },
  {
    name: "Europe",
    countries: [
      "DE", "FR", "IT", "ES", "NL", "BE", "AT", "PT", "SE", "DK",
      "FI", "IE", "PL", "CZ", "HU", "RO", "GR", "LU"
    ],
    currency: "USD",
    flatShippingCharge: 20,
    freeShippingThreshold: null,
    deliveryTime: "5–7 Business Days",
    status: "Active",
    isDefault: false
  },
  {
    name: "United Kingdom",
    countries: ["GB"],
    currency: "USD",
    flatShippingCharge: 19,
    freeShippingThreshold: null,
    deliveryTime: "3–5 Business Days",
    status: "Active",
    isDefault: false
  },
  {
    name: "Middle East",
    countries: ["AE", "SA", "QA", "KW", "BH", "OM"],
    currency: "USD",
    flatShippingCharge: 22,
    freeShippingThreshold: null,
    deliveryTime: "3–5 Business Days",
    status: "Active",
    isDefault: false
  },
  {
    name: "Asia Pacific",
    countries: ["SG", "MY", "TH", "JP", "KR", "ID", "PH", "VN"],
    currency: "USD",
    flatShippingCharge: 18,
    freeShippingThreshold: null,
    deliveryTime: "5–7 Business Days",
    status: "Active",
    isDefault: false
  },
  {
    name: "Australia & New Zealand",
    countries: ["AU", "NZ"],
    currency: "USD",
    flatShippingCharge: 16,
    freeShippingThreshold: null,
    deliveryTime: "5–7 Business Days",
    status: "Active",
    isDefault: false
  },
  {
    name: "Rest of World",
    countries: [], // Matches any other country code
    currency: "USD",
    flatShippingCharge: 30,
    freeShippingThreshold: null,
    deliveryTime: "7–10 Business Days",
    status: "Active",
    isDefault: true
  }
];

export const seedDefaultRegions = async () => {
  try {
    const count = await ShippingRegion.countDocuments();
    if (count === 0) {
      console.log("No shipping regions detected. Auto-seeding default regions...");
      await ShippingRegion.insertMany(DEFAULT_REGIONS);
      console.log("Shipping regions auto-seeded successfully!");
    } else {
      // Ensure that Rest of World fallback region always exists
      const fallbackExists = await ShippingRegion.findOne({ isDefault: true });
      if (!fallbackExists) {
        console.log("No default Rest of World shipping fallback region found. Creating one...");
        const rowData = DEFAULT_REGIONS.find((r) => r.isDefault);
        await ShippingRegion.create(rowData);
        console.log("Rest of World fallback region created.");
      }
    }
  } catch (error) {
    console.error("Failed to seed default shipping regions:", error.message);
  }
};
