import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Search,
  ChevronDown,
  X,
  Grid,
  Sparkles,
  RotateCcw,
  Check
} from 'lucide-react';

import { useProducts } from '../context/ProductContext';
import { ProductCard } from '../components/ProductCard';
import { useSettings } from '../context/SettingsContext';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 }
  }
};

const cardItemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
};

export default function NewArrivalsPage() {
  const { products, loading } = useProducts();
  const { settings } = useSettings();
  const currencySymbol = settings?.general?.currencySymbol || '₹';
  const currency = settings?.general?.currency || 'INR';

  const priceRanges = useMemo(() => {
    if (currency === 'USD') {
      return [
        { id: 'all', name: 'All Valuations' },
        { id: 'under-2500', name: 'Under $50', min: 0, max: 50 },
        { id: '2500-5000', name: '$50 – $100', min: 50, max: 100 },
        { id: '5000-10000', name: '$100 – $200', min: 100, max: 200 },
        { id: 'above-10000', name: 'Above $200', min: 200, max: Infinity }
      ];
    }
    return [
      { id: 'all', name: 'All Valuations' },
      { id: 'under-2500', name: 'Under ₹2,500', min: 0, max: 2500 },
      { id: '2500-5000', name: '₹2,500 – ₹5,000', min: 2500, max: 5000 },
      { id: '5000-10000', name: '₹5,000 – ₹10,000', min: 5000, max: 10000 },
      { id: 'above-10000', name: 'Above ₹10,000', min: 10000, max: Infinity }
    ];
  }, [currency]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [visibleCount, setVisibleCount] = useState(8);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  const hasNewArrivals = useMemo(() => {
    return (products || []).some(p => 
      p.isNew || 
      (p.tags && Array.isArray(p.tags) && 
       p.tags.some(tag => tag.toLowerCase().includes('new arrival')))
    );
  }, [products]);

  const filteredAndSortedProducts = useMemo(() => {
    const baseProducts = products || [];
    let newArrivals = baseProducts.filter(p => {
      const isNewArrival = p.isNew || 
        (p.tags && Array.isArray(p.tags) && 
         p.tags.some(tag => tag.toLowerCase().includes('new arrival')));
      return isNewArrival;
    });

    let result = newArrivals.length > 0 ? newArrivals : [...baseProducts];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        (p.title || p.name || "").toLowerCase().includes(query) || 
        (p.description || "").toLowerCase().includes(query)
      );
    }

    if (selectedPriceRange !== 'all') {
      const activeRange = priceRanges.find(r => r.id === selectedPriceRange);
      if (activeRange) {
        result = result.filter(p => p.price >= activeRange.min && p.price <= activeRange.max);
      }
    }

    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    return result;
  }, [searchQuery, selectedPriceRange, sortBy, products]);

  const streamedProducts = useMemo(() => {
    return filteredAndSortedProducts.slice(0, visibleCount);
  }, [filteredAndSortedProducts, visibleCount]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedPriceRange('all');
    setSortBy('newest');
    setVisibleCount(8);
  };

  const sortLabelMap = {
    featured: 'Curated Masterpieces',
    newest: 'Recent Additions',
    'price-low': 'Value: Low to High',
    'price-high': 'Value: High to Low'
  };

  return (
    <div className="min-h-screen bg-[#FDF8F3] text-stone-900 font-sans antialiased selection:bg-[#E8C7B7]/30 pb-24 relative overflow-x-hidden">
      
      <div className="absolute top-[-10%] left-[-20%] w-[60vw] h-[60vw] bg-gradient-to-tr from-[#FFF0EB] to-[#E8C7B7]/10 rounded-full blur-[140px] pointer-events-none mix-blend-multiply" />
      <div className="absolute top-[30%] right-[-10%] w-[50vw] h-[50vw] bg-gradient-to-bl from-[#F7E7CE]/10 to-[#FFF0EB] rounded-full blur-[160px] pointer-events-none" />

      <section className="relative pt-20 pb-16 text-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <nav className="text-[10px] tracking-[0.25em] uppercase font-bold text-stone-800 mb-6 flex items-center justify-center gap-2">
          <Link to="/" className="hover:text-[#B76E79] transition-colors">Home</Link>
          <span className="text-stone-300">/</span>
          <span className="text-stone-800 tracking-widest">New Arrivals</span>
        </nav>

        <div className="max-w-2xl mx-auto space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif text-4xl sm:text-5xl lg:text-6xl tracking-wide font-bold text-stone-900"
          >
            New Arrivals
          </motion.h1>
          <p className="text-stone-500 text-sm max-w-md mx-auto">
            {hasNewArrivals ? "Discover our latest additions, fresh from the atelier." : "Discover our curated collection from the atelier."}
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 sticky top-0 z-30">
        <div className="bg-white/70 backdrop-blur-xl border border-stone-200/60 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-lg shadow-stone-950/5">

          <div className="text-xs tracking-wider text-stone-500 font-bold flex items-center gap-2">
            <Grid className="w-4 h-4 text-[#B76E79]/80 stroke-[1.5]" />
            Showing <span className="font-semibold text-stone-900">{filteredAndSortedProducts.length}</span> {hasNewArrivals ? "New Pieces" : "Pieces"}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">

            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search new arrivals..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(8); }}
                className="w-full bg-white border border-stone-200/80 rounded-full pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-[#B76E79] focus:ring-1 focus:ring-[#B76E79]/20 tracking-wide transition-all"
              />
              <Search className="w-3.5 h-3.5 text-stone-800 absolute left-3 top-3" />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-stone-800 hover:text-stone-900">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                className="flex items-center gap-2 px-5 py-2 bg-white border border-stone-200/80 rounded-full text-xs font-bold tracking-wider text-stone-700 hover:text-stone-950 focus:outline-none transition-all"
              >
                <span className="text-stone-800 font-bold uppercase tracking-widest text-[10px]">Sort:</span>
                <span>{sortLabelMap[sortBy]}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-stone-800 transition-transform duration-300 ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isSortDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsSortDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 bg-white border border-stone-200/80 rounded-xl shadow-xl z-20 overflow-hidden py-1"
                    >
                      {Object.keys(sortLabelMap).map((key) => (
                        <button
                          key={key}
                          onClick={() => {
                            setSortBy(key);
                            setIsSortDropdownOpen(false);
                            setVisibleCount(8);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-xs tracking-wide transition-colors flex items-center justify-between ${sortBy === key
                            ? 'bg-[#FFF0EB]/50 text-[#B76E79] font-semibold'
                            : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                            }`}
                        >
                          <span>{sortLabelMap[key]}</span>
                          {sortBy === key && <Check className="w-3.5 h-3.5 text-[#B76E79]" />}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          <aside className="hidden lg:block lg:col-span-3 sticky top-28 space-y-8 bg-white/40 backdrop-blur-xl border border-stone-200/40 rounded-2xl p-6 shadow-sm">

            <div className="flex items-center justify-between pb-4 border-b border-stone-200/60">
              <h3 className="font-serif text-lg tracking-wide text-stone-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" /> Filter
              </h3>
              {selectedPriceRange !== 'all' && (
                <button
                  onClick={handleResetFilters}
                  className="text-[10px] font-bold tracking-widest text-[#B76E79] uppercase hover:text-stone-950 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-stone-800">Valuation Tier</h4>
              <div className="space-y-2.5">
                {priceRanges.map((range) => {
                  const isChecked = selectedPriceRange === range.id;
                  return (
                    <label
                      key={range.id}
                      className="flex items-center gap-3 group cursor-pointer text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isChecked
                        ? 'border-[#B76E79] bg-[#B76E79] text-white shadow-3xs'
                        : 'border-stone-300 bg-white group-hover:border-stone-400'
                        }`}>
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <input
                        type="radio"
                        name="desktopPrice"
                        checked={isChecked}
                        onChange={() => { setSelectedPriceRange(range.id); setVisibleCount(8); }}
                        className="sr-only"
                      />
                      <span>{range.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="pt-6 border-t border-stone-200/60 space-y-3">
              <div className="flex items-center gap-2 text-xs font-medium text-stone-700">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>100% Certified Conflict-Free</span>
              </div>
              <p className="text-[10px] text-stone-800 font-bold leading-relaxed">
                Every new arrival ships with full certification of authenticity.
              </p>
            </div>
          </aside>

          <div className="col-span-1 lg:col-span-9">
            <AnimatePresence mode="wait">
              {loading ? (
                <div className="text-center py-24 text-stone-500 font-medium tracking-widest animate-pulse">
                  LOADING NEW ARRIVALS...
                </div>
              ) : streamedProducts.length === 0 ? (

                <motion.div
                  key="empty-state"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-24 bg-white/60 backdrop-blur-xl border border-stone-200/60 rounded-2xl max-w-xl mx-auto px-6 shadow-sm"
                >
                  <Sparkles className="w-10 h-10 text-[#D4AF37]/50 mx-auto mb-4 stroke-[1.2]" />
                  <h3 className="font-serif text-2xl font-bold tracking-wide text-stone-900 mb-2">No New Arrivals Yet</h3>
                  <p className="text-stone-500 text-xs font-bold max-w-xs mx-auto leading-relaxed mb-8">
                    Check back soon—our atelier is always crafting new pieces!
                  </p>
                  <Link
                    to="/collections"
                    className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-[#FDF8F3] text-[10px] font-bold uppercase tracking-[0.2em] rounded-full transition-all inline-block"
                  >
                    Browse All Collections
                  </Link>
                </motion.div>

              ) : (

                <div className="space-y-16" key="products-content">
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-10"
                  >
                    {streamedProducts.map((product) => (
                      <motion.div key={product.id} variants={cardItemVariants} className="h-full">
                        <ProductCard {...product} />
                      </motion.div>
                    ))}
                  </motion.div>

                  {filteredAndSortedProducts.length > visibleCount && (
                    <div className="text-center pt-4">
                      <motion.button
                        whileHover={{ scale: 1.02, boxShadow: '0 10px 25px -5px rgba(183, 110, 121, 0.15)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setVisibleCount(prev => prev + 4)}
                        className="px-10 py-4 relative group rounded-full text-[11px] font-bold uppercase tracking-[0.25em] bg-white border border-stone-200/80 text-stone-800 transition-all duration-300"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-[#FFF0EB]/0 via-[#FFF0EB]/40 to-[#FFF0EB]/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out rounded-full" />
                        <span className="relative z-10 group-hover:text-[#B76E79] transition-colors">
                          Load More New Arrivals
                        </span>
                      </motion.button>
                    </div>
                  )}
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </section>

    </div>
  );
}
