import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, CreditCard, RefreshCw, ShoppingBag, ArrowLeft } from 'lucide-react';
import PayPalButtons from './PayPalButtons';

// Framer Motion Choreography Presets
const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1], // Custom premium ease-out cubic
      when: "beforeChildren",
      staggerChildren: 0.08,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function PaymentStep({ 
  setCurrentStep, 
  handleFinalPurchase, 
  isLoading, 
  orderTotal,
  currency,
  currencySymbol,
  countryCode,
  onCreatePayPalOrder,
  onApprovePayPalOrder
}) {
  const isIndia = currency === 'INR';

  return (
    <motion.div
      key="payment-step"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="bg-white/70 backdrop-blur-xl border border-stone-200/80 rounded-2xl p-6 sm:p-8 shadow-xl shadow-stone-200/40 relative overflow-hidden"
    >
      {/* Decorative top ambient border glow */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#B76E79]/40 to-transparent" />

      {/* Header Actions row */}
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
        <motion.button
          onClick={() => setCurrentStep('shipping')}
          className="text-xs font-bold tracking-widest uppercase text-stone-800 hover:text-stone-900 transition-colors flex items-center gap-2 group"
          whileHover={{ x: -4 }}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:stroke-stone-900" />
          <span>Return to Delivery</span>
        </motion.button>

        <motion.span 
          variants={itemVariants}
          className="text-[10px] font-bold tracking-widest text-[#D4AF37] bg-stone-900 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md"
          whileHover={{ scale: 1.03 }}
        >
          <Lock className="w-3 h-3 fill-current animate-pulse" /> 256-BIT ENCRYPTION
        </motion.span>
      </motion.div>

      {/* Main Title */}
      <motion.h2 variants={itemVariants} className="font-serif text-2xl tracking-wide text-stone-900 mb-6">
        Financial Settlement
      </motion.h2>

      {/* Centered Gateway Card Frame */}
      <motion.div 
        variants={itemVariants}
        className="text-center py-12 mb-8 bg-gradient-to-b from-[#FFF0EB]/40 to-[#FFF0EB]/10 rounded-xl border border-[#B76E79]/20 relative overflow-hidden group shadow-xs"
        whileHover={{ shadow: "0 10px 25px -5px rgba(183, 110, 121, 0.1)" }}
      >
        <div className="mb-4 relative z-10">
          <motion.div 
            className="w-16 h-16 bg-[#B76E79] rounded-full flex items-center justify-center mx-auto shadow-md relative"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ repeat: Infinity, repeatType: "reverse", duration: 3, ease: "easeInOut" }}
          >
            {/* Ambient ripple background element */}
            <span className="absolute inset-0 rounded-full bg-[#B76E79]/20 animate-ping opacity-75 pointer-events-none duration-1000" />
            <CreditCard className="w-7 h-7 text-white relative z-10" />
          </motion.div>
        </div>
        
        <motion.p variants={itemVariants} className="text-sm font-medium text-stone-700 mb-1">
          Pay securely with {isIndia ? "Razorpay" : "PayPal"}
        </motion.p>
        <motion.p variants={itemVariants} className="text-xs text-stone-800 font-bold max-w-xs mx-auto">
          All major credit cards, {isIndia ? "UPI transfers" : "and global payment methods"} supported
        </motion.p>
      </motion.div>

      {/* Payment Action */}
      <motion.div variants={itemVariants} className="pt-6 border-t border-stone-100/80">
        {isIndia ? (
          <motion.button
            onClick={handleFinalPurchase}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#eaba3e] via-[#B76E79] to-[#eaba3e] text-white font-bold text-xs tracking-[0.2em] py-4 px-8 rounded-full shadow-lg shadow-[#B76E79]/20 transition-all disabled:opacity-60 relative overflow-hidden"
            style={{ backgroundSize: '200% auto' }}
            whileHover={!isLoading ? { 
              backgroundPosition: "right center",
              scale: 1.01,
              boxShadow: "0 12px 24px -4px rgba(183, 110, 121, 0.3)"
            } : {}}
            whileTap={!isLoading ? { scale: 0.99 } : {}}
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div 
                  key="loader" 
                  className="flex items-center justify-center gap-2.5" 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <RefreshCw className="w-4 h-4 animate-spin text-stone-100 stroke-[2.5]" />
                  <span className="tracking-[0.25em]">INITIALIZING SECURE GATEWAY...</span>
                </motion.div>
              ) : (
                <motion.div 
                  key="text" 
                  className="flex items-center justify-center gap-2" 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <ShoppingBag className="w-4 h-4 stroke-[2]" />
                  <span>Make Payment ({currencySymbol}{orderTotal.toLocaleString()})</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        ) : (
          /* 🚀 COMPATIBLE PAYPAL BUTTON INTERFACE WITH INTERNAL SKELETON LOADERS */
          <div className="w-full max-w-md mx-auto">
            <PayPalButtons 
              onCreateOrder={onCreatePayPalOrder}
              onApprove={onApprovePayPalOrder}
              onError={(err) => console.error('PayPal Core Framework Error:', err)}
            />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}