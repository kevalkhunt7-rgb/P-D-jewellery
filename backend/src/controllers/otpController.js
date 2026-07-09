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
      message: error.message || (error && typeof error === 'object' ? JSON.stringify(error) : String(error)),
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
      message: error.message || (error && typeof error === 'object' ? JSON.stringify(error) : String(error)),
    });
  }
};

/**
 * @desc    Send OTP to email for password reset (user MUST already exist)
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const sendForgotPasswordOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Please provide a valid email address" });
    }

    // Only send OTP if the user already has an account
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: "No account found with that email address" });
    }

    const rawOtp = generateRandomOTP();
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(rawOtp, salt);
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await OTPVerification.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        otp: hashedOtp,
        expiresAt: expiryTime,
        attempts: 0,
        isVerified: false,
        purpose: "password-reset",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await sendOTPEmail(email, rawOtp);

    res.status(200).json({
      success: true,
      message: "Password reset OTP has been sent to your email",
    });
  } catch (error) {
    console.error("sendForgotPasswordOTP Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || (error && typeof error === 'object' ? JSON.stringify(error) : String(error)),
    });
  }
};

/**
 * @desc    Verify OTP and set a new password
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: "Email, OTP and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const lowercaseEmail = email.toLowerCase();
    const otpRecord = await OTPVerification.findOne({ email: lowercaseEmail, purpose: "password-reset" });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "OTP not found or expired. Please request a new one." });
    }

    if (new Date(otpRecord.expiresAt) < new Date()) {
      await OTPVerification.deleteOne({ email: lowercaseEmail });
      return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
    }

    if (otpRecord.attempts >= 5) {
      return res.status(429).json({ success: false, message: "Too many failed attempts. Please request a new OTP." });
    }

    const isMatch = await bcrypt.compare(otp, otpRecord.otp);
    if (!isMatch) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      const remaining = 5 - otpRecord.attempts;
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. You have ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
      });
    }

    // Hash new password and update user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const user = await User.findOneAndUpdate(
      { email: lowercaseEmail },
      { $set: { password: hashedPassword } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Cleanup OTP record
    await OTPVerification.deleteOne({ email: lowercaseEmail });

    res.status(200).json({
      success: true,
      message: "Password reset successful. You can now sign in with your new password.",
    });
  } catch (error) {
    console.error("resetPassword Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || (error && typeof error === 'object' ? JSON.stringify(error) : String(error)),
    });
  }
};
