"use client";

import React, { useState, useEffect } from "react";
import { Gem, Sparkles } from "lucide-react";

export default function Loading() {
  const [currentIcon, setCurrentIcon] = useState(0);

  // Custom SVG components for jewelry that Lucide doesn't cover perfectly
  const RingIcon = () => (
    <svg
      className="w-16 h-16 stroke-amber-500 fill-none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="14" r="6" />
      <path d="M12 8V4M10 4h4M12 4l-2 2M12 4l2 2" />
    </svg>
  );

  const NecklaceIcon = () => (
    <svg
      className="w-16 h-16 stroke-amber-500 fill-none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 3c0 6 3 9 6 9s6-3 6-3" />
      <path d="M12 12v3" />
      <path d="M12 18l-2-3h4z" className="fill-amber-500" />
    </svg>
  );

  const DiamondIcon = () => (
    <Gem className="w-16 h-16 text-amber-500 stroke-[1.5]" />
  );

  const jewelryItems = [
    { component: <RingIcon />, text: "Polishing the gold..." },
    { component: <NecklaceIcon />, text: "Stringing the pearls..." },
    { component: <DiamondIcon />, text: "Setting the stones..." },
  ];

  // Cycle through different jewelry items every 1.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIcon((prev) => (prev + 1) % jewelryItems.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [jewelryItems.length]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-stone-900 text-stone-100">
      {/* Background Decorative Sparkles */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <Sparkles className="absolute top-1/4 left-1/4 w-4 h-4 animate-ping text-amber-400" />
        <Sparkles className="absolute bottom-1/4 right-1/4 w-6 h-6 animate-pulse text-amber-300" />
        <Sparkles className="absolute top-1/3 right-1/3 w-5 h-5 animate-bounce text-amber-200" />
      </div>

      {/* Animated Jewelry Icon Container */}
      <div className="relative flex items-center justify-center w-28 h-28 mb-6">
        {/* Elegant Outer Glowing Ring */}
        <div className="absolute inset-0 rounded-full border border-amber-500/30 animate-ping opacity-75" />
        <div className="absolute inset-2 rounded-full border border-stone-700 animate-spin [animation-duration:3s]" />
        
        {/* Dynamic Jewelry Icon Injection */}
        <div key={currentIcon} className="animate-fade-in-out transform scale-110">
          {jewelryItems[currentIcon].component}
        </div>
      </div>

      {/* Luxury Loading Typography */}
      <h2 className="text-xl font-light tracking-[0.25em] text-amber-400 uppercase mb-2 animate-pulse">
        Bijoux
      </h2>
      
      <p className="text-xs font-mono tracking-widest text-stone-400 h-4 transition-all duration-500">
        {jewelryItems[currentIcon].text}
      </p>

      {/* Minimalist Progress Bar */}
      <div className="w-40 h-[2px] bg-stone-800 mt-6 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 w-full animate-loading-bar" />
      </div>
    </div>
  );
}