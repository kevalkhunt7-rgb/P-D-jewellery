import mongoose from "mongoose";

const goldRateAuditSchema = new mongoose.Schema(
  {
    oldRate: {
      type: Number,
      required: true,
    },
    newRate: {
      type: Number,
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only record creation time
  }
);

const GoldRateAudit = mongoose.model("GoldRateAudit", goldRateAuditSchema, "gold_rate_audits");
export default GoldRateAudit;
