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

    specifications: [
      {
        label: {
          type: String,
          trim: true,
        },
        value: {
          type: String,
          trim: true,
          default: "",
        },
      },
    ],

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
      enum: ["GOLD", "SILVER"],
      default: "GOLD",
    },

    purity: {
      type: String,
      required: true,
      enum: [
        "22KT", "18KT", "14KT", "9KT", "24KT",
        "925 Sterling", "950 Platinum", "999 Platinum", "925", "999",
        "999 Fine", "958", "900", "835", "800"
      ],
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
      required: true,
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

    makingChargeType: {
      type: String,
      required: true,
      enum: ["per_gram", "percentage"],
      default: "per_gram",
    },

    makingChargeValue: {
      type: Number,
      required: true,
      default: 0,
    },

    extraCharges: [
      {
        label: { type: String, required: true },
        value: { type: Number, required: true, default: 0 }
      }
    ],

    cgstRate: {
      type: Number,
      default: 1.5, // CGST percentage
    },

    sgstRate: {
      type: Number,
      default: 1.5, // SGST percentage
    },

    gst: {
      type: Number,
      default: 3, // GST percentage (for backward compatibility)
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

    gender: {
      type: String,
      enum: ["male", "female", "unisex"],
      default: "unisex",
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
