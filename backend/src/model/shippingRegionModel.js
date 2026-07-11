import mongoose from "mongoose";

const weightRuleSchema = new mongoose.Schema({
  minWeight: {
    type: Number,
    required: true,
    min: 0
  },
  maxWeight: {
    type: Number,
    required: true
  },
  charge: { 
    type: Number,
    required: true,
    min: 0
  }
});

const shippingRegionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    countries: {
      type: [String],
      default: []
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },
    flatShippingCharge: {
      type: Number,
      required: true,
      min: 0
    },
    freeShippingThreshold: {
      type: Number,
      default: null,
      min: 0
    },
    deliveryTime: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active"
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    weightRules: {
      type: [weightRuleSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

shippingRegionSchema.pre("save", async function () {
  if (this.countries) {
    this.countries = this.countries.map(c => c.toUpperCase().trim());
  }

  if (this.countries && this.countries.length > 0) {
    const ShippingRegion = this.constructor;

    const duplicate = await ShippingRegion.findOne({
      _id: { $ne: this._id },
      countries: { $in: this.countries }
    });

    if (duplicate) {
      const overlaps = duplicate.countries.filter(c =>
        this.countries.includes(c)
      );

      throw new Error(
        `Country code ${overlaps.join(", ")} is already assigned to region "${duplicate.name}".`
      );
    }
  }
});

// Indexes
shippingRegionSchema.index({ status: 1 });
shippingRegionSchema.index({ countries: 1 });

const ShippingRegion = mongoose.model("ShippingRegion", shippingRegionSchema);
export default ShippingRegion;
