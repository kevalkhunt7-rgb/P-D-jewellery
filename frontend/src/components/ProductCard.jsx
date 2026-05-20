import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext'; 
import { useWishlist } from '../context/WishlistContext';

export function ProductCard({
  id,
  image,
  title,
  price,
  originalPrice,
  tag
}) {
  const fallbackPlaceholder =
    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&auto=format&fit=crop&q=60";

  const navigate = useNavigate();
  const { addToCart, cart } = useCart(); // 1. Pull the raw cart array state here
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const liked = isInWishlist(id);
  
  // 2. Check if this specific product is already present inside your shopping cart items array
  const isAlreadyInCart = cart.some((item) => item.id === id);

  // REDIRECT TO PRODUCT PAGE
  const handleProductRedirect = () => {
    navigate(`/product/${id}`);
  };

  // INTERCEPT & DISPATCH INTERACTION TO CART CONTEXT
  const handleAddToBag = (e) => {
    e.stopPropagation(); // Stop click from triggering parent handleProductRedirect

    // If item is already added to cart, ignore any clicking attempts completely
    if (isAlreadyInCart) return;

    // 1. Sanitize price format if it comes in as a string variant like "$320.00"
    const parsedPrice = typeof price === 'string' 
      ? parseFloat(price.replace(/[^0-9.]/g, '')) 
      : price;

    // 2. Structure the product object exactly like the context expects for parameter 1
    const productData = {
      id: id,
      title: title,
      price: parsedPrice,
      image: image || fallbackPlaceholder
    };

    // 3. Define a default finish if your store layout uses them for variants
    const defaultFinish = { name: "Signature Classic", class: "bg-amber-100" };

    // 4. Pass arguments matching context signature: addToCart(product, quantity, selectedFinish)
    addToCart(productData, 1, defaultFinish);
  };

  const handleWishlistToggle = (e) => {
    e.stopPropagation(); // Prevent redirecting to details page
    
    toggleWishlist({
      id,
      title,
      price,
      image,
      tag
    });
  };

  return (
    <>
      <div
        onClick={handleProductRedirect}
        className="luxury-product-card group relative flex flex-col w-full bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl border border-gray-100 cursor-pointer"
        style={{
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          backgroundColor: '#ffffff',
          borderRadius: '1rem',
          overflow: 'hidden',
          border: '1px solid #f3f4f6',
          width: '100%',
          transition: 'all 0.3s ease-in-out'
        }}
      >
        {/* Dynamic Tag */}
        {tag && (
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              zIndex: 20,
              padding: '4px 12px',
              borderRadius: '9999px',
              background:
                'linear-gradient(135deg, #B76E79 0%, #D4AF37 100%)',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.05em'
            }}
          >
            {tag}
          </div>
        )}

        {/* Image Bounding Block */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '1 / 1',
            overflow: 'hidden',
            backgroundColor: '#f9fafb'
          }}
        >
          <img
            src={image || fallbackPlaceholder}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = fallbackPlaceholder;
            }}
          />

          {/* Shadow Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none" />

          {/* Action Buttons */}
          <div
            className="hover-actions-panel absolute inset-0 flex items-center justify-center gap-3 z-20"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              zIndex: 20,
              opacity: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.15)',
              transition: 'opacity 0.3s ease-in-out'
            }}
          >
            {/* Wishlist Button - Becomes filled red if 'liked' is true */}
            <button
              onClick={handleWishlistToggle}
              className="action-btn w-11 h-11 rounded-full flex items-center justify-center shadow-md border-0 cursor-pointer"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: 'none',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backgroundColor: liked ? '#ef4444' : '#ffffff',
                color: liked ? '#ffffff' : '#1f2937',
                transition: 'all 0.2s ease-in-out'
              }}
              aria-label="Add to wishlist"
            >
              <Heart size={18} fill={liked ? "#ffffff" : "none"} />
            </button>

            {/* QUICK VIEW */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/product/${id}`);
              }}
              className="action-btn w-11 h-11 rounded-full text-gray-800 flex items-center justify-center shadow-md border-0 cursor-pointer"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: 'none',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backgroundColor: '#ffffff',
                transition: 'all 0.2s ease-in-out'
              }}
              aria-label="Quick view"
            >
              <Eye size={18} />
            </button>

            {/* SHOPPING BAG / ADD TO CART - Changes style and disables cursor interaction if in cart */}
            <button
              onClick={handleAddToBag}
              disabled={isAlreadyInCart}
              className={`w-11 h-11 rounded-full flex items-center justify-center shadow-md border-0 ${
                isAlreadyInCart ? 'cursor-not-allowed opacity-80' : 'action-btn cursor-pointer'
              }`}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: 'none',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isAlreadyInCart ? '#B76E79' : '#ffffff',
                color: isAlreadyInCart ? '#ffffff' : '#1f2937',
                transition: 'all 0.2s ease-in-out'
              }}
              aria-label={isAlreadyInCart ? "Product in cart" : "Add to cart"}
            >
              <ShoppingBag size={18} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <h3
            className="font-sans font-medium line-clamp-2 text-gray-800 hover:text-[#B76E79] transition-colors"
            style={{
              margin: 0,
              fontSize: '0.95rem',
              lineHeight: '1.4',
              color: '#2C2C2C',
              fontWeight: 500,
              minHeight: '40px'
            }}
          >
            {title}
          </h3>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 'auto'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '8px'
              }}
            >
              <span
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  background:
                    'linear-gradient(135deg, #B76E79 0%, #D4AF37 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                {typeof price === 'number' ? `$${price.toFixed(2)}` : price}
              </span>

              {originalPrice && (
                <span
                  style={{
                    fontSize: '0.8rem',
                    textDecoration: 'line-through',
                    color: '#9ca3af'
                  }}
                >
                  {typeof originalPrice === 'number' ? `$${originalPrice.toFixed(2)}` : originalPrice}
                </span>
              )}
            </div>

            {/* Rating */}
            <div
              style={{
                display: 'flex',
                gap: '2px',
                alignItems: 'center'
              }}
            >
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  style={{ width: '14px', height: '14px' }}
                  fill={i < 4 ? '#D4AF37' : '#E5E7EB'}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
        </div>

        {/* Hover CSS */}
        <style>{`
          .luxury-product-card:hover {
            transform: translateY(-6px);
          }

          .luxury-product-card:hover .hover-actions-panel {
            opacity: 1 !important;
          }

          .action-btn:hover {
            background-color: #B76E79 !important;
            color: #ffffff !important;
            transform: scale(1.1);
          }
        `}</style>
      </div>
    </>
  );
}