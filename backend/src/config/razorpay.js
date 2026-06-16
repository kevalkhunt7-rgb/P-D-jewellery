// config/razorpay.js

import Razorpay from "razorpay";
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});
console.log("API KEY:", process.env.RAZORPAY_API_KEY);
console.log("API SECRET:", process.env.RAZORPAY_API_SECRET);
export default razorpay;
