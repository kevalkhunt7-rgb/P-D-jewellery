import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../model/userModel.js";
import cloudinary from "../config/cloudinary.js";
import OTPVerification from "../model/otpModel.js";



const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};


export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;


    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    const lowercaseEmail = email.toLowerCase();

    // 1. Verify OTP record exists, isVerified=true, and is not expired
    const otpRecord = await OTPVerification.findOne({
      email: lowercaseEmail,
      isVerified: true,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Email verification required. Please verify your OTP code first.",
      });
    }

    const existingUser = await User.findOne({ email: lowercaseEmail });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }


    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

 
    const user = await User.create({
      name,
      email: lowercaseEmail,
      password: hashedPassword,
      phone,
      role: "user", // Explicitly set default role
      isVerified: true, // Mark verified since OTP is confirmed
    });

    // Delete OTP record since it was successfully consumed
    await OTPVerification.deleteOne({ email: lowercaseEmail });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,

      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};



export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

   
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,

      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};





export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        addresses: user.addresses,
        wishlist: user.wishlist
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================= UPDATE PROFILE =================
export const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const userId = req.user._id;

    console.log("Update profile request:", { userId, name, phone, hasFile: !!req.file });

    const updateFields = {};
    if (name) updateFields.name = name;
    if (phone) updateFields.phone = phone;

    if (req.file) {
      const user = await User.findById(userId);
      if (user?.avatar?.public_id) {
        await cloudinary.uploader.destroy(user.avatar.public_id).catch(err => console.log("Cloudinary cleanup error:", err));
      }
      updateFields.avatar = {
        url: req.file.path,
        public_id: req.file.filename,
      };
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    console.log("User updated successfully:", updatedUser._id);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, message: "Server Error: " + error.message });
  }
};

// ================= ADDRESS MANAGEMENT =================
export const addAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { fullName, phone, addressLine, city, state, zipCode, country, isDefault } = req.body;

    console.log("Add address request:", { userId, fullName, city });

    const newAddress = { fullName, phone, addressLine, city, state, zipCode, country, isDefault };

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    } else if (user.addresses.length === 0) {
      newAddress.isDefault = true;
    }

    user.addresses.push(newAddress);
    await user.save();

    console.log("Address added successfully to user:", user._id);

    res.status(201).json({ 
      success: true, 
      message: "Address added", 
      addresses: user.addresses,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        addresses: user.addresses
      }
    });
  } catch (error) {
    console.error("Add address error:", error);
    res.status(500).json({ success: false, message: "Server Error: " + error.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.addressId);
    await user.save();
    res.status(200).json({ 
      success: true, 
      message: "Address deleted", 
      addresses: user.addresses,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        addresses: user.addresses
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};