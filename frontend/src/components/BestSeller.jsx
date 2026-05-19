import { useRef } from 'react';
import { motion } from 'framer-motion'; 
import SliderComponent from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from './ProductCard';

const bestSellers = [
  {
    image: 'https://images.unsplash.com/photo-1611583027838-515a1087afdb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb2xkJTIwbmVja2xhY2UlMjBlbGVnYW50JTIwamV3ZWxyeXxlbnwxfHx8fDE3NzkxNjY2NDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Luxe Gold Layered Chain',
    price: 129,
    originalPrice: 179,
    tag: 'HOT',
  },
  {
    image: 'https://images.unsplash.com/photo-1583937443325-97becde478a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWFtb25kJTIwcmluZyUyMGx1eHVyeXxlbnwxfHx8fDE3NzkxNjY2NDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Solitaire Diamond Ring',
    price: 189,
    tag: 'BESTSELLER',
  },
  {
    image: 'https://images.unsplash.com/photo-1615197419962-90f21da0956d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZWFybCUyMGVhcnJpbmdzJTIwZWxlZ2FudHxlbnwxfHx8fDE3NzkxNjY2NDM8MA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Pearl Chandelier Earrings',
    price: 95,
    tag: 'TRENDING',
  },
  {
    image: 'https://images.unsplash.com/photo-1633810543462-77c4a3b13f07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb2xkJTIwYnJhY2VsZXQlMjBsdXh1cnl8ZW58MXx8fHwxNzc5MDg0NzUxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Infinity Gold Bangle',
    price: 109,
    originalPrice: 149,
  },
  {
    image: 'https://images.unsplash.com/photo-1577883751617-803a40e0057b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcnlzdGFsJTIwcGVuZGFudCUyMGx1eHVyeXxlbnwxfHx8fDE3NzkxNjY2NDR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Mystic Crystal Pendant',
    price: 119,
    tag: 'NEW',
  },
];

export function BestSellers() {
  const sliderRef = useRef(null);
  const Slider = SliderComponent.default || SliderComponent;

  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: true,
    arrows: false,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          centerMode: true,       // FIXED: Keeps card centered on narrow viewports
          centerPadding: '20px',  // FIXED: Prevents layout edges from clipping cards
        },
      },
    ],
  };

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-white to-[#FFE5E8]/20 overflow-x-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 md:mb-16 relative"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-2 rounded-full bg-[#F7E7CE]/50 mb-4"
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#D4AF37',
              letterSpacing: '0.1em',
            }}
          >
            CUSTOMER FAVORITES
          </motion.span>
          <h2
            className="font-serif mb-4"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              fontWeight: 700,
              color: '#2C2C2C',
            }}
          >
            Best Sellers
          </h2>
          <p
            className="max-w-2xl mx-auto px-2"
            style={{
              fontSize: '1.125rem',
              lineHeight: 1.8,
              color: '#2C2C2C',
              opacity: 0.7,
            }}
          >
            Most loved pieces by our community of jewelry enthusiasts
          </p>

          {/* Navigation Controls - Hidden on Mobile to prevent layout crunching */}
          <div className="hidden sm:flex absolute bottom-0 right-0 gap-3 z-10">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => sliderRef.current?.slickPrev()}
              className="w-11 h-11 rounded-full bg-white shadow-md hover:bg-[#B76E79] hover:text-white transition-all duration-300 flex items-center justify-center border border-gray-100"
              style={{ color: '#2C2C2C' }}
              aria-label="Previous products"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => sliderRef.current?.slickNext()}
              className="w-11 h-11 rounded-full bg-white shadow-md hover:bg-[#B76E79] hover:text-white transition-all duration-300 flex items-center justify-center border border-gray-100"
              style={{ color: '#2C2C2C' }}
              aria-label="Next products"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* Carousel Container */}
        <div className="w-full mx-auto px-1">
          <Slider ref={sliderRef} {...settings}>
            {bestSellers.map((product, index) => (
              /* FIXED: Applied responsive padding inside the wrapper block to decouple layout logic from ProductCard */
              <div key={index} className="px-2 sm:px-3 py-4 outline-none">
                <div className="w-full max-w-[320px] sm:max-w-none mx-auto">
                  <ProductCard {...product} />
                </div>
              </div>
            ))}
          </Slider>
        </div>

        {/* Custom Dots Styling */}
        <style>{`
          .slick-slider {
            padding-bottom: 50px;
          }
          .slick-list {
            margin: 0 -8px;
          }
          .slick-dots {
            bottom: 10px;
          }
          .slick-dots li {
            margin: 0 4px;
          }
          .slick-dots li button:before {
            font-size: 10px;
            color: #B76E79;
            opacity: 0.3;
            transition: all 0.3s ease;
          }
          .slick-dots li.slick-active button:before {
            opacity: 1;
            color: #B76E79;
            transform: scale(1.2);
          }
        `}</style>
      </div>
    </section>
  );
}