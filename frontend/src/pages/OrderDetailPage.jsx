import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  AlertTriangle
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

  // LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF8F3] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#B76E79] animate-spin" />
        <p className="text-stone-400 text-xs tracking-widest uppercase mt-4 font-light">Loading Order Details...</p>
      </div>
    );
  }

  // NOT FOUND STATE
  if (!order) {
    return (
      <div className="min-h-screen bg-[#FDF8F3] text-center flex flex-col items-center justify-center p-6">
        <h2 className="font-serif text-2xl text-stone-900 font-light mb-4">Order Not Found</h2>
        <button onClick={() => navigate(-1)} className="px-6 py-2.5 bg-stone-900 text-white text-xs uppercase tracking-widest rounded-full">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F3] text-[#2C2C2C] font-sans antialiased pb-24 relative overflow-x-hidden">
      <div className="absolute top-0 left-[-10%] w-[50vw] h-[50vw] bg-gradient-to-tr from-[#FFF0EB] to-[#E8C7B7]/15 rounded-full blur-[140px] pointer-events-none" />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 relative z-10">
        
        {/* Back navigation */}
        <button 
          onClick={() => navigate(-1)} 
          className="group flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-stone-400 hover:text-stone-900 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Orders</span>
        </button>

        {/* Order Header Summary Card */}
        <div className="bg-white/70 backdrop-blur-xl border border-stone-200/80 rounded-2xl p-6 sm:p-8 shadow-xl shadow-stone-200/30 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full ${
                isCancelled ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-stone-900 text-[#FDF8F3]'
              }`}>
                {order.orderStatus || 'PENDING'}
              </span>
              
              {/* Cancellation & Refund Status Badges */}
              {order.cancellationStatus === "Requested" && (
                <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                  Cancellation Requested
                </span>
              )}
              {order.cancellationStatus === "Approved" && (
                <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-red-100 text-red-700 border border-red-200">
                  Cancellation Approved
                </span>
              )}
              {order.cancellationStatus === "Rejected" && (
                <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                  Cancellation Rejected
                </span>
              )}
              {order.refundStatus === "Pending" && (
                <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">
                  Refund Pending
                </span>
              )}
              {order.refundStatus === "Processing" && (
                <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                  Refund Processing
                </span>
              )}
              {order.refundStatus === "Completed" && (
                <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                  Refund Completed
                </span>
              )}
              {order.refundStatus === "Failed" && (
                <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-red-100 text-red-700 border border-red-200">
                  Refund Failed
                </span>
              )}
              
              {order.currency === 'USD' && <span className="text-sm">✈️</span>}
              <p className="text-xs font-mono text-stone-400 uppercase tracking-wider">ID: {order.razorpayOrderId || order._id}</p>
            </div>
            <h1 className="font-serif text-2xl tracking-wide text-stone-900">Order Summary</h1>
          </div>
          <div className="flex flex-col sm:flex-col items-baseline sm:items-end gap-2 text-left sm:text-right">
            <span className="text-xs text-stone-400 font-light uppercase tracking-wider">Total Paid</span>
            <span className="font-serif text-2xl font-semibold bg-gradient-to-r from-[#B76E79] to-[#D4AF37] bg-clip-text text-transparent">
              {order.currencySymbol || '₹'}{order.totalPrice?.toLocaleString(order.currency === 'USD' ? 'en-US' : 'en-IN', { minimumFractionDigits: order.currency === 'USD' ? 2 : 0, maximumFractionDigits: 2 })}
              {order.currency === 'USD' ? ' USD' : ' INR'}
            </span>
            
            {/* Cancellation Button */}
            {isEligibleForCancellation && (
              <button
                onClick={() => setIsCancellationModalOpen(true)}
                className="mt-2 px-4 py-1.5 border border-red-200 text-red-700 text-[10px] font-bold uppercase tracking-wider rounded-full hover:bg-red-50 transition-colors"
              >
                Request Cancellation
              </button>
            )}
          </div>
        </div>

        {/* TRACKING TIMELINE */}
        <div className="bg-white/70 backdrop-blur-xl border border-stone-200/80 rounded-2xl p-6 sm:p-10 shadow-xl shadow-stone-200/30 mb-8">
          <h2 className="font-serif text-lg tracking-wide text-stone-900 mb-12 text-center sm:text-left">Track Your Order</h2>
          
          {isCancelled ? (
            /* Cancelled Fallback Box */
            <div className="flex items-center gap-4 p-5 bg-red-50/50 rounded-xl border border-red-100 max-w-xl mx-auto">
              <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
              <div>
                <h3 className="text-2xl font-semibold text-red-900">Order Cancelled</h3>
                <p className="text-xl text-red-600/80 font-semibold mt-0.5">
                  This order has been cancelled. Any payments made will be automatically refunded to your original payment method.
                </p>
              </div>
            </div>
          ) : (
            /* Active 5-Step Progress Track */
            <div className="relative px-2 max-w-3xl mx-auto">
              {/* Background Line */}
              <div className="absolute top-5 left-4 right-4 h-[3px] bg-stone-100 rounded-full" />
              
              {/* Color Progress Bar Fill */}
              <motion.div 
                initial={{ width: '0%' }}
                animate={{ width: `${progressLinePercent}%` }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="absolute top-5 left-4 h-[3px] bg-[#B76E79] rounded-full shadow-xs"
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
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-300
                          ${isPassed 
                            ? 'bg-white border-[#B76E79] text-[#B76E79] shadow-sm shadow-[#FFF0EB]' 
                            : 'bg-white border-stone-200 text-stone-300'
                          }
                          ${isCurrent ? 'ring-4 ring-[#FFF0EB] scale-110' : ''}
                        `}
                      >
                        <StepIcon className="w-4 h-4 stroke-[1.8]" />
                      </motion.div>

                      {/* Step Status Text */}
                      <p className={`text-[10px] sm:text-xs font-semibold tracking-wide text-center mt-3 transition-colors duration-300
                        ${isPassed ? 'text-stone-900' : 'text-stone-400'}
                      `}>
                        {step.label}
                      </p>
                      <p className="text-[9px] text-stone-400 font-light text-center leading-tight mt-1 hidden sm:block">
                        {step.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* MAIN DETAILS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* ITEMS LIST */}
          <div className="md:col-span-7 bg-white/60 backdrop-blur-xl border border-stone-200/60 rounded-2xl p-6 shadow-xl shadow-stone-200/20 space-y-4">
            <h3 className="font-serif text-base tracking-wide text-stone-900 pb-3 border-b border-stone-100">
              Items Ordered
            </h3>
            <div className="divide-y divide-stone-100 max-h-[380px] overflow-y-auto pr-1 no-scrollbar">
              {order.orderItems?.map((item, idx) => (
                <div key={idx} className="py-4 flex gap-4 first:pt-0 last:pb-0">
                  <div className="w-14 h-16 bg-stone-50 border border-stone-100 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
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
                        <p className="text-[10px] text-stone-400 font-light mt-0.5">Qty: {item.quantity || 1}</p>
                      </div>
                      <span className="font-serif text-xs font-medium text-stone-900">
                        {order.currencySymbol || '₹'}{(item.price * (item.quantity || 1)).toLocaleString(order.currency === 'USD' ? 'en-US' : 'en-IN', { minimumFractionDigits: order.currency === 'USD' ? 2 : 0, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* FINANCIAL BREAKDOWN */}
            <div className="pt-4 border-t border-stone-100 space-y-2.5 text-xs text-stone-500 font-light">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-serif">{order.currencySymbol || '₹'}{order.itemsPrice?.toLocaleString(order.currency === 'USD' ? 'en-US' : 'en-IN', { minimumFractionDigits: order.currency === 'USD' ? 2 : 0, maximumFractionDigits: 2 })}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                  <span className="font-serif">-{order.currencySymbol || '₹'}{order.discountAmount?.toLocaleString(order.currency === 'USD' ? 'en-US' : 'en-IN', { minimumFractionDigits: order.currency === 'USD' ? 2 : 0, maximumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-serif">{order.shippingPrice === 0 ? 'Free Shipping' : `${order.currencySymbol || '₹'}${order.shippingPrice?.toLocaleString(order.currency === 'USD' ? 'en-US' : 'en-IN', { minimumFractionDigits: order.currency === 'USD' ? 2 : 0, maximumFractionDigits: 2 })}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax (8.5%)</span>
                <span className="font-serif">{order.currencySymbol || '₹'}{order.taxPrice?.toLocaleString(order.currency === 'USD' ? 'en-US' : 'en-IN', { minimumFractionDigits: order.currency === 'USD' ? 2 : 0, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* SIDEBAR LOGISTICS INFO */}
          <div className="md:col-span-5 space-y-6">
            
            {/* SHIPPING ADDRESS */}
            <div className="bg-white/60 backdrop-blur-xl border border-stone-200/60 rounded-2xl p-6 shadow-xl shadow-stone-200/20">
              <h3 className="font-serif text-base tracking-wide text-stone-900 pb-3 border-b border-stone-100 mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#B76E79]" /> Shipping Address
              </h3>
              <div className="text-xs space-y-2">
                <p className="font-semibold text-stone-800">{order.shippingAddress?.fullName}</p>
                <p className="text-stone-500 font-light leading-relaxed">{order.shippingAddress?.address}</p>
                <p className="text-stone-500 font-light">
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.postalCode}
                </p>
                <div className="pt-3 border-t border-stone-100 mt-3 text-[10px] text-stone-400 font-mono">
                  PHONE: {order.shippingAddress?.phone}
                </div>
              </div>
            </div>

            {/* PAYMENT INFORMATION */}
            <div className="bg-white/60 backdrop-blur-xl border border-stone-200/60 rounded-2xl p-6 shadow-xl shadow-stone-200/20">
              <h3 className="font-serif text-base tracking-wide text-stone-900 pb-3 border-b border-stone-100 mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#B76E79]" /> Payment Details
              </h3>
              <div className="text-xs space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-stone-400 font-light">Method</span>
                  <span className="font-medium text-stone-800">{order.paymentMethod || 'Razorpay'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-400 font-light">Transaction ID</span>
                  <span className="font-mono text-[10px] text-stone-600 truncate max-w-[120px]" title={order.paymentId}>
                    {order.paymentId || 'Verified'}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2.5 border-t border-stone-100 text-[10px] text-stone-400">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Date Placed</span>
                  <span>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' }) : 'Recent'}</span>
                </div>
              </div>
            </div>

            {/* ASSURANCE BLOCK */}
            <div className="p-4 rounded-xl border border-[#E8C7B7]/20 bg-[#FFF0EB]/20 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
              <p className="text-[10px] text-stone-500 font-light leading-snug">
                Your order transaction is secure and covered under buyer protection terms.
              </p>
            </div>

          </div>

        </div>

      </main>

      {/* Cancellation Request Modal */}
      {isCancellationModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#FDF8F3] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-[#B76E79]" />
                <h3 className="font-serif text-lg tracking-wide text-stone-900">Request Order Cancellation</h3>
              </div>
              <button
                onClick={() => setIsCancellationModalOpen(false)}
                className="p-1 hover:bg-stone-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-stone-600 leading-relaxed">
                Please provide a reason for cancelling your order. This helps us improve our service.
              </p>

              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Enter your cancellation reason..."
                className="w-full h-32 bg-white border border-stone-200 rounded-xl px-4 py-3 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-[#B76E79] resize-none"
              />

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsCancellationModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-stone-200 text-stone-700 text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestCancellation}
                  disabled={isSubmittingCancellation || !cancellationReason.trim()}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmittingCancellation ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    "Confirm Cancellation"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}