import bcrypt from "bcryptjs";
import OTPVerification from "../model/otpModel.js";
import User from "../model/userModel.js";
import { sendOTPEmail } from "../config/emailService.js";

/**
 * Generate a 6-digit random numeric code.
 */
const generateRandomOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * @desc    Send OTP to user's email
 * @route   POST /api/auth/send-otp
 * @access  Public
 */
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Prevent duplicate registration check
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered",
      });
    }

    const rawOtp = generateRandomOTP();
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(rawOtp, salt);
    
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Upsert the OTP document in the DB (only 1 valid OTP record per email at a time)
    await OTPVerification.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        otp: hashedOtp,
        expiresAt: expiryTime,
        attempts: 0,
        isVerified: false,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Dispatch the email
    const emailResult = await sendOTPEmail(email, rawOtp);

    let infoMessage = "Verification code has been sent to your email";
    if (emailResult.method === "console" || emailResult.method === "fallback-console") {
      infoMessage += " (Check backend terminal console for OTP code)";
    }

    res.status(200).json({
      success: true,
      message: infoMessage,
    });
  } catch (error) {
    console.error("sendOTP Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

/**
 * @desc    Verify OTP code
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP code are required",
      });
    }

    const lowercaseEmail = email.toLowerCase();
    const otpRecord = await OTPVerification.findOne({ email: lowercaseEmail });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Verification code not found or expired. Please request a new one.",
      });
    }

    // Check expiration
    if (new Date(otpRecord.expiresAt) < new Date()) {
      await OTPVerification.deleteOne({ email: lowercaseEmail });
      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new one.",
      });
    }

    // Brute-force protection: check failed attempts limit
    if (otpRecord.attempts >= 5) {
      return res.status(429).json({
        success: false,
        message: "Too many failed attempts. Please request a new verification code.",
      });
    }

    // Compare OTP
    const isMatch = await bcrypt.compare(otp, otpRecord.otp);

    if (!isMatch) {
      // Increment failed attempts
      otpRecord.attempts += 1;
      await otpRecord.save();

      const remaining = 5 - otpRecord.attempts;
      return res.status(400).json({
        success: false,
        message: `Invalid verification code. You have ${remaining} attempts remaining.`,
      });
    }

    // Successful OTP match
    // Grant verification status valid for 2 minutes to complete registration
    otpRecord.isVerified = true;
    otpRecord.expiresAt = new Date(Date.now() + 2 * 60 * 1000); 
    await otpRecord.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully. You may now complete your registration.",
    });
  } catch (error) {
    console.error("verifyOTP Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};
