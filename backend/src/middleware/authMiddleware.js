import jwt from "jsonwebtoken";
import User from "../model/userModel.js";

// 🔐 Authentication Guard: Verifies the JWT token and attaches user to the request
export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(error);

    return res.status(401).json({
      success: false,
      message: "Not authorized, invalid token",
    });
  }
};

// 🔐 Shared Admin Guard: Allows BOTH regular admins and superAdmins safely
export const adminOnly = async (req, res, next) => {
  try {
    // 🛠️ FIX: Normalize string casing to lowercase to avoid case mismatches
    const userRole = req.user?.role ? req.user.role.toLowerCase() : "";

    if (userRole === "admin" || userRole === "superadmin") {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin access level required.",
      });
    }
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// 👑 Exclusive SuperAdmin Guard: Lock down routes like /api/settings completely
export const superAdminOnly = async (req, res, next) => {
  try {
    // 🛠️ FIX: Normalize string casing here too
    const userRole = req.user?.role ? req.user.role.toLowerCase() : "";

    if (userRole === "superadmin") {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: "Access denied. SuperAdmin privileges required.",
      });
    }
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};