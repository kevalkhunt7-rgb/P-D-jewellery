import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CompleteStep({ finalReceipt, transactionId }) {
  const navigate = useNavigate();

  // Framer Motion Variants for GPay-style checkmark drawing
  const checkmarkVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        delay: 0.4,
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  const rippleVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  const burstVariants = {
    hidden: { scale: 0.6, opacity: 0.8 },
    visible: {
      scale: 1.3,
      opacity: 0,
      transition: {
        delay: 0.5,
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      key="complete-view"
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-md mx-auto bg-[#FDFCFB] border border-stone-200/80 rounded-2xl p-8 sm:p-10 text-center shadow-xl shadow-stone-100/40 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#E8C7B7]/20 via-[#B76E79] to-[#E8C7B7]/20" />

      {/* GOOGLE PAY STYLE SUCCESS CONTAINER */}
      <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
        
        {/* Outermost Fading Burst Ring */}
        <motion.div 
          variants={burstVariants}
          initial="hidden"
          animate="visible"
          className="absolute inset-0 rounded-full border-2 border-[#B76E79]/40"
        />

        {/* Inner Expanding Pulse Ring */}
        <motion.div 
          variants={rippleVariants}
          initial="hidden"
          animate="visible"
          className="absolute inset-2 bg-[#FFF6F3] border border-[#E8C7B7]/40 rounded-full shadow-inner"
        />

        {/* SVG Drawing Checkmark Layer */}
        <div className="relative z-10 w-12 h-12 flex items-center justify-center">
          <svg
            className="w-full h-full text-[#B76E79]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <motion.path
              variants={checkmarkVariants}
              initial="hidden"
              animate="visible"
              d="M20 6L9 17l-5-5"
            />
          </svg>
        </div>

        {/* Security Badge Anchor */}
        <motion.span 
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, type: "spring" }}
          className="absolute bottom-1 right-1 z-20 bg-stone-900 text-white p-1.5 rounded-full border border-white shadow-md"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-stone-200" />
        </motion.span>
      </div>

      <h2 className="font-serif text-2xl font-bold tracking-wide text-stone-900 mb-2">
        Order Successfully Placed
      </h2>
      <p className="text-stone-500 text-sm font-gray-800 tracking-wide max-w-xs mx-auto mb-6">
        Your premium luxury signature Order  has been verified and Placed.
      </p>

      {finalReceipt && (
        <div className="bg-stone-50/80 border border-stone-100 rounded-xl p-4 mb-6 text-left text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-stone-800 font-semibold">Transaction ID</span>
            <span className="font-mono font-medium text-stone-700">{transactionId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-800 font-semibold">Destination Place</span>
            <span className="text-stone-700 font-medium">{finalReceipt.savedCity}, {finalReceipt.savedState}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-800 font-semibold">Notification Email</span>
            <span className="text-stone-700 font-medium truncate max-w-[180px]">{finalReceipt.savedEmail}</span>
          </div>
          <div className="pt-2 border-t border-stone-200/60 flex justify-between items-baseline font-bold text-stone-800">
             <span>Order Total</span>
             <span className="font-bold text-sm text-[#B76E79]">
               {finalReceipt.currencySymbol || '₹'}
               {finalReceipt.savedTotal.toLocaleString(finalReceipt.currency === 'USD' ? 'en-US' : 'en-IN', { minimumFractionDigits: finalReceipt.currency === 'USD' ? 2 : 0, maximumFractionDigits: 2 })}
             </span>
          </div>
        </div>
      )}
<div className='flex gap-5'>
      <button
        onClick={() => navigate('/profile#orders')}
        className="w-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-[0.2em] py-3.5 px-6 rounded-full transition-colors shadow-md active:scale-[0.98] duration-150"
      >
        view Order
      </button>
      <button
        onClick={() => navigate('/')}
        className="w-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-[0.2em] py-3.5 px-6 rounded-full transition-colors shadow-md active:scale-[0.98] duration-150"
      >
        Go TO Home
      </button></div>
    </motion.div>
  );
}