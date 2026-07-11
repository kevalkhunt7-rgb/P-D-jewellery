import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Compass, Sparkles, ArrowLeft, ShieldAlert } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  // Fine-Art Luxury Animation Configurations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF8F3] text-stone-900 font-sans antialiased flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden select-none">
      
      {/* Structural Blur Ambient Luxury Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-gradient-to-tr from-[#FFF0EB] to-[#E8C7B7]/15 rounded-full blur-[140px] pointer-events-none mix-blend-multiply" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] bg-gradient-to-bl from-[#F7E7CE]/10 to-[#FFF0EB] rounded-full blur-[160px] pointer-events-none" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-xl w-full text-center relative z-10 space-y-8"
      >
        {/* Visual Focal Point: Elegant Interactive Icon Stack */}
        <motion.div variants={itemVariants} className="relative inline-block">
          <div className="w-24 h-24 bg-white border border-stone-200/80 rounded-full flex items-center justify-center mx-auto shadow-md relative group">
            {/* Ambient Pulse Ring */}
            <div className="absolute inset-0 rounded-full border border-[#B76E79]/30 scale-100 group-hover:scale-125 opacity-0 group-hover:opacity-100 transition-all duration-700" />
            <Compass className="w-9 h-9 text-[#B76E79] stroke-[1.2] animate-spin-slow" />
          </div>
          {/* Decorative Sparkle Accent */}
          <Sparkles className="w-5 h-5 text-[#D4AF37] absolute top-1 right-2 animate-pulse" />
        </motion.div>

        {/* Text Headers Typography Block */}
        <div className="space-y-3">
          <motion.p 
            variants={itemVariants}
            className="text-[11px] font-bold tracking-[0.3em] text-[#B76E79] uppercase"
          >
            Error Code 404
          </motion.p>
          <motion.h1 
            variants={itemVariants}
            className="font-serif text-4xl sm:text-5xl font-bold tracking-wide text-stone-900"
          >
            Page Comming Soon....
          </motion.h1>
          <div className="w-12 h-[1px] bg-[#B76E79] mx-auto my-4" />
          <motion.p 
            variants={itemVariants}
            className="text-stone-500 text-xs sm:text-sm font-bold max-w-sm mx-auto leading-relaxed tracking-wide"
          >
            The destination capsule or custom collection showcase configuration you are seeking has been moved, re-indexed, or stored back in the private archive vaults.
          </motion.p>
        </div>

        {/* Action Controls Subgrid Node */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 max-w-sm mx-auto"
        >
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-6 py-3.5 border border-stone-200 bg-white/80 backdrop-blur-3xs hover:border-stone-400 text-stone-700 hover:text-stone-950 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full flex items-center justify-center gap-2 transition-all duration-300"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go Backward</span>
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto px-8 py-3.5 bg-stone-900 hover:bg-stone-800 text-[#FDF8F3] text-[10px] font-bold uppercase tracking-[0.2em] rounded-full shadow-md shadow-stone-950/10 transition-all duration-300 relative overflow-hidden group"
          >
            {/* Custom Light Shimmer Overlay Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
            <span className="relative z-10">Return to Showroom</span>
          </button>
        </motion.div>

        {/* Fine Print Footer Security Note */}
        <motion.div 
          variants={itemVariants} 
          className="pt-8 text-[9px] font-medium tracking-widest text-stone-800 uppercase flex items-center justify-center gap-1.5"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-[#D4AF37]/80 stroke-[1.5]" />
          <span>Luxury Secure Browsing Parameters Active</span>
        </motion.div>
      </motion.div>
    </div>
  );
}