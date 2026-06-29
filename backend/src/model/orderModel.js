import mongoose from "mongoose";
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderItems: [
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
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        // Immutable Snapshot Fields at time of purchase
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
        totalPrice: {
          type: Number,
          required: true,
        },
        displayCurrency: {
          type: String,
          default: "INR",
        },
        displayPrice: {
          type: Number,
          default: 0,
        },
        displaySalePrice: {
          type: Number,
          default: 0,
        },
        displayOriginalPrice: {
          type: Number,
          default: 0,
        },
        displayTotalPrice: {
          type: Number,
          default: 0,
        },
      },
    ],
    shippingAddress: {
      fullName: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      postalCode: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        default: "India",
      },
    },
    paymentMethod: {
      type: String,
      enum: ["Razorpay", "ONLINE", "PAYPAL"],
      default: "Razorpay",
    },
    paymentInfo: {
      id: {
        type: String,
        default: "",
      },
      status: {
        type: String,
        default: "",
      },
      razorpayOrderId: {
        type: String,
        default: "",
      },
      razorpayPaymentId: {
        type: String,
        default: "",
      },
      razorpaySignature: {
        type: String,
        default: "",
      },
      paypalOrderId: {
        type: String,
        default: "",
      },
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    couponCode: {
      type: String,
      default: "",
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    displayCurrency: {
      type: String,
      default: "INR",
    },
    displayItemsPrice: {
      type: Number,
      default: 0,
    },
    displayShippingPrice: {
      type: Number,
      default: 0,
    },
    displayTaxPrice: {
      type: Number,
      default: 0,
    },
    displayTotalPrice: {
      type: Number,
      default: 0,
    },
    exchangeRate: {
      type: Number,
      default: 1,
    },
    // Original payment currency and amount (what customer actually paid)
    paidCurrency: {
      type: String,
      default: "INR",
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    orderStatus: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "PACKED",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
        "RETURNED",
        "FAILED",
      ],
      default: "PENDING",
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    // Cancellation & Refund Fields
    cancellationStatus: {
      type: String,
      enum: ["None", "Requested", "Approved", "Rejected"],
      default: "None",
    },
    cancellationReason: {
      type: String,
      default: "",
    },
    cancellationRequestedAt: {
      type: Date,
    },
    cancellationReviewedAt: {
      type: Date,
    },
    cancellationReviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    refundStatus: {
      type: String,
      enum: [
        "NotRequired",
        "Pending",
        "Processing",
        "Completed",
        "Failed",
      ],
      default: "NotRequired",
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundId: {
      type: String,
      default: "",
    },
    // NOTE: this field was previously declared twice in the schema
    // (here and again at the bottom). Mongoose silently keeps the last
    // definition, but the duplicate served no purpose and risked
    // confusing future edits, so it's been removed.
    refundFailureReason: {
      type: String,
      default: "",
    },
    refundInitiatedAt: {
      type: Date,
    },
    refundProcessedAt: {
      type: Date,
    },
    refundCompletedAt: Date,
  },
  {
    timestamps: true,
  }
);
const Order = mongoose.model("Order", orderSchema);
export default Order;