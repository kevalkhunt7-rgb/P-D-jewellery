import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ProductCard } from './ProductCard';

// Import Product Data
import { useProducts } from '../context/ProductContext';

export function FeaturedCollections() {
  const navigate = useNavigate();
  const { getLatestProducts } = useProducts();

  // Get 6 latest products
  const displayCollections = getLatestProducts();

  return (
    <section
      className="py-20 bg-gradient-to-b from-[#FAF9F6] to-white"
      id="collections"
    >
      <div className="container mx-auto px-4 lg:px-8">

        {/* SECTION HEADER */}
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
            transition={{ duration: 0.5 }}
            className="inline-block px-4 py-2 rounded-full bg-[#FFE5E8]/50 text-[#B76E79] text-sm font-semibold tracking-widest mb-4"
          >
            FEATURED COLLECTIONS
          </motion.span>

          <h2 className="font-serif text-[#2C2C2C] text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Our Signature Pieces
          </h2>

          <p className="max-w-2xl mx-auto text-lg text-[#2C2C2C]/70 leading-relaxed font-light">
            Handpicked collections that embody elegance, craftsmanship, and timeless beauty.
          </p>
        </motion.div>

        {/* PRODUCTS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">

          {displayCollections.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -8 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: index * 0.1
              }}
              className="w-full will-change-transform"
            >
              {/* 🌟 FIX: Spread the product object cleanly so the image arrays line up perfectly */}
              <ProductCard {...product} />
            </motion.div>
          ))}

        </div>

        {/* VIEW ALL BUTTON */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.8,
            delay: 0.4
          }}
          className="text-center mt-14"
        >
          <motion.button
            onClick={() => navigate('/collections')}
            whileHover={{
              scale: 1.05,
              y: -2
            }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-4 text-base font-medium tracking-wide bg-white border-2 border-[#B76E79] text-[#2C2C2C] hover:bg-[#B76E79] hover:text-white hover:border-[#B76E79] transition-all duration-300 rounded-full shadow-lg hover:shadow-2xl"
          >
            View All Collections
          </motion.button>
        </motion.div>

      </div>
    </section>
  );
}