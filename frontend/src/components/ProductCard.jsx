import React from 'react';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext'; 
import { useWishlist } from '../context/WishlistContext';
import { useSettings } from '../context/SettingsContext';

export function ProductCard(props) {
  // 🛠️ HOOKS DECLARED FIRST (Ensures unconditional call order)
  const navigate = useNavigate();
  const { addToCart, cart } = useCart(); 
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { settings } = useSettings();

  // 🌟 THE HYBRID FIX: Reads properties safely whether passed as an object (product={...}) or flat props!
  const target = props.product ? props.product : props;

  const id = target._id || target.id;
  const title = target.name || target.title;
  const price = target.price;
  const originalPrice = target.originalPrice;
  
  const currency = target.currency || settings?.general?.currency || "INR"; 
  const currencySymbol = target.currencySymbol || settings?.general?.currencySymbol || "₹"; 
  
  const tag = target.tag;
  const rating = target.rating || target.defaultRating || 0;
  const slug = target.slug;

  // 🚨 SAFETY NET: If this is an uninitialized ghost object from the DB, skip rendering
  if (!id && !title && !price) {
    return null;
  }

  // ✅ NEW CLEAN PRICE FORMATTER
  const formatPrice = (value) => {
    if (value === null || value === undefined || value === "") return "";

    const num = typeof value === "string" ? Number(value) : value;

    if (isNaN(num)) return "";

    if (currency === "USD") {
      return `${currencySymbol}${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    return `${currencySymbol}${num.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  // 🛠️ FALLBACK PLACEHOLDER: Prevents layout breaking if an image fails to load or process
  const fallbackPlaceholder =
    "https://placehold.co/500x500/f9fafb/cccccc?text=Image+Unavailable";

  // 🌟 DYNAMIC IMAGE PARSER: Safely uncoils nested multi-image matrices or standard product strings
  const displayImage = target.image || 
    (target.images && target.images.length > 0 ? (target.images[0].url || target.images[0]) : fallbackPlaceholder);
  
  const liked = isInWishlist ? isInWishlist(id) : false;
  const isAlreadyInCart = cart?.some((item) => item.id === id) || false;

  // ⚡ BULLETPROOF URL SLUG GENERATOR
  const validSlug = slug || title?.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace spaces and special characters with hyphens
    .replace(/(^-|-$)+/g, '')    // Trim dangling hyphens from either end
    || id;

  // REDIRECT TO PRODUCT DETAIL PAGE
  const handleProductRedirect = () => {
    if (!validSlug) return;
    navigate(`/product/${validSlug}`);
  };

  // ADD TO CART INTERACTION DISPATCHER
  const handleAddToBag = async (e) => {
    e.stopPropagation(); 

    if (isAlreadyInCart) return;

    const parsedPrice = typeof price === 'string' 
      ? parseFloat(price.replace(/[^0-9.]/g, '')) 
      : price;

    const productData = {
      id: id,
      title: title,
      price: parsedPrice,
      image: displayImage
    };

    const defaultFinish = { name: "Signature Classic", class: "bg-amber-100" };

    if (addToCart) {
      addToCart(productData, 1, defaultFinish);
    }
  };

  // WISHLIST INTERACTION DISPATCHER
  const handleWishlistToggle = (e) => {
    e.stopPropagation(); 
    
    if (toggleWishlist) {
      toggleWishlist({
        id,
        title,
        price,
        image: displayImage,
        tag
      });
    }
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
              background: 'linear-gradient(135deg, #B76E79 0%, #D4AF37 100%)',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.05em'
            }}
          >
            {tag}
          </div>
        )}

        {/* Image Frame Container */}
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
            src={displayImage}
            alt={title || "Product Image"}
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

          {/* Action Hover Panel Controls */}
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
            {/* Wishlist Button */}
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

            {/* Quick View Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!validSlug) return;
                navigate(`/product/${validSlug}`);
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

            {/* Shopping Bag Button */}
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

        {/* Info Card Body Section */}
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
            {title || 'Loading Product Name...'}
          </h3>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 'auto'
            }}
          >
            {/* Price Pricing Display Wrap */}
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
                  background: 'linear-gradient(135deg, #B76E79 0%, #D4AF37 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                {formatPrice(price)}
              </span>

              {originalPrice && (
                <span
                  style={{
                    fontSize: '0.8rem',
                    textDecoration: 'line-through',
                    color: '#9ca3af'
                  }}
                >
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>

            {/* Jewelry Golden Rating Stars */}
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
                  fill={i < Math.round(rating) ? '#D4AF37' : '#E5E7EB'}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
        </div>

        {/* Luxury Component Scope Micro-Styles */}
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