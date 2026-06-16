import React from 'react';
import { motion } from 'framer-motion';
import { ProductCard } from './ProductCard';
import { useProducts } from '../context/ProductContext';

export function RelatedProducts({ currentProduct }) {
    const { products } = useProducts();

    // Get products with same category, exclude current product
    const relatedProducts = products.filter(
        (product) =>
            product.id !== currentProduct.id &&
            product.category === currentProduct.category
    ).slice(0, 4); // Limit to 4 products

    if (relatedProducts.length === 0) return null;

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-16 pb-24">
            <div className="text-center mb-12">
                <h2 className="font-serif text-3xl sm:text-4xl tracking-tight text-stone-900 mb-4">
                    You May Also Like
                </h2>
                <p className="text-stone-500 text-sm">
                    Explore similar pieces from our atelier
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {relatedProducts.map((product, index) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.5,
                            delay: index * 0.1,
                            ease: 'easeOut'
                        }}
                    >
                        <ProductCard {...product} />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
