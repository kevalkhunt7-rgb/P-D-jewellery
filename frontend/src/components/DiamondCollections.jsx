import React, { useEffect } from 'react';
import { useProducts } from '../context/ProductContext'; 
import {ProductCard} from './ProductCard'; 

function DiamondCollections() {
  const { products, filteredProducts, loading, error, getProducts } = useProducts();

  useEffect(() => {
    if (getProducts) {
      getProducts(); 
    }
  }, []);

  const sourceProducts = filteredProducts || products || [];

  const diamondOnlyProducts = sourceProducts.filter((product) => {
    if (!product?.gemstoneDetails || !Array.isArray(product.gemstoneDetails)) {
      return false;
    }
    return product.gemstoneDetails.some(
      (gem) => gem.name && gem.name.toLowerCase() === 'diamond'
    );
  });

  if (!loading && diamondOnlyProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-20 px-4 bg-white min-h-screen block relative clear-both">
      <div className="container mx-auto max-w-6xl relative z-10">
        
        {/* Header Block */}
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-[0.3em] text-[#B76E79] font-bold block mb-2">
            Our Collections
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#2C2C2C] tracking-wide mb-4">
            Diamond Collections
          </h2>
          <p className="text-sm md:text-base text-stone-600 max-w-2xl mx-auto">
            Exquisite diamond jewellery, crafted to perfection for every occasion.
          </p>
        </div>

        {/* 🌟 Dynamic Product Render Area */}
        {loading ? (
          <div className="text-center py-12 text-stone-500 font-medium">
            Loading exquisite diamond collections...
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">
            Error fetching diamonds: {error}
          </div>
        ) : (
          /* 🌟 This is your core container grid. Added border/padding to make sure it's visible on screen */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full block clear-both min-h-[400px] p-2">
            {diamondOnlyProducts.map((product) => {
              // Safety fallback identification key tracker
               const productKey = product._id || product.id || Math.random().toString();
              return (
                <div key={productKey} className="w-full h-full block">
                  <ProductCard product={product} />
                </div>
              );
            })}
          </div>
        )}

     

      </div>
    </section>
  );
}

export default DiamondCollections;