import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Tilt from 'react-parallax-tilt'; 
import {
    Heart,
    ShoppingBag,
    Star,
    Sparkles,
    Truck,
    ShieldCheck,
    RefreshCw,
    Plus,
    Minus,
    ChevronRight
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useParams, Link } from 'react-router-dom';

// IMPORT DATA
import { useProducts } from '../context/ProductContext';
import { ProductReviews } from '../components/ProductReviews';
import { RelatedProducts } from '../components/RelatedProducts';

const SpecItem = ({ label, value, unit = "" }) => {
    if (
        value === undefined ||
        value === null ||
        (typeof value === 'string' && value.trim() === "") ||
        value === "N/A"
    ) {
        return null;
    }

    return (
        <div className="bg-stone-50/60 p-3 rounded-xl border border-stone-200/30 space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                {label}
            </p>
            <p className="text-sm font-semibold text-stone-800">
                {value}{unit ? ` ${unit}` : ""}
            </p>
        </div>
    );
};

const SpecRow = ({ label, value }) => {
    if (
        value === undefined ||
        value === null ||
        (typeof value === 'string' && value.trim() === "") ||
        value === "N/A"
    ) {
        return null;
    }

    return (
        <div className="flex justify-between gap-4 text-sm py-1">
            <span className="text-stone-500">{label}</span>
            <span className="font-medium text-stone-800 text-right">{value}</span>
        </div>
    );
};

