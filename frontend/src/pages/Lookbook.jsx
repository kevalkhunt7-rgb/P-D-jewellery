import React, {useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  Sparkles, 
  Play, 
  ArrowRight, 
  ArrowLeft,
  Heart, 
  MessageCircle, 
  Calendar, 
  Compass, 
  ChevronDown, 
  Volume2, 
  VolumeX 
} from 'lucide-react';
import { FiInstagram } from "react-icons/fi";
import { ProductCard } from "../components/ProductCard";
import { useProducts } from '../context/ProductContext';
import logo from "../assets/logo.png";
import {Link} from "react-router-dom";
import video1 from "../assets/video1.mp4";

export default function LookBookPage() {
  const { products = [] } = useProducts();
  const [activeQuote, setActiveQuote] = useState(0);

  const { scrollY } = useScroll();
  

const scrollRef = useRef(null);
  const [showLeftBtn, setShowLeftBtn] = useState(false);
  const [showRightBtn, setShowRightBtn] = useState(true);

  // Monitor scroll positioning to toggle both buttons dynamically
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      
      // Show left button if user has scrolled right past 5px
      setShowLeftBtn(scrollLeft > 5);
      
      // Hide right button if reached the end margin
      setShowRightBtn(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  // Click handlers for both directions
  const scroll = (direction) => {
    if (scrollRef.current) {
      const offset = direction === "left" ? -400 : 400;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };
  
  // Parallax effects
  const heroBgY = useTransform(scrollY, [0, 1000], [0, 350]);
  const heroTextY = useTransform(scrollY, [0, 1000], [0, 150]);

  const quotes = [
    { text: "Pure elegance in every single detail, written in gold.", author: "VOGUE EDITORIAL" },
    { text: "A timeless masterpiece that transitions beyond luxury jewelry.", author: "HARPER'S BAZAAR" },
    { text: "Redefining the modern heirloom beautifully for generations to come.", author: "THE ATELIER JOURNAL" }
  ];
const [isVideoMuted, setIsVideoMuted] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isVideoMuted;
    }
  }, [isVideoMuted]);
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveQuote((prev) => (prev + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const collections = [
    { title: "Bridal Collection", desc: "Exquisite bridal jewellery crafted in radiant gold,  diamonds, and precious gemstones  to celebrate your forever.", img: "https://i.pinimg.com/736x/bb/80/d5/bb80d5507aaa4bda050a789a0a1db5f0.jpg" , link: "/collections?occasion=wedding"  },
    { title: "Party Wear Collection", desc: "Bold brilliance and contemporary elegance for every grand entrance.", img: "https://i.pinimg.com/736x/0a/33/92/0a33926334e164749fcf59259d4bf9fb.jpg" , link: "/collections?occasion=party"  },
    { title: "Casual Wear Collection", desc: "Architectural profiles speaking volumes through fine delicate lines.", img: "https://i.pinimg.com/1200x/19/b6/af/19b6af5a789d1bef849deadd33388d7d.jpg" , link: "/collections?occasion=casual"  },
    { title: "Festive Glamour", desc: "Deep rich tanzanites and emeralds tailored for moonlit settings.", img: "https://i.pinimg.com/736x/4a/3a/cd/4a3acd0181c6d0a0f985141e052397e3.jpg" , link: "/collections?occasion=festive"  },
    { title: "Daily Wear Collection", desc: "The definitive standard of flawless brilliance made permanent.", img: "https://i.pinimg.com/736x/49/58/9c/49589c33e274de7908f59611ac0dcaa3.jpg" , link: "/collections?occasion=Daily Wear"  }
  ];

  const instagramGallery = [
    { img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=600", tag: "#LuxuryElegance", likes: "2.4k", comments: "142" },
    { img: "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?auto=format&fit=crop&q=80&w=600", tag: "#LegacyDiamonds", likes: "4.1k", comments: "98" },
    { img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=600", tag: "#VogueLiving", likes: "1.8k", comments: "44" },
    { img: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&q=80&w=600", tag: "#SignatureGold", likes: "3.2k", comments: "210" },
    { img: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=600", tag: "#HighJewelry", likes: "5.6k", comments: "305" },
    { img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=600", tag: "#TimelessHeirloom", likes: "2.9k", comments: "81" }
  ];

  return (
    <div className="bg-[#FDF8F3] text-[#2C2C2C] font-sans antialiased overflow-x-hidden selection:bg-[#E8C7B7]/40">
      
      {/* Global Ambient Glow Nodes */}
      <div className="absolute top-[120vh] left-[-20vw] w-[60vw] h-[60vw] bg-gradient-to-tr from-[#E8C7B7]/20 to-[#FFF0EB]/10 rounded-full blur-[140px] pointer-events-none mix-blend-multiply" />
      <div className="absolute top-[450vh] right-[-10vw] w-[50vw] h-[50vw] bg-gradient-to-bl from-[#B76E79]/10 to-[#FDF8F3]/20 rounded-full blur-[160px] pointer-events-none" />

      {/* =====================================
          1. HERO LOOKBOOK SECTION
         ===================================== */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-stone-900">
        <motion.div style={{ y: heroBgY }} className="absolute inset-0 w-full h-full scale-105">
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-[#FDF8F3] z-10" />
          <img 
            src="https://i.pinimg.com/1200x/c1/c2/ad/c1c2ad15fb935d87ba9e48f19144d6b1.jpg" 
            alt="Cinematic Campaign Background" 
            className="w-full h-full object-cover object-center transform"
          />
        </motion.div>

        {/* Ambient floating light particles */}
        <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)] animate-pulse duration-10000" />

        <motion.div 
          style={{ y: heroTextY }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-20 text-center px-4 max-w-5xl mx-auto flex flex-col items-center"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="flex items-center gap-2 mb-6 border border-[#E8C7B7]/30 bg-white/5 backdrop-blur-md px-4 py-1.5 rounded-full"
          >
            <motion.img
                                    src={logo}
                                    alt="P&D Luxury Jewellery"
                                    className="h-15 w-auto object-contain scale-[1] origin-center"
                                    whileHover={{ rotate: 360 }}
                                    transition={{
                                        duration: 0.8,
                                        ease: "easeInOut",
                                    }}
                                />
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] fill-current animate-spin" style={{ animationDuration: '6s' }} />
            <span className="text-white text-[30px] font-bold tracking-[0.3em] uppercase">P&D LUXURY JEWELLERY</span>
          </motion.div>
                     
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white font-bold tracking-tight leading-[1.05] mb-8">
          <br />
            <span className="italic text-[#E8C7B7] font-normal"> LUXURY JEWELLERY COLLECTION</span>
          </h1>

          <p className="text-[#FDF8F3]/80 text-sm md:text-base font-bold tracking-[0.15em] max-w-xl mx-auto mb-12 uppercase leading-relaxed">
            Discover a world of timeless sophistication, where every jewel is meticulously crafted to embody luxury and grace.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-5">
            <button className="group px-8 py-4 bg-[#2C2C2C] border border-stone-800 text-[#FDF8F3] hover:bg-[#B76E79] rounded-full text-xs font-semibold tracking-[0.2em] uppercase shadow-xl transition-all duration-500 flex items-center gap-3">
              <Link to="/collections"><span>EXPLORE COLLECTION</span></Link>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <button className="group px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white hover:text-stone-900 rounded-full text-xs font-semibold tracking-[0.2em] uppercase transition-all duration-500 flex items-center gap-2">
              <Play className="w-3 h-3 fill-current group-hover:text-[#B76E79] transition-colors" />
              <span>WATCH CAMPAIGN</span>
            </button>
          </div>
        </motion.div>

        {/* Scroll down indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-stone-800">
          
          <motion.div 
            animate={{ y: [0, 8, 0] }} 
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <ChevronDown className="w-4 h-4 text-[#D4AF37]" />
          </motion.div>
        </div>
      </section>

      {/* =====================================
          2. EDITORIAL STORY SECTION
         ===================================== */}
      <section className="py-24 lg:py-36 container mx-auto px-4 sm:px-6 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          
          {/* Left Grid: Asymmetrical Images */}
          <div className="lg:col-span-7 grid grid-cols-12 gap-4 relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-[#E8C7B7]/10 to-transparent rounded-[3rem] blur-2xl pointer-events-none" />
            
            <motion.div 
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1 }}
              className="col-span-8 overflow-hidden rounded-[2.5rem] shadow-2xl shadow-stone-900/10 aspect-[3/4] relative z-10"
            >
              <img 
                src="https://i.pinimg.com/736x/9c/58/32/9c5832aa30b4bd71ae31cad34d83b668.jpg" 
                alt="Editorial Portrait" 
                className="w-full h-full object-cover"
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 120 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, delay: 0.2 }}
              className="col-span-4 overflow-hidden rounded-[2rem] shadow-xl self-end mb-[-40px] aspect-[4/5] relative z-20 border-4 border-[#FDF8F3]"
            >
              <img 
                src="https://i.pinimg.com/1200x/fc/0f/9e/fc0f9e94b242a1504c834d29d21a057b.jpg" 
                alt="Detail Close-up" 
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>

          {/* Right Text Block: Editorial Framing */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
            className="lg:col-span-5 space-y-8 lg:pl-6"
          >
            <div className="space-y-3">
              <span className="text-[11px] font-bold tracking-[0.25em] text-[#B76E79] uppercase block">THE PHILOSOPHY</span>
              <h2 className="font-serif text-3xl sm:text-5xl text-[#2C2C2C] font-bold leading-tight tracking-tight">
                Crafted to Celebrate Life’s <span className="italic font-normal text-[#D4AF37]">Most Precious Moments.</span>
              </h2>
            </div>
            
            <hr className="border-stone-200 w-24" />

            <p className="text-stone-600 font-bold text-sm sm:text-base leading-relaxed">
              At the heart of our brand lies a passion for timeless craftsmanship and uncompromising excellence. Every design is thoughtfully created, every precious metal carefully selected, and every gemstone meticulously set to achieve unparalleled beauty and brilliance. We do not simply create jewellery; we craft symbols of love, achievement, and legacy that endure through generations.
            </p>

            <blockquote className="border-left-2 border-[#E8C7B7] pl-4 italic font-serif text-lg text-stone-500/90 leading-relaxed bg-white/40 p-4 rounded-xl backdrop-blur-sm border border-stone-100">
              “True luxury is not measured by what you wear, but by the stories and memories your jewellery carries through time.”
            </blockquote>

           
          </motion.div>

        </div>
      </section>

      {/* =====================================
          3. FEATURED LOOKBOOK COLLECTIONS
         ===================================== */}
<div className="relative w-full group/container">
      {/* Scrollbar Style Accentuation */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c2410c; 
          border-radius: 9999px;
        }
      `}</style>

      {/* The Scrollable Row */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="overflow-x-auto mb-5 pb-10 pt-4 px-4 sm:px-8 lg:px-16 flex gap-8 custom-scrollbar snap-x snap-mandatory scroll-smooth"
      >
        {collections.map((col, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, delay: idx * 0.1, ease: [0.21, 1.02, 0.43, 1.01] }}
            className="relative flex flex-col justify-end flex-shrink-0 w-[290px] sm:w-[360px] md:w-[400px] aspect-[3/4] rounded-[2rem] overflow-hidden shadow-2xl group snap-start p-6 sm:p-8 bg-stone-900"
          >
            {/* Cinematic Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10 transition-all duration-500 group-hover:via-black/50" />
            
            {/* Smooth Image Zoom */}
            <img 
              src={col.img} 
              alt={col.title} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] cubic-bezier(0.25, 1, 0.5, 1) group-hover:scale-105"
              loading="lazy"
            />
            
            {/* Content Container */}
            <div className="relative z-20 space-y-4 transform transition-transform duration-500 ease-out group-hover:translate-y-[-4px]">
              <div className="space-y-2">
                <h3 className="font-serif text-2xl sm:text-3xl text-stone-50 font-medium tracking-wide">
                  {col.title}
                </h3>
                <p className="text-stone-300/80 font-bold text-xs sm:text-sm tracking-wide leading-relaxed line-clamp-2 max-w-[90%]">
                  {col.desc}
                </p>
              </div>

              {/* Semantic & Accessible Link Button */}
              <div className="pt-2">
                <Link 
                  to={col.link}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300 hover:bg-white hover:text-stone-950 hover:border-white hover:shadow-lg hover:shadow-white/5"
                >
                  <span>Explore Collection</span> 
                  <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* LEFT / RETURN BUTTON */}
      {showLeftBtn && (
        <button
          onClick={() => scroll("left")}
          className="hidden md:flex absolute bottom-[15px] left-4 lg:left-16 z-30 items-center justify-center w-10 h-10 bg-stone-800 border border-stone-700 text-stone-200 rounded-full shadow-lg hover:bg-stone-50 hover:text-stone-950 hover:border-stone-50 transition-all duration-300"
          aria-label="Scroll left"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}

      {/* RIGHT BUTTON */}
      {showRightBtn && (
        <button
          onClick={() => scroll("right")}
          className="hidden md:flex absolute bottom-[15px] right-4 lg:right-16 z-30 items-center justify-center w-10 h-10 bg-stone-800 border border-stone-700 text-stone-200 rounded-full shadow-lg hover:bg-stone-50 hover:text-stone-950 hover:border-stone-50 transition-all duration-300"
          aria-label="Scroll right"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      )}
    </div>
      {/* =====================================
          4. IMMERSIVE FULL-WIDTH BANNER
         ===================================== */}
      <section className="relative py-48 md:py-64 bg-stone-900 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/70 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1920" 
          alt="Luxury Close Up Banner" 
          className="absolute inset-0 w-full h-full object-cover opacity-65 scale-105"
        />
        
        {/* Abstract glowing ring background overlay */}
        <div className="absolute w-[400px] h-[400px] rounded-full border border-[#D4AF37]/20 z-10 animate-ping opacity-25" style={{ animationDuration: '4s' }} />

        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto space-y-8">
          <span className="text-[#D4AF37] text-[11px] font-bold tracking-[0.4em] uppercase block">THE HIGH ATELIER</span>
          <h2 className="font-serif text-4xl sm:text-6xl text-white font-bold tracking-tight leading-tight">
            Jewelry That <span className="italic font-normal text-[#E8C7B7]">Becomes Legacy</span>
          </h2>
          <p className="text-stone-300 max-w-md mx-auto font-bold text-sm tracking-wide leading-relaxed">
            Meticulously engineered artifacts designed to survive horizons, preserving beauty beautifully across linear time.
          </p>
          <div className="pt-4">
            <button className="px-8 py-4 bg-[#D4AF37] hover:bg-white text-stone-900 font-bold text-xs tracking-[0.25em] rounded-full uppercase transition-colors duration-500 shadow-xl">
              COMMISSION A DESIGN
            </button>
          </div>
        </div>
      </section>

      {/* =====================================
          5. LOOKBOOK PRODUCT SHOWCASE
         ===================================== */}
      <section className="py-24 container mx-auto px-4 sm:px-6 lg:px-16">
        <div className="text-center space-y-3 mb-16">
          <span className="text-[11px] font-bold tracking-[0.25em] text-[#B76E79] uppercase block">THE LOOKBOOK EDITIONS</span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2C2C2C] tracking-tight">
            Featured Luxury Pieces
          </h2>
          <div className="w-12 h-px bg-[#D4AF37] mx-auto mt-4" />
        </div>

        {/* Responsive Grid showcasing 6 items exactly */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {products.slice(0, 6).map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
            >
              <ProductCard {...product} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* =====================================
          6. VIDEO CAMPAIGN SECTION
         ===================================== */}
      <section className="py-20 bg-stone-950 text-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Content */}
          <div className="lg:col-span-4 space-y-6">
            <span className="text-[#B76E79] text-[11px] font-bold tracking-[0.3em] uppercase block">
              BRAND FILM
            </span>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
              Behind The <br />
              <span className="italic font-normal text-[#E8C7B7]">
                Luxury Doors
              </span>
            </h2>

            <p className="text-stone-800 font-bold text-xs sm:text-sm leading-relaxed">
              Step inside our historical Parisian sanctuary where pure
              metallurgy converges seamlessly with fine diamond cutting
              artistry.
            </p>

            <div className="pt-2 flex items-center gap-4">
              <button
                onClick={() => setIsVideoMuted(!isVideoMuted)}
                className="p-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors text-stone-300"
                title={isVideoMuted ? "Unmute audio" : "Mute audio"}
              >
                {isVideoMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>

              
            </div>
          </div>

          {/* Video Section */}
          <div className="lg:col-span-8">
            <div className="relative aspect-video rounded-[2rem] overflow-hidden group shadow-2xl border border-white/5 bg-stone-900">

              {/* Video */}
              <video
                ref={videoRef}
                src={video1}
                autoPlay
                loop
                muted={isVideoMuted}
                playsInline
                preload="auto"
                className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-1000"
              />

              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-black/20 z-10" />

              

            </div>
          </div>

        </div>
      </div>
    </section>

      

      

      {/* =====================================
          9. FINAL LUXURY CTA
         ===================================== */}
      

    </div>
  );
}