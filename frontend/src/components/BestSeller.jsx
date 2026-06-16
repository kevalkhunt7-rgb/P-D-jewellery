import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion'; 
import SliderComponent from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from './ProductCard';

// Import your unified database file
import { useProducts } from '../context/ProductContext';

export function BestSellers() {
  const sliderRef = useRef(null);
  const Slider = SliderComponent.default || SliderComponent;
  
  const { getBestSellers } = useProducts();
  const [slidesToShow, setSlidesToShow] = useState(4);
  const [isMounted, setIsMounted] = useState(false);

  // Use the helper from context
  const bestSellersList = getBestSellers();

  useEffect(() => {
    setIsMounted(true);
    
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setSlidesToShow(1);
      } else if (width < 1024) {
        setSlidesToShow(2);
      } else if (width < 1280) {
        setSlidesToShow(3);
      } else {
        setSlidesToShow(4);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const settings = {
    dots: true,
    infinite: bestSellersList.length > slidesToShow, // Only loop if there are enough items
    speed: 500,
    slidesToShow: slidesToShow,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: true,
    arrows: false,
  };

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-white to-[#FFE5E8]/20 overflow-hidden w-full">
      <div className="container mx-auto px-4 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 md:mb-16 relative"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-[#F7E7CE]/50 mb-4 text-xs font-semibold tracking-widest text-[#D4AF37]">
            CUSTOMER FAVORITES
          </span>
          <h2 className="font-serif mb-4 text-3xl md:text-5xl font-bold text-[#2C2C2C]">
            Best Sellers
          </h2>
          <p className="max-w-2xl mx-auto px-2 text-base md:text-lg text-[#2C2C2C]/70 leading-relaxed">
            Most loved pieces by our community of jewelry enthusiasts
          </p>

          {/* Navigation Controls */}
          {bestSellersList.length > slidesToShow && (
            <div className="hidden sm:flex absolute bottom-0 right-0 gap-3 z-10">
              <button
                onClick={() => sliderRef.current?.slickPrev()}
                className="w-11 h-11 rounded-full bg-white shadow-md hover:bg-[#B76E79] hover:text-white transition-all duration-300 flex items-center justify-center border border-gray-100"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => sliderRef.current?.slickNext()}
                className="w-11 h-11 rounded-full bg-white shadow-md hover:bg-[#B76E79] hover:text-white transition-all duration-300 flex items-center justify-center border border-gray-100"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </motion.div>

        {/* Carousel Container Wrapper */}
        <div className="w-full overflow-hidden px-1">
          {isMounted && bestSellersList.length > 0 ? (
            <Slider ref={sliderRef} {...settings} key={`slides-${slidesToShow}`}>
              {bestSellersList.map((product, index) => (
                <div key={product.id || index} className="px-4 py-4 outline-none">
                  <div className="w-full mx-auto">
                    <ProductCard {...product} />
                  </div>
                </div>
              ))}
            </Slider>
          ) : (
            <div className="w-full h-96 bg-gray-50/50 animate-pulse rounded-2xl" />
          )}
        </div>

        {/* CSS Track Structural Layout Cleanups */}
        <style>{`
          .slick-slider { padding-bottom: 50px; }
          .slick-list { margin: 0 !important; padding: 0 !important; overflow: hidden; width: 100% !important; }
          .slick-track { display: flex !important; margin-left: 0 !important; margin-right: 0 !important; }
          .slick-slide { height: inherit !important; float: none !important; }
          .slick-dots { bottom: 10px; }
          .slick-dots li button:before { font-size: 10px; color: #B76E79; opacity: 0.3; }
          .slick-dots li.slick-active button:before { opacity: 1; color: #B76E79; }
        `}</style>
      </div>
    </section>
  );
}