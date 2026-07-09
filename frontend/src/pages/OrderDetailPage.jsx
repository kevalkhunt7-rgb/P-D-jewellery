import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  CheckCircle,
  Box,
  Truck,
  CheckCircle2,
  MapPin,
  Calendar,
  CreditCard,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  XCircle,
  X,
  AlertTriangle,
  Check
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

// 1. SIMPLE STATUS TIMELINE STEPS
const STATUS_STEPS = [
  { id: 'PENDING', label: 'Pending', icon: ShoppingBag, desc: 'Waiting for payment verification' },
  { id: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle, desc: 'Order has been approved' },
  { id: 'PACKED', label: 'Packed', icon: Box, desc: 'Your items are packed and ready' },
  { id: 'SHIPPED', label: 'Shipped', icon: Truck, desc: 'Handed over to the courier partner' },
  { id: 'DELIVERED', label: 'Delivered', icon: CheckCircle2, desc: 'Order delivered successfully' }
];

// ── Motion presets ──────────────────────────────────────────────────────
const easeOut = [0.16, 1, 0.3, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } }
};

const staggerParent = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.05 }
  }
};

const itemRow = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: easeOut } }
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCancellationModalOpen, setIsCancellationModalOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [isSubmittingCancellation, setIsSubmittingCancellation] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      // 🛡️ 1. Guard against empty state or literal 'undefined' strings
      if (!id || id === 'undefined' || id.trim() === '') {
        console.warn("[OrderDetailPage] Blocked API Call: Order ID is missing.");
        setLoading(false);
        return;
      }

      // 🛡️ 2. Check if ID matches a valid 24-character hex MongoDB ObjectId format
      const isValidMongoId = /^[0-9a-fA-F]{24}$/.test(id);
      if (!isValidMongoId) {
        console.error(`[OrderDetailPage] Blocked API Call: "${id}" is an invalid ID format.`);
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get(`/orders/single/${id}`);
        if (data.success) {
          setOrder(data.order);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error(error.response?.data?.message || 'Failed to load order details.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  // Handle cancellation request
  const handleRequestCancellation = async () => {
    if (!cancellationReason.trim()) {
      toast.error("Please enter a cancellation reason");
      return;
    }

    setIsSubmittingCancellation(true);
    try {
      const { data } = await api.post(`/orders/${id}/request-cancellation`, {
        cancellationReason
      });
      if (data.success) {
        setOrder(data.order);
        toast.success("Cancellation request submitted successfully!");
        setIsCancellationModalOpen(false);
        setCancellationReason("");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to submit cancellation request");
    } finally {
      setIsSubmittingCancellation(false);
    }
  };

  // Handle order status variables
  const normalizedStatus = order?.orderStatus ? order.orderStatus.toUpperCase() : 'PENDING';
  const currentStepIndex = STATUS_STEPS.findIndex(step => step.id === normalizedStatus);
  const isCancelled = normalizedStatus === 'CANCELLED';

  // Check if cancellation is eligible
  const eligibleStatuses = ["PENDING", "CONFIRMED", "PACKED"];
  const isEligibleForCancellation = order && eligibleStatuses.includes(normalizedStatus) && order.cancellationStatus === "None";

  // Calculate loading bar width percentage
  const progressLinePercent = isCancelled || currentStepIndex === -1
    ? 0
    : (currentStepIndex / (STATUS_STEPS.length - 1)) * 100;

  // ── Currency helpers ──────────────────────────────────────────────────────
  // Always prefer the display-currency fields stored in the DB.
  // Fallback chain: displayCurrency → paidCurrency → 'INR'
  const displayCurrency = order?.displayCurrency || order?.paidCurrency || 'INR';
  const isUSD = displayCurrency === 'USD';
  const currencySymbol = isUSD ? '$' : '₹';
  const locale = isUSD ? 'en-US' : 'en-IN';
  const fractionDigits = isUSD ? 2 : 0;

  // Helper: format a monetary value in the order's display currency.
  // For USD orders the DB stores display amounts in displayItemsPrice /
  // displayShippingPrice / displayTotalPrice etc.  For INR orders those
  // display fields equal the raw price fields so either works.
  const fmt = (rawINR, displayVal) => {
    const value = isUSD ? (displayVal ?? rawINR) : rawINR;
    return (value ?? 0).toLocaleString(locale, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: 2,
    });
  };

  // LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF8F3] flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-8 h-8 text-[#B76E79]" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="text-stone-800 text-xs tracking-widest uppercase mt-4 font-bold"
        >
          Loading Order Details...
        </motion.p>
      </div>
    );
  }

  // NOT FOUND STATE
  if (!order) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="min-h-screen bg-[#FDF8F3] text-center flex flex-col items-center justify-center p-6"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: easeOut }}
        >
          <h2 className="font-serif text-2xl text-stone-900 font-bold mb-4">Order Not Found</h2>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 bg-stone-900 text-white text-xs uppercase tracking-widest rounded-full"
          >
            Go Back
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F3] text-[#2C2C2C] font-sans antialiased pb-24 relative overflow-x-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="absolute top-0 left-[-10%] w-[50vw] h-[50vw] bg-gradient-to-tr from-[#FFF0EB] to-[#E8C7B7]/15 rounded-full blur-[140px] pointer-events-none"
      />

      <motion.main
        variants={staggerParent}
        initial="hidden"
        animate="show"
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 relative z-10"
      >

        {/* Back navigation */}
        <motion.button
          variants={fadeUp}
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-stone-800 hover:text-stone-900 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Orders</span>
        </motion.button>

        {/* Order Header Summary Card */}
        <motion.div
          variants={fadeUp}
          className="bg-white/70 backdrop-blur-xl border border-stone-200/80 rounded-2xl p-6 sm:p-8 shadow-xl shadow-stone-200/30 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <motion.span
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.4, ease: easeOut }}
                className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full ${isCancelled ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-stone-900 text-[#FDF8F3]'
                  }`}
              >
                {order.orderStatus || 'PENDING'}
              </motion.span>

              {/* Cancellation & Refund Status Badges */}
              <AnimatePresence>
                {order.cancellationStatus === "Requested" && (
                  <motion.span
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.85, opacity: 0 }}
                    transition={{ duration: 0.3, ease: easeOut }}
                    className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200"
                  >
                    Cancellation Requested
                  </motion.span>
                )}
                {order.cancellationStatus === "Approved" && (
                  <motion.span
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.85, opacity: 0 }}
                    transition={{ duration: 0.3, ease: easeOut }}
                    className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-red-100 text-red-700 border border-red-200"
                  >
                    Cancellation Approved
                  </motion.span>
                )}
                {order.cancellationStatus === "Rejected" && (
                  <motion.span
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.85, opacity: 0 }}
                    transition={{ duration: 0.3, ease: easeOut }}
                    className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-orange-100 text-orange-700 border border-orange-200"
                  >
                    Cancellation Rejected
                  </motion.span>
                )}
                {order.refundStatus === "Pending" && (
                  <motion.span
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.85, opacity: 0 }}
                    transition={{ duration: 0.3, ease: easeOut }}
                    className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200"
                  >
                    Refund Pending
                  </motion.span>
                )}
                {order.refundStatus === "Processing" && (
                  <motion.span
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.85, opacity: 0 }}
                    transition={{ duration: 0.3, ease: easeOut }}
                    className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200"
                  >
                    Refund Processing
                  </motion.span>
                )}
                {order.refundStatus === "Completed" && (
                  <motion.span
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.85, opacity: 0 }}
                    transition={{ duration: 0.3, ease: easeOut }}
                    className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200"
                  >
                    Refund Completed
                  </motion.span>
                )}
                {order.refundStatus === "Failed" && (
                  <motion.span
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.85, opacity: 0 }}
                    transition={{ duration: 0.3, ease: easeOut }}
                    className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-red-100 text-red-700 border border-red-200"
                  >
                    Refund Failed
                  </motion.span>
                )}
              </AnimatePresence>

              {isUSD && <span className="text-sm">✈️</span>}
              <p className="text-xs font-mono text-stone-800 uppercase tracking-wider">ID: {order.razorpayOrderId || order._id}</p>
            </div>
            <h1 className="font-serif text-2xl tracking-wide text-stone-900">Order Summary</h1>
          </div>
          <div className="flex flex-col sm:flex-col items-baseline sm:items-end gap-2 text-left sm:text-right">
            <span className="text-xs text-stone-800 font-bold uppercase tracking-wider">Total Paid</span>
            <motion.span
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease: easeOut }}
              className="text-3xl font-bold bg-gradient-to-r from-[#B76E79] to-[#D4AF37] bg-clip-text text-transparent"
            >
              {currencySymbol}{fmt(order.totalPrice, order.displayTotalPrice)}
              {' '}{displayCurrency}
            </motion.span>

            {/* Cancellation Button */}
            {isEligibleForCancellation && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setIsCancellationModalOpen(true)}
                className="mt-2 px-4 py-1.5 border border-red-200 text-red-700 text-[10px] font-bold uppercase tracking-wider rounded-full hover:bg-red-50 transition-colors"
              >
                Request Cancellation
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* TRACKING TIMELINE */}
        <motion.div
          variants={fadeUp}
          className="bg-white/70 backdrop-blur-xl border border-stone-200/80 rounded-2xl p-6 sm:p-10 shadow-xl shadow-stone-200/30 mb-8"
        >
          <h2 className="font-serif text-lg tracking-wide text-stone-900 mb-12 text-center sm:text-left">Track Your Order</h2>

          {isCancelled ? (
            /* Cancelled Fallback Box */
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: easeOut }}
              className="flex items-center gap-4 p-5 bg-red-50/50 rounded-xl border border-red-100 max-w-xl mx-auto"
            >
              <motion.div
                initial={{ rotate: -20, scale: 0.7, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4, ease: easeOut }}
              >
                <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
              </motion.div>
              <div>
                <h3 className="text-2xl font-semibold text-red-900">Order Cancelled</h3>
                <div className="mt-4 rounded-xl border border-red-100 bg-red-50/50 p-5 max-w-xl">
                  <div className="flex items-start gap-3">
                    {/* Clean, simple warning/info icon */}
                    <span className="text-red-500 mt-0.5 text-xl" aria-hidden="true">⚠️</span>

                    <div>
                      <h3 className="text-lg font-bold text-red-700 leading-6">
                        This order has been cancelled
                      </h3>
                      <p className="mt-1.5 text-sm font-medium text-slate-600 leading-relaxed">
                        Any payments made will be automatically refunded to your original payment method within <span className="font-semibold text-slate-900">5–7 working days</span>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Active 5-Step Progress Track */
            <div className="relative px-2 max-w-3xl mx-auto">
              {/* Background Line */}
              <div className="absolute top-5 left-4 right-4 h-[3px] bg-stone-100 rounded-full" />

              {/* Color Progress Bar Fill */}
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${progressLinePercent}%` }}
                transition={{ duration: 1.1, ease: easeOut, delay: 0.2 }}
                className="absolute top-5 left-4 h-[3px] bg-gradient-to-r from-[#B76E79] to-[#D4AF37] rounded-full shadow-xs"
              />

              {/* Timeline Nodes */}
              <div className="relative flex justify-between items-start">
                {STATUS_STEPS.map((step, index) => {
                  const StepIcon = step.icon;
                  const isPassed = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;

                  return (
                    <div key={step.id} className="flex flex-col items-center relative z-10 w-16 sm:w-24">
                      {/* Step Circle Badge */}
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{
                          scale: 1,
                          opacity: 1,
                        }}
                        transition={{ delay: 0.25 + index * 0.12, duration: 0.4, ease: easeOut }}
                        className={`relative w-11 h-11 rounded-full flex items-center justify-center border-2 transition-colors duration-300
                          ${isPassed
                            ? 'bg-white border-[#B76E79] text-[#B76E79] shadow-sm shadow-[#FFF0EB]'
                            : 'bg-white border-stone-200 text-stone-300'
                          }
                        `}
                      >
                        {isCurrent && (
                          <motion.span
                            className="absolute inset-0 rounded-full bg-[#FFF0EB]"
                            animate={{ scale: [1, 1.45, 1], opacity: [0.7, 0, 0.7] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          />
                        )}
                        <motion.span
                          animate={isCurrent ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                          transition={isCurrent ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : {}}
                          className={`relative z-10 flex items-center justify-center w-full h-full rounded-full ${isCurrent ? 'ring-4 ring-[#FFF0EB]' : ''}`}
                        >
                          <StepIcon className="w-4 h-4 stroke-[1.8]" />
                        </motion.span>
                      </motion.div>

                      {/* Step Status Text */}
                      <p className={`text-[10px] sm:text-xs font-semibold tracking-wide text-center mt-3 transition-colors duration-300
                        ${isPassed ? 'text-stone-900' : 'text-stone-800'}
                      `}>
                        {step.label}
                      </p>
                      <p className="text-[9px] text-stone-800 font-bold text-center leading-tight mt-1 hidden sm:block">
                        {step.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>

        {/* MAIN DETAILS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">

          {/* ITEMS LIST */}
          <motion.div
            variants={fadeUp}
            className="md:col-span-7 bg-white/60 backdrop-blur-xl border border-stone-200/60 rounded-2xl p-6 shadow-xl shadow-stone-200/20 space-y-4"
          >
            <h3 className="font-serif text-base tracking-wide text-stone-900 pb-3 border-b border-stone-100">
              Items Ordered
            </h3>
            <motion.div
              variants={staggerParent}
              initial="hidden"
              animate="show"
              className="divide-y divide-stone-100 max-h-[380px] overflow-y-auto pr-1 no-scrollbar"
            >
              {order.orderItems?.map((item, idx) => (
                <motion.div
                  key={idx}
                  variants={itemRow}
                  whileHover={{ x: 3 }}
                  className="py-4 flex gap-4 first:pt-0 last:pb-0"
                >
                  <div className="w-14 h-16 bg-stone-50 border border-stone-100 rounded-xl overflow-hidden flex-shrink-0">
                    <motion.img
                      whileHover={{ scale: 1.08 }}
                      transition={{ duration: 0.35, ease: easeOut }}
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="text-xs font-semibold text-stone-900 leading-tight">{item.name}</h4>
                        {item.selectedFinish && (
                          <p className="text-[9px] font-medium tracking-wider text-[#B76E79] uppercase mt-0.5">
                            {item.selectedFinish}
                          </p>
                        )}
                        <p className="text-[15px] text-stone-800 font-bold mt-0.5">Qty: {item.quantity || 1}</p>
                      </div>
                      <span className=" text-xs font-bold text-stone-900">
                        {currencySymbol}{fmt(
                          item.price * (item.quantity || 1),
                          item.displayTotalPrice ?? (item.displayPrice ? item.displayPrice * (item.quantity || 1) : undefined)
                        )}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* FINANCIAL BREAKDOWN */}
            <div className="pt-4 border-t border-stone-100 space-y-2.5 text-xs text-stone-500 font-bold">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span >{currencySymbol}{fmt(order.itemsPrice, order.displayItemsPrice)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                  <span className="font-serif">-{currencySymbol}{fmt(order.discountAmount, isUSD ? Number(((order.discountAmount || 0) / (order.exchangeRate || 1)).toFixed(2)) : undefined)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-serif">
                  {(isUSD ? (order.displayShippingPrice ?? order.shippingPrice) : order.shippingPrice) === 0
                    ? 'Free Shipping'
                    : `${currencySymbol}${fmt(order.shippingPrice, order.displayShippingPrice)}`}
                </span>
              </div>
            </div>
          </motion.div>

          {/* SIDEBAR LOGISTICS INFO */}
          <motion.div variants={fadeUp} className="md:col-span-5 space-y-6">

            {/* SHIPPING ADDRESS */}
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.25, ease: easeOut }}
              className="bg-white/60 backdrop-blur-xl border border-stone-200/60 rounded-2xl p-6 shadow-xl shadow-stone-200/20"
            >
              <h3 className="font-serif text-base tracking-wide text-stone-900 pb-3 border-b border-stone-100 mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#B76E79]" /> Shipping Address
              </h3>
              <div className="text-xs space-y-2">
                <p className="font-semibold text-stone-800">{order.shippingAddress?.fullName}</p>
                <p className="text-stone-500 font-bold leading-relaxed">{order.shippingAddress?.address}</p>
                <p className="text-stone-500 font-bold">
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.postalCode}
                </p>
                <div className="pt-3 border-t border-stone-100 mt-3 text-[10px] text-stone-800 font-mono">
                  PHONE: {order.shippingAddress?.phone}
                </div>
              </div>
            </motion.div>

            {/* PAYMENT INFORMATION */}
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.25, ease: easeOut }}
              className="bg-white/60 backdrop-blur-xl border border-stone-200/60 rounded-2xl p-6 shadow-xl shadow-stone-200/20"
            >
              <h3 className="font-serif text-base tracking-wide text-stone-900 pb-3 border-b border-stone-100 mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#B76E79]" /> Payment Details
              </h3>
              <div className="text-xs space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-stone-800 font-bold">Method</span>
                  <span className="font-bold text-stone-800">{order.paymentMethod || 'Razorpay'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-800 font-bold">Transaction ID</span>
                  <span className="font-bold text-[10px] text-stone-600 truncate max-w-[120px]" title={order.paymentId}>
                    {order.paymentId || 'Verified'}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2.5 border-t border-stone-100 text-[10px] text-stone-800">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Date Placed</span>
                  <span>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' }) : 'Recent'}</span>
                </div>
              </div>
            </motion.div>

            {/* ASSURANCE BLOCK */}
            <div className="p-4 rounded-xl border border-[#E8C7B7]/20 bg-[#FFF0EB]/20 flex items-center gap-3">
              <motion.span
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <ShieldCheck className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
              </motion.span>
              <p className="text-[10px] text-stone-500 font-bold leading-snug">
                Your order transaction is secure and covered under buyer protection terms.
              </p>
            </div>

          </motion.div>

        </div>

      </motion.main>

      {/* Cancellation Request Modal */}
      <AnimatePresence>
        {isCancellationModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsCancellationModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ duration: 0.3, ease: easeOut }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#FDF8F3] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-stone-100">
                <div className="flex items-center gap-3">
                  <motion.span
                    animate={{ rotate: [0, -8, 8, -4, 0] }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <AlertTriangle className="w-5 h-5 text-[#B76E79]" />
                  </motion.span>
                  <h3 className="font-serif text-lg tracking-wide text-stone-900">Request Order Cancellation</h3>
                </div>
                <motion.button
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setIsCancellationModalOpen(false)}
                  className="p-1 hover:bg-stone-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-stone-500" />
                </motion.button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-xs text-stone-600 leading-relaxed">
                  Please provide a reason for cancelling your order. This helps us improve our service.
                </p>

                <textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Enter your cancellation reason..."
                  className="w-full h-32 bg-white border border-stone-200 rounded-xl px-4 py-3 text-xs text-stone-800 placeholder:text-stone-800 focus:outline-none focus:border-[#B76E79] resize-none transition-colors"
                />

                <div className="flex gap-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setIsCancellationModalOpen(false)}
                    className="flex-1 px-4 py-2.5 border border-stone-200 text-stone-700 text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-stone-50 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={!isSubmittingCancellation && cancellationReason.trim() ? { scale: 1.02 } : {}}
                    whileTap={!isSubmittingCancellation && cancellationReason.trim() ? { scale: 0.97 } : {}}
                    onClick={handleRequestCancellation}
                    disabled={isSubmittingCancellation || !cancellationReason.trim()}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {isSubmittingCancellation ? (
                        <motion.span
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        </motion.span>
                      ) : (
                        <motion.span
                          key="label"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          Confirm Cancellation
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}