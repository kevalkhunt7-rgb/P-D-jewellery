import mongoose from "mongoose";

const silverRateAuditSchema = new mongoose.Schema(
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

const SilverRateAudit = mongoose.model("SilverRateAudit", silverRateAuditSchema, "silver_rate_audits");
export default SilverRateAudit;
