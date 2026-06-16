import React, { useEffect } from 'react';
import { 
  Sparkles, Award, Shield, Heart, Gem, Gift, 
  ArrowRight, CheckCircle2, ShoppingBag, Eye
} from 'lucide-react';
import { FiInstagram } from "react-icons/fi";// Fallback/Alternative icon context if needed
import brandlogo from "../assets/fulllogo.jpeg";

function AboutPage() {
  
  // Smooth scroll trigger simulation hook
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const handleIntersect = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    /* FIXED: Added max-w-full and overflow-x-hidden for layout security on mobile screens */
    <div className="min-h-screen w-full max-w-full bg-[#FDF8F3] relative overflow-x-hidden font-sans text-[#2C2C2C] selection:bg-[#E8C7B7]/30 selection:text-[#2C2C2C]">
      
      {/* GLOBAL LUXURY AMBIENT BACKGROUNDS */}
      <div className="absolute top-[10%] left-[-10%] w-[50%] h-[50%] rounded-full pointer-events-none" />
      <div className="absolute top-[40%] right-[-15%] w-[60%] h-[60%] rounded-full pointer-events-none" />
      <div className="absolute bottom-[5%] left-[-5%] w-[40%] h-[40%] rounded-full pointer-events-none" />

      {/* FLOATING GOLD DUST PARTICLES */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-[#D4AF37] to-[#E8C7B7] opacity-25 luxury-dust-float"
            style={{
              width: `${Math.random() * 5 + 3}px`,
              height: `${Math.random() * 5 + 3}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${16 + Math.random() * 12}s`
            }}
          />
        ))}
      </div>

      {/* 1. HERO SECTION */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-[#2C2C2C]">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-[#2C2C2C]/30 to-[#FDF8F3] z-10" />
        <img 
          src="https://i.pinimg.com/736x/4e/22/bc/4e22bc1de0f601d2735697245a92f774.jpg" 
          alt="Cinematic Female Fashion Model" 
          className="absolute inset-0 w-full h-full object-cover opacity-75 animate-luxury-zoom scale-105"
        />
        
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
          <div className="flex items-center gap-2 mb-4 animate-subtle-slide-down">
            <Sparkles className="w-5 h-5 text-[#D4AF37] animate-pulse" />
            <span className="text-xs sm:text-sm uppercase tracking-[0.35em] text-[#E8C7B7] font-semibold">The Pure Gold, Timeless Beauty</span>
          </div>
          <h1 className="font-serif text-white text-3xl sm:text-6xl md:text-7xl font-light tracking-wide leading-tight mb-6">
            Where Gold Becomes Art <br />
            <span className="italic text-[#FFF0EB] font-normal font-serif">Crafted for Life's Precious Moments</span>
          </h1>
          <p className="text-white/80 font-light text-xs sm:text-lg tracking-wide max-w-2xl leading-relaxed animate-fade-in-delayed">
            Experience masterfully crafted gold jewellery inspired by timeless beauty. Every design is a symbol of refinement, authenticity, and lasting value.
          </p>
          <div className="mt-10 animate-fade-in-delayed">
            <a href="/collections" className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#E8C7B7] to-[#D4AF37] text-white text-xs font-semibold uppercase tracking-widest rounded-full shadow-[0_10px_30px_rgba(232,199,183,0.3)] hover:shadow-[0_15px_40px_rgba(212,175,55,0.4)] transition-all duration-300 transform hover:-translate-y-0.5">
              Explore Our Heritage <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* 2. BRAND STORY SECTION */}
      {/* FIXED: Adjusted container grid spacing and overflow boundaries for safe responsive margins */}
      <section id="story" className="py-20 px-4 max-w-[1300px] mx-auto relative z-20 overflow-hidden">
        <div className="grid grid-cols-12 gap-8 lg:gap-20 items-center">
          
          {/* Brand Logo & Presentation Container */}
          <div className="col-span-12 lg:col-span-6 relative reveal-on-scroll reveal-fade-left p-2 sm:p-6">
            <div className="absolute top-0 left-0 w-24 h-24 sm:w-32 sm:h-32 border-t-2 border-l-2 border-[#E8C7B7]/40 rounded-tl-[2rem] sm:rounded-tl-[3rem]" />
            <div className="rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-[0_30px_60px_rgba(44,44,44,0.06)] bg-[#2C2C2C] aspect-[3/4]">
              <img 
                src={brandlogo} 
                alt="Fine Jewelry Artisanal Styling" 
                className="w-full h-full object-cover opacity-90 transition-transform duration-[6000ms] hover:scale-105"
              />
            </div>
            <div className="absolute bottom-0 right-0 w-24 h-24 sm:w-32 sm:h-32 border-b-2 border-r-2 border-[#D4AF37]/30 rounded-br-[2rem] sm:rounded-br-[3rem]" />
          </div>

          {/* Typography Content Wrapper */}
          <div className="col-span-12 lg:col-span-6 space-y-6 lg:space-y-8 reveal-on-scroll reveal-fade-right">
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-[0.25em] text-[#B76E79] font-bold block">Born from Passion</span>
              <h2 className="font-serif text-2xl sm:text-5xl text-[#2C2C2C] font-light tracking-wide leading-tight">
                An Evolution of <span className="italic font-normal text-[#B76E79]">Aesthetic Perfection</span>
              </h2>
            </div>
            
            <div className="bg-white/60 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/80 space-y-4 sm:space-y-6 shadow-sm">
              <p className="text-xs sm:text-base text-[#2C2C2C]/80 leading-relaxed font-light">
                Founded with a visionary purpose, our atelier was built to dismantle the barrier between high couture design and approachability. We believe that a woman’s radiance shouldn’t depend on a price tag, but on the soul of the craftsmanship she wears.
              </p>
              <p className="text-xs sm:text-base text-[#2C2C2C]/80 leading-relaxed font-light">
                Every stone is hand-selected, every curve hand-carved, utilizing premium composite materials that mimic the light dispersion patterns of flawless diamonds and natural precious gemstones.
              </p>
            </div>

            <blockquote className="border-l-4 border-[#E8C7B7] pl-4 italic text-sm sm:text-base text-[#2C2C2C]/70 font-serif">
              "True luxury is not defined by cost, but by the emotion elicited when a piece touches your skin."
            </blockquote>
          </div>

        </div>
      </section>

      {/* Global Embedded Keyframe Interactions styling layer */}
      <style>{`
        .luxury-dust-float {
          animation: floatDust infinite linear;
        }
        @keyframes floatDust {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          50% { opacity: 0.3; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
        .animate-luxury-zoom {
          animation: zoomSlow 20s ease-out infinite alternate;
        }
        @keyframes zoomSlow {
          0% { transform: scale(1.02); }
          100% { transform: scale(1.1); }
        }
        .reveal-on-scroll {
          opacity: 0;
          transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal-fade-left {
          transform: translateX(-30px);
        }
        .reveal-fade-right {
          transform: translateX(30px);
        }
        .reveal-visible {
          opacity: 1 !important;
          transform: translateX(0) translateY(0) !important;
        }
      `}</style>
    </div>
  );
}

export default AboutPage;