function ProductDetailPage({ product }) {
    // 1. Swapped 'id' out for 'slug' to read clean URLs like /product/diamond-gold-ring
    const { slug } = useParams();
    const { products, loading } = useProducts();

    // 2. UPDATED DYNAMIC PRODUCT FETCH: Look up matching string records primarily by product slug
    const currentProductRaw =
        product ||
        products.find((p) => String(p.slug) === String(slug) || String(p.id) === String(slug) || String(p._id) === String(slug));

    // NORMALIZATION LAYER
    const currentProduct = currentProductRaw ? {
        ...currentProductRaw,
        title: currentProductRaw.title || currentProductRaw.name || "Atelier Piece",
        category: currentProductRaw.category || "Exclusive Collection",
        price: currentProductRaw.price || 0,
        originalPrice: currentProductRaw.originalPrice ?? undefined,
        rating: currentProductRaw.rating || currentProductRaw.ratings || 0,
        reviewsCount: currentProductRaw.reviewsCount ?? currentProductRaw.reviewCount ?? currentProductRaw.numOfReviews ?? currentProductRaw.rating?.count ?? 0,
        description: currentProductRaw.description || currentProductRaw.shortDesc || "",
        metalType: currentProductRaw.details?.material ?? undefined,
        purity: currentProductRaw.details?.purity ?? undefined, 
        metalColor: currentProductRaw.details?.color ?? undefined,
        warranty: currentProductRaw.details?.warranty ?? undefined,
        packaging: currentProductRaw.details?.packaging ?? undefined,
        dimensions: currentProductRaw.details?.dimensions ?? undefined,
        grossWeight: currentProductRaw.details?.weight ?? undefined, 
        netWeight: currentProductRaw.details?.netWeight ?? undefined,
        diamondWeight: currentProductRaw.details?.diamondWeight ?? undefined,
        diamondPieces: currentProductRaw.details?.stones ?? undefined, 
        buybackEligibility: currentProductRaw.buybackEligibility ?? undefined,
        makingCharges: currentProductRaw.makingCharges ?? currentProductRaw.details?.makingCharges ?? undefined,
        gst: currentProductRaw.gst ?? currentProductRaw.details?.gst ?? undefined,
        occasion: Array.isArray(currentProductRaw.occasion) 
            ? currentProductRaw.occasion.join(', ') 
            : typeof currentProductRaw.occasion === 'string'
                ? currentProductRaw.occasion.replace(/([A-Z])/g, ' $1').trim().split(', ').join(', ')
                : undefined
    } : null;

    const { addToCart, cart } = useCart();
    const { wishlist, toggleWishlist, addToWishlist, removeFromWishlist } = useWishlist();

    const [activeImageIdx, setActiveImageIdx] = useState(0);
    const [selectedFinish, setSelectedFinish] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [is360Mode, setIs360Mode] = useState(false);

    const [zoomStyle, setZoomStyle] = useState({ display: 'none' });
    const imgRef = useRef(null);
    const [glowStyle, setGlowStyle] = useState({ opacity: 0 });

    const isAlreadyInCart = currentProduct ? cart.some((item) => item.id === currentProduct._id || item.id === currentProduct.id) : false;
    const isWishlisted = currentProduct && wishlist ? wishlist.some((item) => item.id === currentProduct._id || item.id === currentProduct.id) : false;

    const activeDisplayImage = currentProduct ? (
        (currentProduct.images && currentProduct.images[activeImageIdx]) || 
        currentProduct.image || 
        "https://via.placeholder.com/600x750?text=No+Image+Available"
    ) : "";

    const handleMouseMove = (e) => {
        if (!imgRef.current) return;
        const target = imgRef.current;
        const rect = target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const xPercent = (x / rect.width) * 100;
        const yPercent = (y / rect.height) * 100;

        setZoomStyle({
            display: 'block',
            left: `${x}px`,
            top: `${y}px`,
            backgroundImage: `url(${activeDisplayImage})`,
            backgroundPosition: `${xPercent}% ${yPercent}%`,
            backgroundSize: '220%',
            transform: 'translate(-50%, -50%)'
        });
    };

    const handleMouseLeave = () => {
        setZoomStyle({ display: 'none' });
    };

    const handleGlowMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setGlowStyle({
            opacity: 1,
            background: `radial-gradient(circle 240px at ${x}px ${y}px, rgba(183, 110, 121, 0.15), transparent 80%)`
        });
    };

    const handleGlowLeave = () => {
        setGlowStyle({ opacity: 0 });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-stone-400 text-xs font-semibold tracking-[0.2em] bg-stone-50 animate-pulse">
                LOADING ATELIER PIECE...
            </div>
        );
    }

    if (!currentProduct) {
        return (
            <div className="min-h-screen flex items-center justify-center text-stone-500 text-xs font-semibold tracking-[0.2em] bg-stone-50">
                ATELIER PIECE NOT FOUND
            </div>
        );
    }

    const handleAddToBasket = () => {
        if (isAlreadyInCart) return;
        const activeFinishData = currentProduct.finishes?.[selectedFinish] || null;
        addToCart({ ...currentProduct, id: currentProduct._id || currentProduct.id, image: activeDisplayImage }, quantity, activeFinishData);
    };

    const handleWishlistToggle = () => {
        const normalizedItem = { ...currentProduct, id: currentProduct._id || currentProduct.id };
        if (toggleWishlist) {
            toggleWishlist(normalizedItem);
        } else {
            if (isWishlisted) {
                removeFromWishlist(normalizedItem.id);
            } else {
                addToWishlist(normalizedItem);
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#faf9f6] text-stone-800 font-sans overflow-x-hidden selection:bg-[#B76E79]/20 relative">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-[#FFF0EB] to-[#E8C7B7]/20 rounded-full blur-[120px] pointer-events-none mix-blend-multiply" />
            <div className="absolute top-[25%] right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[#F7E7CE]/10 to-[#FFF0EB]/40 rounded-full blur-[140px] pointer-events-none" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-12 pt-28 pb-6 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-stone-400 flex items-center gap-2 flex-wrap">
                <Link to="/" className="hover:text-[#B76E79] transition-colors duration-300">Atelier</Link>
                <ChevronRight className="w-3 h-3 stroke-[1.5]" />
                <span className="hover:text-[#B76E79] cursor-pointer transition-colors duration-300">Collections</span>
                <ChevronRight className="w-3 h-3 stroke-[1.5]" />
                <span className="text-stone-700 font-medium">{currentProduct.title}</span>
            </div>

            {/* Main Grid */}
            <main className="container mx-auto px-4 sm:px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pb-24 relative z-10 items-start">
                
                {/* FIXED LEFT COLUMN */}
                <div className="lg:col-span-7 lg:sticky lg:top-28 flex flex-col-reverse md:flex-row gap-5">
                    
                    {/* Thumbnails Deck */}
                    {currentProduct.images && currentProduct.images.length > 1 && (
                        <div className="flex md:flex-col flex-row gap-3 overflow-x-auto md:overflow-x-visible justify-start py-1 md:py-0 no-scrollbar">
                            {currentProduct.images.map((img, idx) => {
                                const thumbnailUrl = img?.url || img;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => { setActiveImageIdx(idx); setIs360Mode(false); }}
                                        className={`w-20 h-24 md:w-22 md:h-26 rounded-2xl overflow-hidden border bg-white transition-all duration-300 relative group flex-shrink-0 p-1.5 shadow-sm ${activeImageIdx === idx && !is360Mode ? 'border-[#B76E79] ring-4 ring-[#B76E79]/5 scale-102 shadow-md' : 'border-stone-200/70 hover:border-stone-400'}`}
                                    >
                                        <img src={thumbnailUrl} alt="" className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105" />
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Main Showcase Frame */}
                    <div className="flex-1 relative bg-white rounded-[2.5rem] border border-stone-200/50 shadow-xl shadow-stone-200/20 overflow-hidden group aspect-[4/5] w-full max-h-[640px] flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            {!is360Mode ? (
                                <motion.div 
                                    key={activeImageIdx} 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }} 
                                    exit={{ opacity: 0 }} 
                                    transition={{ duration: 0.4 }} 
                                    className="w-full h-full relative cursor-zoom-in overflow-hidden" 
                                    onMouseMove={handleMouseMove} 
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <img ref={imgRef} src={activeDisplayImage} alt={currentProduct.title} className="w-full h-full object-cover pointer-events-none" />
                                    <div className="absolute hidden lg:block w-48 h-48 rounded-full border border-white/30 shadow-[0_20px_40px_rgba(0,0,0,0.25)] pointer-events-none ring-4 ring-stone-900/5" style={zoomStyle} />
                                </motion.div>
                            ) : (
                                <motion.div key="360" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full relative overflow-hidden bg-gradient-to-b from-stone-50 to-white">
                                    <Tilt perspective={1200} glareEnable={false} tiltMaxAngleX={10} tiltMaxAngleY={10} scale={1.01} gyroscope={true} transitionSpeed={1200} className="w-full h-full p-8 flex flex-col items-center justify-center relative preserve-3d" onMouseMove={handleGlowMove} onMouseLeave={handleGlowLeave}>
                                        <div className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-30 mix-blend-screen" style={glowStyle} />
                                        <img src={activeDisplayImage} alt="" className="w-4/5 h-auto object-contain mix-blend-darken transform-3d select-none pointer-events-none drop-shadow-[0_25px_35px_rgba(0,0,0,0.08)]" style={{ transform: 'translateZ(50px)' }} />
                                        <div className="absolute bottom-6 bg-stone-900/90 backdrop-blur-md text-[#FDF8F3] px-5 py-2.5 rounded-full text-[10px] font-bold tracking-[0.15em] shadow-md flex items-center gap-2 transform-3d pointer-events-none z-20" style={{ transform: 'translateZ(25px)' }}>
                                            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                                            <span>MOVE MOUSE OVER CANVAS TO INSPECT</span>
                                        </div>
                                    </Tilt>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
                    <div className="space-y-6">
                        
                        <div className="space-y-2">
                            <p className="text-[11px] font-bold tracking-[0.25em] text-[#B76E79] uppercase">
                                {currentProduct.category}
                            </p>
                            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 leading-[1.2]">
                                {currentProduct.title}
                            </h1>
                        </div>

                        <div className="flex items-center justify-between border-b border-stone-200/60 pb-5">
                            <div className="flex items-baseline gap-3">
                                <span className="font-serif text-3xl font-medium tracking-tight text-stone-900">
                                    ₹{currentProduct.price.toLocaleString('en-IN')}
                                </span>
                                {currentProduct.originalPrice && currentProduct.originalPrice > currentProduct.price && (
                                    <>
                                        <span className="text-sm line-through text-stone-400">
                                            ₹{currentProduct.originalPrice.toLocaleString('en-IN')}
                                        </span>
                                        <span className="text-[10px] font-bold text-[#B76E79] bg-[#FFF0EB] px-2.5 py-1 rounded-lg tracking-widest">
                                            {Math.round(((currentProduct.originalPrice - currentProduct.price) / currentProduct.originalPrice) * 100)}% OFF
                                        </span>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-stone-200/50 shadow-sm">
                                <div className="flex text-amber-400">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-3 h-3 ${i < Math.round(currentProduct.rating || 0) ? 'fill-current' : 'text-stone-200 fill-stone-200'}`} />
                                    ))}
                                </div>
                                <span className="text-[11px] font-bold text-stone-500 tracking-wider">
                                    ({currentProduct.reviewsCount})
                                </span>
                            </div>
                        </div>

                        <p className="text-sm text-stone-600 leading-relaxed font-normal whitespace-pre-line">
                            {currentProduct.description}
                        </p>

                        <div className="flex items-center gap-4 pt-2">
                            <div className="space-y-1.5">
                                <span className="text-[10px] font-bold tracking-widest text-stone-400 uppercase block">QTY</span>
                                <div className="flex items-center bg-white border border-stone-200/60 rounded-full p-1 shadow-sm">
                                    <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-stone-50 text-stone-600 transition-colors">
                                        <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="w-8 text-center text-xs font-bold text-stone-800">{quantity}</span>
                                    <button onClick={() => setQuantity((q) => q + 1)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-stone-50 text-stone-600 transition-colors">
                                        <Plus className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 space-y-1.5">
                                <span className="text-[10px] font-bold tracking-widest text-stone-400 uppercase block">Save To Box</span>
                                <button onClick={handleWishlistToggle} className={`w-full h-10 rounded-full border text-[11px] font-bold tracking-[0.15em] transition-all duration-300 flex items-center justify-center gap-2 ${isWishlisted ? 'bg-rose-50/50 border-rose-200 text-[#B76E79] shadow-sm' : 'bg-white border-stone-200 text-stone-600 hover:border-stone-400 shadow-sm'}`}>
                                    <Heart className={`w-3.5 h-3.5 transition-transform duration-300 ${isWishlisted ? 'fill-current text-[#B76E79] scale-105' : 'text-stone-400'}`} />
                                    <span>{isWishlisted ? 'ADDED TO ATELIER BOX' : 'ADD TO WISHLIST'}</span>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <motion.button 
                                onClick={handleAddToBasket} 
                                disabled={isAlreadyInCart} 
                                whileHover={isAlreadyInCart ? {} : { y: -1 }} 
                                whileTap={isAlreadyInCart ? {} : { scale: 0.99 }} 
                                className={`w-full text-white font-bold text-[11px] tracking-[0.2em] py-4 rounded-full shadow-lg transition-all duration-500 flex items-center justify-center gap-2.5 ${isAlreadyInCart ? 'bg-stone-400 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-[#E8C7B7] via-[#B76E79] to-[#E8C7B7] hover:opacity-95 shadow-[#B76E79]/20'}`}
                            >
                                <ShoppingBag className="w-4 h-4 stroke-[2]" />
                                <span>{isAlreadyInCart ? 'PRODUCT ALREADY IN CART' : 'ADD TO SHOPPING CART'}</span>
                            </motion.button>
                        </div>

                        {/* Specifications Area */}
                        <div className="bg-white rounded-[2rem] border border-stone-200/50 p-6 shadow-sm space-y-6">
                            <div>
                                <h3 className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#B76E79] mb-4">
                                    Jewellery Specifications
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <SpecItem label="Metal Type" value={currentProduct.metalType} />
                                    <SpecItem label="Purity" value={currentProduct.purity} />
                                    <SpecItem label="Metal Color" value={currentProduct.metalColor} />
                                    <SpecItem label="Gross Weight" value={currentProduct.grossWeight} unit="g" />
                                    <SpecItem label="Net Weight" value={currentProduct.netWeight} unit="g" />
                                    <SpecItem label="Occasion" value={currentProduct.occasion} />
                                    <SpecItem label="Warranty" value={currentProduct.warranty} />
                                    <SpecItem 
                                        label="Buyback" 
                                        value={currentProduct.buybackEligibility !== undefined && currentProduct.buybackEligibility !== null ? (currentProduct.buybackEligibility ? "Available" : "Not Available") : undefined} 
                                    />
                                    {currentProduct.diamondWeight > 0 && (
                                        <SpecItem label="Diamond Weight" value={currentProduct.diamondWeight} unit="ct" />
                                    )}
                                </div>
                            </div>

                            {/* Certification Section */}
                            {(currentProduct.bisHallmarkNumber || currentProduct.certificateDetails) && (
                                <div className="border-t border-stone-100 pt-5">
                                    <h3 className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#B76E79] mb-3">
                                        Certification & Authenticity
                                    </h3>
                                    <div className="bg-stone-50/70 rounded-2xl p-4 border border-stone-200/40 space-y-2">
                                        <div className="flex items-center gap-2 pb-1">
                                            <ShieldCheck className="w-4 h-4 text-amber-500" />
                                            <span className="text-xs font-bold text-stone-700">BIS Hallmarked Jewellery</span>
                                        </div>
                                        <SpecRow label="Hallmark Number" value={currentProduct.bisHallmarkNumber} />
                                        <SpecRow label="Certificate Detail" value={currentProduct.certificateDetails} />
                                    </div>
                                </div>
                            )}

                            {/* Price Breakdown Module */}
                            <div className="border-t border-stone-100 pt-5">
                                <h3 className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#B76E79] mb-3">
                                    Price Breakdown
                                </h3>
                                <div className="bg-stone-50/70 rounded-2xl p-4 border border-stone-200/40 space-y-2">
                                    <SpecRow label="Making Charges" value={currentProduct.makingCharges !== undefined ? `₹${currentProduct.makingCharges}` : undefined} />
                                    <SpecRow label="GST" value={currentProduct.gst !== undefined ? `${currentProduct.gst}%` : undefined} />
                                    <div className="border-t border-stone-200/60 pt-2 mt-1 flex justify-between font-bold text-base text-stone-900">
                                        <span>Final Price</span>
                                        <span>₹{currentProduct.price.toLocaleString('en-IN')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Trust badging footer */}
                    <div className="grid grid-cols-3 gap-2 bg-white rounded-2xl p-3.5 border border-stone-200/40 text-center shadow-sm">
                        <div className="flex flex-col items-center justify-center p-1 gap-1.5">
                            <Truck className="w-4 h-4 text-[#B76E79]" />
                            <span className="text-[9px] font-bold tracking-wider uppercase text-stone-600 leading-tight">Free Insured Delivery</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-1 gap-1.5 border-x border-stone-200/60">
                            <ShieldCheck className="w-4 h-4 text-[#B76E79]" />
                            <span className="text-[9px] font-bold tracking-wider uppercase text-stone-600 leading-tight">Lifetime Guarantee</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-1 gap-1.5">
                            <RefreshCw className="w-4 h-4 text-[#B76E79]" />
                            <span className="text-[9px] font-bold tracking-wider uppercase text-stone-600 leading-tight">30-Day Exchange</span>
                        </div>
                    </div>
                </div>
            </main>

            <div className="container mx-auto px-4 sm:px-6 lg:px-12 pb-24">
                <ProductReviews productId={currentProduct._id || currentProduct.id} />
            </div>
            <RelatedProducts currentProduct={currentProduct} />
        </div>
    );
}

export default ProductDetailPage;