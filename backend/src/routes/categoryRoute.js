import express from 'express';
import { protect , adminOnly } from "../middleware/authMiddleware.js";
import { createCategory, getAllCategories, updateCategory, deleteCategory } from "../controllers/categoryController.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.post("/add-category", protect, adminOnly, upload.single("image"), createCategory);
router.get("/get-categories", getAllCategories);
router.put("/update-category/:id", protect, adminOnly, upload.single("image"), updateCategory);
router.delete("/delete-category/:id", protect, adminOnly, deleteCategory);

export default router;
