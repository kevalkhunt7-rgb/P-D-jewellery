import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom'; // Added for seamless collection routing
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag, Trash2, Heart, Plus, Minus, ShieldCheck,
  Truck, Sparkles, ChevronRight, ArrowRight
} from 'lucide-react';
import { useCart } from '../context/CartContext'; // Import your global context hook
import { useWishlist } from '../context/WishlistContext';
import { useProducts } from '../context/ProductContext';
import { ProductCard } from '../components/ProductCard';

function Cart({ currentProduct, quantity, selectedFinish }) {
  // Destructure real-time shared states and helper functions from your Context
  const { cart, updateQuantity, removeFromCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { products } = useProducts();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  // Recommendations logic - Pick 3 random products whenever page opens
  const recommendedItems = useMemo(() => {
    if (!products || products.length === 0) return [];
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, [products]);

  const handleSaveForLater = (item) => {
    // 1. Add to Wishlist if not already there
    if (!isInWishlist(item.id)) {
      toggleWishlist(item);
    }
    // 2. Remove from Cart
    removeFromCart(item.id, item.selectedFinish?.name);
  };

  // Dynamic calculations based on live cart items
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = subtotal > 300 || subtotal === 0 ? 0 : 15.00;
  const taxes = subtotal * 0.08;
  const grandTotal = subtotal - appliedDiscount + shipping + taxes;

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoCode.toUpperCase() === 'ATELIER10') {
      setAppliedDiscount(subtotal * 0.10);
    } else {
      setAppliedDiscount(0);
    }
  };

  const handleRedirect = () => {
    // Simply route to your checkout URL
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen w-full bg-[#FDF8F3] relative overflow-hidden font-sans text-[#2C2C2C] selection:bg-[#E8C7B7]/30 selection:text-[#2C2C2C] pt-24 pb-16">

      {/* Background Soft Blurs & Cinematic Reflections */}
      <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] rounded-full bg-gradient-to-tr from-[#FFF0EB] via-[#E8C7B7]/10 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[35%] h-[35%] rounded-full bg-gradient-to-bl from-[#D4AF37]/5 to-[#FFF0EB] blur-[120px] pointer-events-none" />

      {/* Floating Gold Dust Particles */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-[#D4AF37] to-[#E8C7B7] opacity-25 cart-gold-dust"
            style={{
              width: `${Math.random() * 5 + 2}px`,
              height: `${Math.random() * 5 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${12 + Math.random() * 12}s`
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10 max-w-[1400px]">

        {/* TOP SECTION: BREADCRUMBS & HEADER */}
        <div className="text-center mb-12 animate-fade-in">
          <nav className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#2C2C2C]/40 mb-3">
            <Link to="/" className="hover:text-[#B76E79] cursor-pointer transition-colors">Boutique</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#B76E79] font-medium">Your Curation</span>
          </nav>
          <h1 className="font-serif text-3xl sm:text-5xl font-light tracking-wide text-[#2C2C2C]">
            Your Luxury <span className="italic text-[#B76E79]">Collection</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#2C2C2C]/60 tracking-wide mt-2 font-light">
            Beautiful pieces hand-selected for your private reflection.
          </p>
        </div>

        {cart.length === 0 ? (
          /* EMPTY CART STATE */
          <div className="max-w-xl mx-auto text-center py-16 px-6 bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-[0_30px_70px_rgba(232,199,183,0.15)] animate-fade-in-quick">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#FFF0EB] to-[#E8C7B7]/30 rounded-full flex items-center justify-center text-[#B76E79] relative">
              <ShoppingBag className="w-8 h-8 stroke-[1.25]" />
              <div className="absolute inset-0 rounded-full border border-dashed border-[#D4AF37]/40 animate-spin-slow" />
            </div>
            <h2 className="font-serif text-2xl font-light mb-3">The Vault is Empty</h2>
            <p className="text-xs text-[#2C2C2C]/50 max-w-sm mx-auto leading-relaxed mb-8">
              Your personal treasure case is waiting to be adorned with timeless elegance and delicate craftsmanship.
            </p>
            <Link
              to="/"
              className="luxury-gradient-btn inline-flex items-center gap-3 px-8 py-3.5 rounded-full text-white font-medium text-xs uppercase tracking-widest relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #B76E79 0%, #E8C7B7 50%, #D4AF37 100%)', backgroundSize: '200% auto' }}
            >
              <span>Explore Collections</span>
              <ArrowRight className="w-4 h-4" />
              <div className="shimmer-line" />
            </Link>
          </div>
        ) : (
          /* TWO-COLUMN LAYOUT */
          <div className="grid grid-cols-12 gap-8 items-start">

            {/* LEFT SIDE: DYNAMIC ITEMS GENERATED FROM GLOBAL STATE */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              {cart.map((item) => (
                <div
                  key={`${item.id}-${item.selectedFinish?.name || 'default'}`}
                  className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-4 sm:p-6 border border-white shadow-[0_15px_40px_rgba(44,44,44,0.02)] flex flex-col sm:flex-row gap-6 relative overflow-hidden group hover:shadow-[0_20px_50px_rgba(232,199,183,0.25)] transition-all duration-500"
                >
                  <div className="absolute inset-0 rounded-[2rem] border border-transparent pointer-events-none transition-all duration-500 group-hover:border-[#E8C7B7]/40" />

                  {/* Product Image Window */}
                  <div className="w-full sm:w-36 h-36 rounded-2xl overflow-hidden bg-[#FDF8F3] border border-[#E8C7B7]/20 relative flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-[4000ms] group-hover:scale-105"
                    />
                  </div>

                  {/* Specifications & Live Interactivity Mapping */}
                  <div className="flex flex-col justify-between flex-grow">
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-serif text-lg text-[#2C2C2C] tracking-wide group-hover:text-[#B76E79] transition-colors duration-300">
                            {item.title}
                          </h3>
                          <p className="text-[10px] text-[#2C2C2C]/40 font-mono mt-0.5 tracking-wide uppercase">
                            SKU: LUM-PR-{item.id}00
                          </p>
                        </div>
                        <p className="font-serif text-lg font-medium text-[#2C2C2C]">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <p className="text-sm text-[#2C2C2C]/50 font-medium mt-2 italic flex items-center gap-1.5">
                        {item.selectedFinish ? (
                          <>
                            <span className={`w-2.5 h-2.5 rounded-full ${item.selectedFinish.class} inline-block border border-stone-900/10`} />
                            {item.selectedFinish.name}
                          </>
                        ) : (
                          "Signature Classic Composition"
                        )}
                      </p>
                    </div>

                    {/* Quantity Modifier Buttons */}
                    <div className="flex items-center justify-between mt-6 flex-wrap gap-4">
                      <div className="flex items-center bg-[#FDF8F3] border border-[#E8C7B7]/40 rounded-full p-1 shadow-sm">
                        <button
                          onClick={() => updateQuantity(item.id, item.selectedFinish?.name, item.quantity - 1)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[#2C2C2C]/60 hover:text-[#B76E79] hover:bg-white transition-all"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-10 text-center text-xs font-semibold text-[#2C2C2C]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.selectedFinish?.name, item.quantity + 1)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[#2C2C2C]/60 hover:text-[#B76E79] hover:bg-white transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Item Discard Triggers */}
                      <div className="flex items-center gap-6">
                        <button
                          onClick={() => handleSaveForLater(item)}
                          className="inline-flex items-center gap-1.5 text-xs text-[#2C2C2C]/50 hover:text-[#B76E79] transition-colors group/heart"
                        >
                          <Heart className={`w-3.5 h-3.5 transition-colors ${isInWishlist(item.id) ? 'text-[#B76E79] fill-[#B76E79]' : 'text-[#2C2C2C]/30 group-hover/heart:text-[#B76E79]'}`} />
                          <span className="tracking-wide">Save for Later</span>
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id, item.selectedFinish?.name)}
                          className="inline-flex items-center gap-1.5 text-xs text-[#2C2C2C]/50 hover:text-red-700 transition-colors group/trash"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-[#2C2C2C]/30 group-hover/trash:text-red-600 transition-colors" />
                          <span className="tracking-wide">Remove</span>
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT SIDE: LIVE SUMMARY CALCULATION WORKSPACE */}
            <div className="col-span-12 lg:col-span-4 lg:sticky lg:top-24">
              <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-8 border border-white shadow-[0_25px_60px_rgba(44,44,44,0.03)] relative overflow-hidden">

                <div className="absolute inset-0 rounded-[2.5rem] border border-transparent pointer-events-none luxury-panel-glow" />

                <h3 className="font-serif text-xl tracking-wide mb-6">Atelier Invoice Summary</h3>

                {/* Real Pricing Displays */}
                <div className="space-y-4 text-sm pb-6 border-b border-[#E8C7B7]/20">
                  <div className="flex justify-between items-center text-[#2C2C2C]/70">
                    <span className="font-light">Subtotal</span>
                    <span className="font-medium text-[#2C2C2C]">${subtotal.toFixed(2)}</span>
                  </div>

                  {appliedDiscount > 0 && (
                    <div className="flex justify-between items-center text-green-700">
                      <span className="font-light inline-flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> Privilege Discount (10%)
                      </span>
                      <span className="font-semibold">-${appliedDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-[#2C2C2C]/70">
                    <span className="font-light">Premium Delivery</span>
                    <span className="font-medium text-[#2C2C2C]">
                      {shipping === 0 ? (
                        <span className="text-[#D4AF37] italic uppercase tracking-wider text-xs font-semibold">Complimentary</span>
                      ) : (
                        `$${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[#2C2C2C]/70">
                    <span className="font-light">Estimated Duties & Taxes</span>
                    <span className="font-medium text-[#2C2C2C]">${taxes.toFixed(2)}</span>
                  </div>
                </div>



                {/* Allocated Grand Total */}
                <div className="pt-6 pb-6 flex justify-between items-baseline">
                  <span className="font-serif text-base tracking-wide">Total Ammount</span>
                  <span className="font-serif text-2xl font-bold text-[#B76E79]">${grandTotal.toFixed(2)}</span>
                </div>

                <button
                  onClick={handleRedirect}
                  className="luxury-gradient-btn w-full py-4 px-6 rounded-full text-white font-medium tracking-widest text-xs uppercase shadow-lg relative overflow-hidden flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #B76E79 0%, #E8C7B7 50%, #D4AF37 100%)',
                    backgroundSize: '200% auto'
                  }}
                >
                  <span>Proceed to Secure Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                  <div className="shimmer-line" />
                </button>

                <div className="mt-6 pt-4 border-t border-[#E8C7B7]/10 flex flex-col gap-3">
                  <div className="flex items-center gap-2.5 text-[11px] text-[#2C2C2C]/60">
                    <ShieldCheck className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                    <span>Insured, highly encrypted boutique fulfillment.</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[11px] text-[#2C2C2C]/60">
                    <Truck className="w-4 h-4 text-[#B76E79] flex-shrink-0" />
                    <span>Signature required white-glove arrival.</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* BOTTOM SECTION: RECOMMENDATIONS */}
        <div className="mt-20 relative z-10">
          <div className="flex items-center gap-2 mb-8">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="font-serif text-xl sm:text-2xl font-light tracking-wide text-[#2C2C2C]">
              You May Also <span className="italic text-[#B76E79]">Love</span>
            </h3>
          </div>

          {/* Render your authentic grid configuration using the standard ProductCard wrapper */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {recommendedItems.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
              />
            ))}
          </div>
        </div>

      </div>

      {/* Animation Stylesheet Styles */}
      <style>{`
        .cart-gold-dust {
          animation: cartDustMote infinite linear;
        }
        @keyframes cartDustMote {
          0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 0; }
          20% { opacity: 0.3; }
          80% { opacity: 0.3; }
          100% { transform: translateY(-100vh) scale(0.6) rotate(360deg); opacity: 0; }
        }
        .animate-spin-slow {
          animation: spinLace 12s linear infinite;
        }
        @keyframes spinLace {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .luxury-panel-glow {
          box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(232, 199, 183, 0.25);
        }
        .luxury-gradient-btn {
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .luxury-gradient-btn:hover {
          background-position: right center !important;
          transform: translateY(-2px);
          box-shadow: 0 15px 30px rgba(183, 110, 121, 0.3);
        }
        .luxury-gradient-btn:active {
          transform: translateY(1px);
        }
        .shimmer-line {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
          transform: translateX(-100%);
        }
        .luxury-gradient-btn:hover .shimmer-line {
          animation: triggerSweep 1.3s ease-in-out infinite;
        }
        @keyframes triggerSweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-fade-in {
          animation: basicFadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-in-quick {
          animation: basicFadeInQuick 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes basicFadeIn {
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes basicFadeInQuick {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

    </div>
  );
}

export default Cart;