import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, Search, Menu, X, User } from 'lucide-react';
import { Link } from 'react-router-dom';

// Create a custom framer-motion Link component to keep smooth animations
const MotionLink = motion(Link);

function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          
            className={`fixed top-0 left-0 right-0 z-50 max-w-full overflow-x-hidden transition-all duration-500 ${scrolled
                ? 'bg-white/90 backdrop-blur-xl shadow-lg py-4'
                : 'bg-[#faf8f5]/90 backdrop-blur-md py-3 border-b border-gray-100/20'
                }`}
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center"
                    >
                        <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                            <h1
                                className="font-serif tracking-wider"
                                style={{
                                    fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', // Responsive font size for logo
                                    fontWeight: 700,
                                    background: 'linear-gradient(135deg, #B76E79 0%, #D4AF37 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}
                            >
                                LUMIÈRE
                            </h1>
                        </Link>
                    </motion.div>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center space-x-10">
                        {[
                            { name: "Collections", path: "/collections" },
                            { name: "New Arrivals", path: "/new-arrivals" },
                            { name: "Bridal", path: "/bridal" },
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
                        {/* Search Icon */}
                        <MotionLink
                            to="/search"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-[#2C2C2C] hover:text-[#B76E79] transition-colors p-1"
                            aria-label="Search"
                        >
                            <Search className="w-5 h-5" />
                        </MotionLink>

                        {/* Profile Icon */}
                        <MotionLink
                            to="/profile"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-[#2C2C2C] hover:text-[#B76E79] transition-colors hidden md:block p-1"
                            aria-label="Account"
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
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#B76E79] text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                                2
                            </span>
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
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#B76E79] text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                                3
                            </span>
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
                {/* FIXED: Wrapped in AnimatePresence with strict height constraints to prevent page width snapping */}
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
    );
}

export default Navbar;