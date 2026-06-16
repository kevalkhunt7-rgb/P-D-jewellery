import jwt from "jsonwebtoken";
import User from "../model/userModel.js";




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




export const adminOnly = async (req, res, next) => {
  try {
    // Check role
    if (req.user && req.user.role === "admin") {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only",
      });
    }
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};