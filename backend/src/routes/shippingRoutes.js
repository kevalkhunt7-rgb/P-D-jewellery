import express from "express";
import {
  getRegions,
  getRegionById,
  createRegion,
  updateRegion,
  deleteRegion,
  getPublicRegions
} from "../controllers/shippingRegionController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public Route
router.get("/public", getPublicRegions);

// Protected Admin Routes
router.get("/", protect, adminOnly, getRegions);
router.get("/:id", protect, adminOnly, getRegionById);
router.post("/", protect, adminOnly, createRegion);
router.put("/:id", protect, adminOnly, updateRegion);
router.delete("/:id", protect, adminOnly, deleteRegion);

export default router;
