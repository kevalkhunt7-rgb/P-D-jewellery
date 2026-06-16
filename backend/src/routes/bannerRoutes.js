import express from "express";

import {
  createBanner,
  getAllBanners,
  getAdminBanners,
  updateBanner,
  deleteBanner,
  getBannerById,
} from "../controllers/bannerController.js";

import {
  protect,
  adminOnly,
} from "../middleware/authMiddleware.js";

import upload from "../middleware/multer.js";

const router = express.Router();



// Create Banner
router.post(
  "/create",
  protect,
  adminOnly,

  upload.fields([
    {
      name: "image",
      maxCount: 1,
    },

    {
      name: "mobileImage",
      maxCount: 1,
    },
  ]),

  createBanner
);


// Public Banners
router.get(
  "/all",
  getAllBanners
);


// Admin Banners
router.get(
  "/admin/all",
  protect,
  adminOnly,
  getAdminBanners
);

// Get Single Banner
router.get(
  "/:id",
  protect,
  adminOnly,
  getBannerById
);

// Update Banner
router.put(
  "/update/:id",
  protect,
  adminOnly,

  upload.fields([
    {
      name: "image",
      maxCount: 1,
    },

    {
      name: "mobileImage",
      maxCount: 1,
    },
  ]),

  updateBanner
);


// Delete Banner
router.delete(
  "/delete/:id",
  protect,
  adminOnly,
  deleteBanner
);

export default router;