import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export function Hero() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const { data } = await api.get('/banners/all');
        if (data.success) {
          
          const mappedBanners = data.banners.map(b => ({
            tag: b.subtitle || "New Collection",
            title: b.title,
            highlight: b.description ? (b.description.includes('.') ? b.description.split('.')[0] : b.description) : "Exquisite Craftsmanship",
            desc: b.description || "Discover our unique handcrafted jewelry pieces.",
            buttonText: b.buttonText || "Shop Collection",
            image: b.image?.url || "https://images.unsplash.com/photo-1675881149187-8faaf934e14a?auto=format&fit=crop&q=80&w=1080",
            alt: b.title,
            link: b.buttonLink || "/collections"
          }));
          setBanners(mappedBanners);
        }
      } catch (error) {
        console.error("Failed to fetch banners:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  const handleNext = () => {
    if (banners.length === 0) return;
    setDirection(1);
    setCurrent((prev) => (prev + 1) % banners.length);
  };

  const handlePrev = () => {
    if (banners.length === 0) return;
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  };

  useEffect(() => {
    if (banners.length > 1) {
      const timer = setInterval(handleNext, 6000);
      return () => clearInterval(timer);
    }
  }, [banners.length]);

  // Framer motion variants for the sliding/fade effect
  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: "easeInOut" }
    },
    exit: (dir) => ({
      x: dir > 0 ? -100 : 100,
      opacity: 0,
      transition: { duration: 0.8, ease: "easeInOut" }
    })
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
      </div>
    );
  }

  if (banners.length === 0) return null;

  const currentSlide = banners[current];

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#FAF9F6] via-[#FFE5E8] to-[#F7E7CE] flex items-center py-16 lg:py-0">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-[#B76E79]/20 to-[#D4AF37]/20"
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 lg:px-8 h-full">
        {/* FIXED CONTAINER: flex-col-reverse pulls the image block to the top visual layer on mobile screens */}
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-12 lg:gap-8 h-full items-center relative">

          {/* Left Content Column */}
          <div className="z-10 text-center lg:text-left mt-8 lg:mt-0 flex flex-col justify-center w-full">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5 }}
              >
                {/* Badge Tag */}
                <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-sm mb-6">
                  <Sparkles className="w-4 h-4 text-[#B76E79]" />
                  <span className="tracking-wider text-xs md:text-sm text-[#2C2C2C]">
                    {currentSlide.tag}
                  </span>
                </div>

                {/* Main Headline */}
                <h1
                  className="font-serif mb-6"
                  style={{
                    fontSize: 'clamp(2.2rem, 5.5vw, 4.5rem)',
                    lineHeight: 1.1,
                    fontWeight: 700,
                    color: '#2C2C2C',
                  }}
                >
                  {currentSlide.title}
                  <br />
                  <span
                    style={{
                      background: 'linear-gradient(135deg, #B76E79 0%, #D4AF37 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {currentSlide.subtitle}
                  </span>
                </h1>

                {/* Description */}
                <p
                  className="mb-8 max-w-lg mx-auto lg:mx-0"
                  style={{
                    fontSize: '1.125rem',
                    lineHeight: 1.8,
                    color: '#2C2C2C',
                    opacity: 0.8,
                  }}
                >
                  {currentSlide.desc}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Static Interactive Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to={currentSlide.link} >
                <motion.button

                  whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(183, 110, 121, 0.3)' }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 rounded-full font-medium tracking-wide transition-all duration-300 text-white"
                  style={{
                    background: 'linear-gradient(135deg, #B76E79 0%, #D4AF37 100%)',
                    fontSize: '1rem',
                  }}
                >
                  {currentSlide.buttonText}
                </motion.button>
              </Link>
              <Link to='/lookbook'>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 rounded-full font-medium tracking-wide bg-white/70 backdrop-blur-sm hover:bg-white transition-all duration-300 text-[#2C2C2C]"
                  style={{
                    fontSize: '1rem',
                    border: '1px solid rgba(183, 110, 121, 0.3)',
                  }}
                >
                  View Lookbook
                </motion.button>
              </Link>
            </div>

            {/* Static Stats Section */}
            <div className="grid grid-cols-3 gap-2 sm:gap-6 mt-12 max-w-md mx-auto lg:mx-0 w-full">
              {[
                { value: '10K+', label: 'Happy Customers' },
                { value: '500+', label: 'Unique Designs' },
                { value: '4.9', label: 'Customer Rating' },
              ].map((stat, index) => (
                <div key={index} className="text-center lg:text-left">
                  <div className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-[#B76E79]">
                    {stat.value}
                  </div>
                  <div className="text-[10px] sm:text-xs md:text-sm text-[#2C2C2C] opacity-70 leading-tight">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Slider Image Column */}
          <div className="relative flex items-center justify-center h-[40vh] sm:h-[50vh] lg:h-[75vh] w-full mb-4 lg:mb-0">
            <div className="relative w-full max-w-[280px] sm:max-w-[380px] lg:max-w-[450px] h-full max-h-[350px] sm:max-h-[480px] lg:max-h-[550px]">

              {/* Glow backdrop effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#B76E79]/20 to-[#D4AF37]/20 blur-3xl rounded-full" />

              {/* Animated Frame Containers */}
              <div className="absolute inset-0 z-10 w-full h-full overflow-hidden rounded-3xl shadow-2xl">
                <AnimatePresence initial={false} custom={direction}>
                  <motion.img
                    key={current}
                    src={currentSlide.image}
                    alt={currentSlide.alt}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute w-full h-full object-cover"
                    width="450"
                    height="550"
                    fetchpriority="high"
                  />
                </AnimatePresence>
              </div>

              {/* Decorative Geometric Rings */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-6 -right-6 w-24 h-24 sm:-top-8 sm:-right-8 sm:w-32 sm:h-32 border-2 border-[#D4AF37]/30 rounded-full z-0"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute -bottom-6 -left-6 w-32 h-32 sm:-bottom-8 sm:-left-8 sm:w-40 sm:h-40 border-2 border-[#B76E79]/30 rounded-full z-0"
              />

              {/* Manual Controls */}
              <div className="absolute -bottom-14 sm:-bottom-16 left-0 right-0 flex justify-between items-center z-20 px-2 sm:px-4">
                <button
                  onClick={handlePrev}
                  className="p-2 sm:p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:bg-white text-[#2C2C2C] transition"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                {/* Dot Indicators */}
                <div className="flex space-x-2">
                  {banners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setDirection(idx > current ? 1 : -1);
                        setCurrent(idx);
                      }}
                      aria-label={`Go to slide ${idx + 1}`}
                      className={`h-2 transition-all duration-300 rounded-full ${idx === current ? 'w-6 sm:w-8 bg-[#B76E79]' : 'w-2 bg-[#B76E79]/40'
                        }`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNext}
                  className="p-2 sm:p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:bg-white text-[#2C2C2C] transition"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Micro Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 hidden md:block">
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-[#B76E79]/60 rounded-full flex justify-center pt-2"
        >
          <div className="w-1 h-2 bg-[#B76E79] rounded-full" />
        </motion.div>
      </div>
    </section>
  );
}