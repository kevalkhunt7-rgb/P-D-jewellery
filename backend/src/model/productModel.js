import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    shortDescription: {
      type: String,
      default: "",
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    images: [
      {
        url: {
          type: String,
          required: true,
        },
        public_id: {
          type: String,
          default: "",
        },
      },
    ],

    price: {
      type: Number,
      required: true,
    },

    originalPrice: {
      type: Number,
      default: 0,
    },

    discountPercentage: {
      type: Number,
      default: 0,
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
    },

    sku: {
      type: String,
      unique: true,
      trim: true,
    },

    // ==========================================
    // Cleaned Premium Jewellery Architecture Fields
    // ==========================================
    metalType: {
      type: String,
      // Added alternative production base metals so your architecture is sound
      enum: ["Gold", "Silver", "Platinum", "Brass", "Stainless-Steel", "Titanium"],
      default: "Gold",
    },

    purity: {
      type: String,
      // Cleaned values to match frontend selections (Added 14KT)
      enum: ["14KT", "18KT", "22KT", "24KT", "925 Sterling", "950 Platinum", "999 Platinum"],
      default: "22KT",
    },

    metalColor: {
      type: String,
      enum: ["Yellow Gold", "White Gold", "Rose Gold", "Silver", "Platinum", "Two-Tone"],
      default: "Yellow Gold",
    },

    plating: {
      type: String,
      default: "None", // Handles "18K Gold Plated", "Rhodium Plated", etc.
    },

    grossWeight: {
      type: Number,
      default: 0, // in grams
    },

    netWeight: {
      type: Number,
      default: 0, // in grams
    },

    diamondWeight: {
      type: Number,
      default: 0, // in carats
    },

    diamondPieces: {
      type: Number,
      default: 0,
    },

    gemstoneDetails: {
      type: [
        {
          name: String, // Matches your tag pill input labels e.g. "Ruby", "Blue Sapphire"
          weight: Number,
          pieces: Number,
          color: String,
          clarity: String,
          certificate: String,
        },
      ],
      default: [],
    },

    bisHallmarkNumber: {
      type: String,
      default: "",
    },

    certificateDetails: {
      type: String,
      default: "",
    },

    certificateFile: {
      url: String,
      public_id: String,
    },

    makingCharges: {
      type: Number,
      default: 0,
    },

    gst: {
      type: Number,
      default: 3, // GST percentage
    },

    priceBreakup: {
      metalPrice: Number,
      makingCharges: Number,
      gst: Number,
      total: Number,
    },

    warranty: {
      type: String,
      default: "Lifetime",
    },

    buybackEligibility: {
      type: Boolean,
      default: true,
    },

    // Removed the deprecated legacy 'material' field to avoid duplicate field conflicts!
    color: {
      type: String,
      default: "",
    },

    weight: {
      type: String,
      default: "",
    },

    dimensions: {
      type: String,
      default: "",
    },

    occasion: [
      {
        type: String,
      },
    ],

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isTrending: {
      type: Boolean,
      default: false,
    },

    isNewArrival: {
      type: Boolean,
      default: false,
    },

    defaultRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    ratings: {
      type: Number,
      default: 0,
    },

    numOfReviews: {
      type: Number,
      default: 0,
    },

    totalSales: {
      type: Number,
      default: 0,
    },

    tags: [
      {
        type: String,
      },
    ],

    seoTitle: {
      type: String,
      default: "",
    },

    seoDescription: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["draft", "active", "out_of_stock"],
      default: "active",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Create text index for search
productSchema.index({
  name: "text",
  description: "text",
  tags: "text",
});

const Product = mongoose.model("Product", productSchema);
export default Product;