import dotenv from "dotenv";
dotenv.config();
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import connectDB from './src/config/db.js';
import authRoutes from './src/routes/authRoutes.js';
import productRoutes from './src/routes/productRoute.js';
import categoryRoutes from './src/routes/categoryRoute.js';
import orderRoutes from './src/routes/orderRoute.js';
import cartRoutes from './src/routes/cartRoutes.js';
import reviewRoutes from './src/routes/reviewRoutes.js';
import couponRoutes from './src/routes/couponRoutes.js';
import bannerRoutes from './src/routes/bannerRoutes.js';
import whishlistRoutes from './src/routes/wishlistRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import settingsRoutes from './src/routes/settingsRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js'
import contactRoutes from './src/routes/contactRoutes.js';
import shippingRoutes from './src/routes/shippingRoutes.js';
import { seedDefaultRegions } from './src/utils/shippingSeeder.js';
import dns from 'dns';
import { fetchAndUpdateExchangeRate } from './src/utils/exchangeRateService.js';

// Force stable DNS lookups to avoid connection resets with DB clusters/APIs
// Force Node to prioritize IPv4 over IPv6 to fix SMTP & Fetch connection resets
dns.setDefaultResultOrder('ipv4first');

// Connect Database
connectDB().then(() => {
  seedDefaultRegions();
});

// Fetch exchange rate on server start
fetchAndUpdateExchangeRate();

// Schedule exchange rate update every 6 hours
cron.schedule('0 */6 * * *', async () => {
  console.log('Running scheduled exchange rate update...');
  await fetchAndUpdateExchangeRate();
});

const app = express();

// Load Helmet for HTTP header security
app.use(helmet());

// 1. FIXED: Explicit CORS Policy to prevent ERR_CONNECTION_RESET
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5001', 'https://p-d-jewellery.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global Request Logger Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Base Route
app.get("/", (req, res) => {
  res.send("API is Running");
});

// Rate Limiter for OTP verification/sending to prevent brute-force
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 OTP requests per windowMs
  message: {
    success: false,
    message: "Too many OTP requests from this IP. Please try again after 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/auth/send-otp", otpLimiter);
app.use("/api/auth/verify-otp", otpLimiter);

// Rate Limiter for Login and Registration to prevent brute-force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 login/register requests per windowMs
  message: {
    success: false,
    message: "Too many login/registration attempts. Please try again after 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// API Route Bindings
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/wishlist", whishlistRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/shipping", shippingRoutes);

// Error Handling Middleware Fallback (Keeps server alive if routes throw errors)
app.use((err, req, res, next) => {
  console.error("Internal Server Error Stack:", err.stack);
  res.status(500).json({ success: false, message: "Internal server fallback exception triggered" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});