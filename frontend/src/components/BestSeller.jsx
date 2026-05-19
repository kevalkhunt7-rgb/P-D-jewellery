import { useRef } from 'react';
import { motion } from 'framer-motion'; // Replaced 'motion/react' with standard 'framer-motion'
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
    image: 'https://images.unsplash.com/photo-1615197419962-90f21da0956d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZWFybCUyMGVhcnJpbmdzJTIwZWxlZ2FudHxlbnwxfHx8fDE3NzkxNjY2NDN8MA&ixlib=rb-4.1.0&q=80&w=1080',
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
  // FIX: Removed TypeScript type annotation (<any>)
  const sliderRef = useRef(null);
const Slider = SliderComponent.default || SliderComponent;
  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
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
        },
      },
    ],
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white to-[#FFE5E8]/20">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
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
            className="max-w-2xl mx-auto"
            style={{
              fontSize: '1.125rem',
              lineHeight: 1.8,
              color: '#2C2C2C',
              opacity: 0.7,
            }}
          >
            Most loved pieces by our community of jewelry enthusiasts
          </p>
        </motion.div>

        {/* Carousel with custom navigation */}
        <div className="relative overflow-hidden px-1">
          {/* Custom Navigation Buttons */}
          <div className="absolute -top-16 right-4 flex gap-3 z-10">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => sliderRef.current?.slickPrev()}
              className="w-12 h-12 rounded-full bg-white shadow-lg hover:bg-[#B76E79] hover:text-white transition-all duration-300 flex items-center justify-center"
              style={{ color: '#2C2C2C' }}
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => sliderRef.current?.slickNext()}
              className="w-12 h-12 rounded-full bg-white shadow-lg hover:bg-[#B76E79] hover:text-white transition-all duration-300 flex items-center justify-center"
              style={{ color: '#2C2C2C' }}
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Slider */}
          <Slider ref={sliderRef} {...settings}>
            {bestSellers.map((product, index) => (
              <div key={index} className="px-3">
                <ProductCard {...product} />
              </div>
            ))}
          </Slider>
        </div>

        {/* Custom Dots Styling */}
        <style>{`
  .slick-slider {
    padding-bottom: 40px;
  }

  .slick-dots {
    bottom: 0px;
  }

  .slick-dots li button:before {
    font-size: 20px;
    color: #B76E79;
    opacity: 0.4;
  }

  .slick-dots li.slick-active button:before {
    opacity: 1;
    color: #B76E79;
  }
`}</style>
      </div>
    </section>
  );
}