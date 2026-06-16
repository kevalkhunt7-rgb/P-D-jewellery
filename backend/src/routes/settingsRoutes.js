import express from "express";
import { getSettings, updateSettings } from "../controllers/settingsController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import upload from "../middleware/multer.js";

const router = express.Router();

// Define image upload fields (handles logo, favicon, ogImage, heroBanner)
const settingsUpload = upload.fields([
  { name: "logo", maxCount: 1 },
  { name: "favicon", maxCount: 1 },
  { name: "ogImage", maxCount: 1 },
  { name: "heroBanner", maxCount: 1 },
]);

router.get("/", protect, adminOnly, getSettings);

// Update by section name (general, seo, order, etc.)
router.put("/update/:section", protect, adminOnly, settingsUpload, updateSettings);

export default router;
