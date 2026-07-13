import React from 'react';
import { Heart } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { useProducts } from '../context/ProductContext'; // 1. Import your products context

export function WishlistTab({ validWishlistItems }) {
  const { products } = useProducts(); // 2. Pull the complete product list with all ratings intact

  return (
    <div className="space-y-6 animate-fade-in-slow">
      <div>
        <h3 className="font-serif text-2xl">Wishlist</h3>
        <p className="text-sm mt-1">Your saved luxury pieces.</p>
      </div>

      {validWishlistItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {validWishlistItems.map((item) => {
            const itemId = item.id || item._id;

            // 3. Find the rich product data from the database to recover the dropped rating properties
            const fullProductData = products?.find(
              (p) => String(p._id || p.id) === String(itemId)
            );

            // 4. Use the full data's rating, fallback safely if not found
            const productRating = fullProductData?.rating || fullProductData?.ratings || item.rating || item.ratings || 0;
            const reviewsCount = fullProductData?.reviewsCount ?? fullProductData?.reviewCount ?? fullProductData?.numOfReviews ?? fullProductData?.rating?.count ?? item.reviewsCount ?? 0;

            return (
              <ProductCard
                key={itemId}
                id={itemId}
                title={item.title || item.name}
                price={item.price}
                image={item.image || (fullProductData?.images && fullProductData.images.length > 0 ? (fullProductData.images[0].url || fullProductData.images[0]) : '')}
                images={fullProductData?.images}
                tag={item.tag || fullProductData?.tag}
                rating={productRating}
                reviewsCount={reviewsCount}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed">
          <Heart className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="font-serif text-gray-500">Your wishlist is empty</p>
        </div>
      )}
    </div>
  );
}