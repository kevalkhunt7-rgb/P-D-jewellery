import express from "express";
import { getSettings, getPublicSettings, updateSettings, getGoldRate, updateGoldRate } from "../controllers/settingsController.js";
import { protect, superAdminOnly, adminOnly } from "../middleware/authMiddleware.js";
import upload from "../middleware/multer.js";

const router = express.Router();

// Define image upload fields (handles logo, favicon, ogImage, heroBanner)
const settingsUpload = upload.fields([
  { name: "logo", maxCount: 1 },
  { name: "favicon", maxCount: 1 },
  { name: "ogImage", maxCount: 1 },
  { name: "heroBanner", maxCount: 1 },
]);

// Public route for frontend to fetch settings
router.get("/public", getPublicSettings);
router.get("/gold-rate/public", getGoldRate);

// Admin routes
router.get("/", protect, superAdminOnly, getSettings);
router.put("/update/:section", protect, superAdminOnly, settingsUpload, updateSettings);

router.get("/gold-rate", protect, adminOnly, getGoldRate);
router.put("/gold-rate", protect, adminOnly, updateGoldRate);

export default router;
