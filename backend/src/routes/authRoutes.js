import express from "express";
import { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateProfile, 
  addAddress, 
  deleteAddress 
} from "../controllers/authController.js";   
import {googleLogin} from "../controllers/googleAuthController.js";
import { sendOTP, verifyOTP, sendForgotPasswordOTP, resetPassword } from "../controllers/otpController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleLogin); 
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/forgot-password", sendForgotPasswordOTP);
router.post("/reset-password", resetPassword);
router.get("/profile", protect, getUserProfile);
router.put("/update-profile", protect, upload.single("avatar"), updateProfile);
router.post("/address/add", protect, addAddress);
router.delete("/address/:addressId", protect, deleteAddress);

export default router;