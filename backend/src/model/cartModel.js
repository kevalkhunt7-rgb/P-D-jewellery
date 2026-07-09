import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    cartItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

        name: {
          type: String,
          required: true,
        },

        image: {
          type: String,
          required: true,
        },

        // Convenience field — always mirrors lockedPricing.salePrice.
        // Kept for backward compatibility with serialization and frontend.
        price: {
          type: Number,
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
          default: 1,
        },

        stock: {
          type: Number,
          default: 0,
        },

        // ========== LOCKED PRICING SNAPSHOT ==========
        // Captured at add-to-cart time using the gold rate active at that moment.
        // Checkout reads from here — it never calls calculatePriceBreakdown() again.
        // This prevents gold-rate drift and price tampering.
        lockedPricing: {
          goldRate24kt: {
            type: Number,
            required: true,
          },
          purity: {
            type: String,
            required: true,
          },
          netWeight: {
            type: Number,
            required: true,
          },
          makingChargeType: {
            type: String,
            required: true,
            enum: ["per_gram", "percentage"],
          },
          makingChargeValue: {
            type: Number,
            required: true,
          },
          metalValue: {
            type: Number,
            required: true,
          },
          makingCharge: {
            type: Number,
            required: true,
          },
          cgst: {
            type: Number,
            required: true,
          },
          sgst: {
            type: Number,
            required: true,
          },
          originalPrice: {
            type: Number,
            required: true,
          },
          discountPercentage: {
            type: Number,
            required: true,
            default: 0,
          },
          salePrice: {
            type: Number,
            required: true,
          },
          lockedAt: {
            type: Date,
            required: true,
            default: Date.now,
          },
        },
      },
    ],

    totalItems: {
      type: Number,
      default: 0,
    },

    totalPrice: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;