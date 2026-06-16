import express from "express";
import { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct } from "../controllers/productController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.post("/add-product", protect, adminOnly, upload.array("images", 5), createProduct);
router.get("/get-products", getAllProducts);
router.get("/get-product/:id", getProductById);
router.put("/update-product/:id", protect, adminOnly, upload.array("images", 5), updateProduct);
router.delete("/delete-product/:id", protect, adminOnly, deleteProduct);

export default router;