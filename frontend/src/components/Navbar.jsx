import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, Search, Menu, X, User, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import staticLogo from '../assets/logo.png';

const MotionLink = motion(Link);

function Navbar() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const { getCartCount } = useCart();
    const { wishlistCount } = useWishlist();
    const { isAuthenticated } = useAuth();
    const { settings } = useSettings();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/collections?search=${encodeURIComponent(searchQuery.trim())}`);
            setIsSearchOpen(false);
            setSearchQuery("");
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Get store name or default to "P&D"
    const storeName = settings.general?.storeName || "P&D";
    const logoUrl = settings.general?.logo?.url || staticLogo;

    return (
        <>
            {/* Main Navigation Bar */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`fixed top-0 left-0 right-0 z-50 max-w-full overflow-x-hidden transition-all duration-500 ${scrolled
                    ? 'bg-white/60 backdrop-blur-xl shadow-md py-4'
                    : 'bg-[#faf8f5]/90 backdrop-blur-md py-5 border-b border-gray-100/20'
                    }`}
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <motion.div
                            initial="initial"
                            whileHover="hover"
                            className="flex items-center"
                        >
                            <Link
                                to="/"
                                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                                className="flex items-center gap-2"
                            >
                                <motion.img
                                    src={logoUrl}
                                    alt={storeName}
                                    className="h-15 w-auto object-contain"
                                    variants={{
                                        initial: { rotate: 0 },
                                        hover: {
                                            rotate: 360,
                                            transition: {
                                                duration: 0.8,
                                                ease: "easeInOut",
                                            },
                                        },
                                    }}
                                    onError={(e) => {
                                        // Fallback to static logo if the settings logo fails
                                        e.target.src = staticLogo;
                                    }}
                                />

                                <div className="flex flex-col">
                                    <h1
                                        className="font-serif tracking-wider"
                                        style={{
                                            fontSize: "clamp(1.2rem, 4vw, 1.5rem)",
                                            fontWeight: 700,
                                            background: "linear-gradient(135deg, #B76E79 0%, #D4AF37 100%)",
                                            WebkitBackgroundClip: "text",
                                            WebkitTextFillColor: "transparent",
                                        }}
                                    >
                                        {storeName}
                                    </h1>

                                    {!storeName.toLowerCase().includes("jewel") && (
                                        <h1
                                            className="font-serif tracking-wider"
                                            style={{
                                                fontSize: "clamp(1rem, 2vw, 1rem)",
                                                fontWeight: 700,
                                                background: "linear-gradient(135deg, #B76E79 0%, #D4AF37 100%)",
                                                WebkitBackgroundClip: "text",
                                                WebkitTextFillColor: "transparent",
                                            }}
                                        >
                                            Luxury Jewellery
                                        </h1>
                                    )}
                                </div>
                            </Link>
                        </motion.div>

                        {/* Desktop Menu */}
                        <div className="hidden lg:flex items-center space-x-10">
                            {[
                                { name: "Collections", path: "/collections" },
                                { name: "New Arrivals", path: "/new-arrivals" },
                                { name: "Bridal", path: "/collections?occasion=wedding" },
                                { name: "About", path: "/about" },
                            ].map((item) => (
                                <MotionLink
                                    key={item.name}
                                    to={item.path}
                                    className="relative text-[#2C2C2C] font-medium tracking-wide transition-colors hover:text-[#B76E79] group"
                                    whileHover={{ y: -2 }}
                                >
                                    {item.name}
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#B76E79] to-[#D4AF37] transition-all duration-300 group-hover:w-full" />
                                </MotionLink>
                            ))}
                        </div>

                        {/* Navigation Icons */}
                        <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6">
                            {/* Dynamic Search/Close Icon Button */}
                            <button
                                onClick={() => setIsSearchOpen(!isSearchOpen)}
                                className={`transition-colors p-1 rounded-full ${isSearchOpen ? 'text-[#B76E79]' : 'text-[#2C2C2C] hover:text-[#B76E79]'}`}
                                aria-label="Toggle Search"
                            >
                                {isSearchOpen ? <X className="w-5 cursor-pointer h-5" /> : <Search className="w-5 cursor-pointer h-5" />}
                            </button>

                            {/* Profile Icon (Now visible on all screens) */}
                            <MotionLink
                                to={isAuthenticated ? "/profile" : "/login"}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="text-[#2C2C2C] hover:text-[#B76E79] transition-colors p-1"
                                aria-label={isAuthenticated ? "Account" : "Login"}
                            >
                                <User className="w-5 h-5" />
                            </MotionLink>

                            {/* Wishlist Icon */}
                            <MotionLink
                                to="/profile#wishlist"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="text-[#2C2C2C] hover:text-[#B76E79] transition-colors relative p-1"
                                aria-label="Wishlist"
                            >
                                <Heart className="w-5 h-5" />
                                {wishlistCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#B76E79] text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                                        {wishlistCount}
                                    </span>
                                )}
                            </MotionLink>

                            {/* Cart/Shopping Bag Icon */}
                            <MotionLink
                                to="/cart"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="text-[#2C2C2C] hover:text-[#B76E79] transition-colors relative p-1"
                                aria-label="Shopping bag"
                            >
                                <ShoppingBag className="w-5 h-5" />
                                {getCartCount() > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#B76E79] text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                                        {getCartCount()}
                                    </span>
                                )}
                            </MotionLink>

                            {/* Mobile Hamburger Toggle */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="lg:hidden text-[#2C2C2C] p-1 focus:outline-none"
                                aria-label="Menu"
                            >
                                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu Dropdown */}
                    <AnimatePresence>
                        {mobileMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="lg:hidden mt-4 pb-4 space-y-2 border-t border-gray-100 pt-3"
                            >
                                {[
                                    { name: "Collections", path: "/collections" },
                                    { name: "New Arrivals", path: "/new-arrivals" },
                                    { name: "Bridal", path: "/bridal" },
                                    { name: "About", path: "/about" },
                                ].map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        className="block text-[#2C2C2C] font-medium py-2 px-1 hover:text-[#B76E79] transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.nav>

            {/* Seamless Slide-Down Search Overlay Context */}
            <AnimatePresence>
                {isSearchOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: "-100%" }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: "-100%" }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className={`fixed left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-xl transition-all duration-500 ${scrolled ? 'top-[68px]' : 'top-[77px]'}`}
                    >
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-4xl w-full">
                            {/* Input Form Section */}
                            <form onSubmit={handleSearch} className="relative group w-full mb-8">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Search for jewelry, materials, or collections..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-transparent border-b border-gray-200 py-4 pr-14 pl-2 text-xl sm:text-2xl font-bold outline-none focus:border-[#B76E79] transition-colors duration-300 placeholder:text-gray-300 text-gray-800"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full text-gray-400 hover:bg-gray-50 group-focus-within:text-[#B76E79] transition-all duration-200"
                                    aria-label="Submit search"
                                >
                                    <ArrowRight className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

export default Navbar;