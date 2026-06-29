import React from 'react';
import { motion } from 'framer-motion';
import { Check, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CompleteStep({ finalReceipt, transactionId }) {
  const navigate = useNavigate();

  return (
    <motion.div
      key="complete-view"
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-md mx-auto bg-[#FDFCFB] border border-stone-200/80 rounded-2xl p-8 sm:p-10 text-center shadow-xl shadow-stone-100/40 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#E8C7B7]/20 via-[#B76E79] to-[#E8C7B7]/20" />

      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
        className="w-16 h-16 bg-[#FFF6F3] border border-[#E8C7B7]/30 rounded-full flex items-center justify-center mx-auto mb-6 relative"
      >
        <Check className="w-6 h-6 text-[#B76E79] stroke-[2]" />
        <span className="absolute -bottom-1 -right-1 bg-stone-900 text-white p-1 rounded-full border border-white">
          <ShieldCheck className="w-3 h-3 text-stone-200" />
        </span>
      </motion.div>

      <h2 className="font-serif text-2xl font-light tracking-wide text-stone-900 mb-2">
        Order Successfully Placed
      </h2>
      <p className="text-stone-500 text-xs font-light tracking-wide max-w-xs mx-auto mb-6">
        Your premium luxury signature ledger configuration has been verified.
      </p>

      {finalReceipt && (
        <div className="bg-stone-50/80 border border-stone-100 rounded-xl p-4 mb-6 text-left text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-stone-400">Transaction Registry</span>
            <span className="font-mono font-medium text-stone-700">{transactionId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-400">Destination Hub</span>
            <span className="text-stone-700 font-medium">{finalReceipt.savedCity}, {finalReceipt.savedState}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-400">Notification Transit</span>
            <span className="text-stone-700 font-medium truncate max-w-[180px]">{finalReceipt.savedEmail}</span>
          </div>
          <div className="pt-2 border-t border-stone-200/60 flex justify-between items-baseline font-semibold text-stone-800">
             <span>Settled Total</span>
             <span className="font-serif text-sm text-[#B76E79]">
               {finalReceipt.currencySymbol || '₹'}
               {finalReceipt.savedTotal.toLocaleString(finalReceipt.currency === 'USD' ? 'en-US' : 'en-IN', { minimumFractionDigits: finalReceipt.currency === 'USD' ? 2 : 0, maximumFractionDigits: 2 })}
             </span>
          </div>
        </div>
      )}

      <button
        onClick={() => navigate('/orders')}
        className="w-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-[0.2em] py-3.5 px-6 rounded-full transition-colors shadow-md"
      >
        Track Your Casket
      </button>
    </motion.div>
  );
}