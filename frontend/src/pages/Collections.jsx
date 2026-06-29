import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  SlidersHorizontal,
  Search,
  ChevronDown,
  X,
  Grid,
  Sparkles,
  RotateCcw,
  Sliders,
  Check
} from 'lucide-react';

// Dynamic integration using global product context
import { useProducts } from '../context/ProductContext';
import { ProductCard } from '../components/ProductCard';
import { useSettings } from '../context/SettingsContext';

// Luxury Category Pill Metadata Matrix
const CATEGORIES = [
  { id: 'all', name: 'All Collections' },
  { id: 'neckleces', name: 'Necklaces' },
  { id: 'ring', name: 'Rings' },
  { id: 'earrings', name: 'Earrings' },
  { id: 'bangle', name: 'Bangles' },
  
];



const OCCASIONS = [
  { id: 'all', name: 'All Occasions' },
  { id: 'wedding', name: 'Wedding' },
  { id: 'party', name: 'Party' },
  { id: 'casual', name: 'Casual' },
  { id: 'festive', name: 'Festive' },
  { id: 'daily wear', name: 'Daily Wear' }
];

const GENDERS = [
  { id: 'all', name: 'All Genders' },
  { id: 'male', name: 'Men' },
  { id: 'female', name: 'Women' },
  { id: 'unisex', name: 'Unisex' }
];

const sortLabelMap = {
  featured: 'Curated Masterpieces',
  newest: 'Recent Additions',
  'price-low': 'Value: Low to High',
  'price-high': 'Value: High to Low'
};

// Framer Motion Fine-Art Animations
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

export default function CollectionsPage() {
  // 🌟 FIX: Pulling filteredProducts and searchProducts directly from your context file
  const { filteredProducts, loading, searchProducts } = useProducts();
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
  const location = useLocation();
  const navigate = useNavigate();

  // --- Parse URL Parameters ---
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  
  const searchQuery = queryParams.get('search') || '';
  const selectedCategory = queryParams.get('category')?.toLowerCase() || 'all';
  const selectedOccasion = queryParams.get('occasion')?.toLowerCase() || 'all';
  const selectedPriceRange = queryParams.get('price')?.toLowerCase() || 'all';
  const selectedGender = queryParams.get('gender')?.toLowerCase() || 'all';
  const sortBy = queryParams.get('sort')?.toLowerCase() || 'featured';

  // --- UI Layout and Interaction States ---
  const [visibleCount, setVisibleCount] = useState(8);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  // --- Pipeline to sync local user actions to URL ---
  const updateUrlParams = (key, value) => {
    const params = new URLSearchParams(location.search);
    if (!value || value === 'all' || value === '') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    setVisibleCount(8); // Always reset grid pagination limits on filter changes
    navigate({ search: params.toString() }, { replace: true });
  };

  // --- 🌟 FETCH PRODUCTS FROM MONGO BACKEND VIA ATLAS SEARCH INDEX ---
  useEffect(() => {
    searchProducts(searchQuery);
  }, [searchQuery, searchProducts]);

  // --- Dynamic Matrix Filtering Processing Engine ---
  const displayedProducts = useMemo(() => {
    // 🌟 Start directly from the context's search result array
    let result = [...(filteredProducts || [])];

    // 1. High-Tier Category Segmenting
    if (selectedCategory !== 'all') {
      result = result.filter(p => 
        p.category?.toLowerCase() === selectedCategory
      );
    }

    // 2. Occasion Segmenting
    if (selectedOccasion !== 'all') {
      result = result.filter(p => {
        if (Array.isArray(p.occasion)) {
          return p.occasion.some(occ => occ.toLowerCase() === selectedOccasion);
        }
        return p.occasion?.toLowerCase() === selectedOccasion;
      });
    }

    // 3. Gender Segmenting
    if (selectedGender !== 'all') {
      result = result.filter(p => p.gender?.toLowerCase() === selectedGender);
    }

    // 4. Financial Valuations Filtering Layer
    if (selectedPriceRange !== 'all') {
      const activeRange = priceRanges.find(r => r.id === selectedPriceRange);
      if (activeRange) {
        result = result.filter(p => p.price >= activeRange.min && p.price <= activeRange.max);
      }
    }

    // 4. Luxury Sorting Matrix Schemes
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
        // 🌟 If running an active search query, sort strictly by Atlas Search ranking scores
        if (searchQuery) {
          result.sort((a, b) => (b.searchScore || 0) - (a.searchScore || 0));
        } else {
          result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        }
        break;
    }

    return result;
  }, [filteredProducts, searchQuery, selectedCategory, selectedOccasion, selectedPriceRange, selectedGender, sortBy]);

  // --- Load More / Pagination Controllers ---
  const streamedProducts = useMemo(() => {
    return displayedProducts.slice(0, visibleCount);
  }, [displayedProducts, visibleCount]);

  const handleResetFilters = () => {
    setVisibleCount(8);
    navigate({ search: '' });
  };

  return (
    <div className="min-h-screen bg-[#FDF8F3] text-stone-900 font-sans antialiased selection:bg-[#E8C7B7]/30 pb-24 relative overflow-x-hidden">

      {/* Absolute Ambient Background Aura Orbs */}
      <div className="absolute top-[-10%] left-[-20%] w-[60vw] h-[60vw] bg-gradient-to-tr from-[#FFF0EB] to-[#E8C7B7]/10 rounded-full blur-[140px] pointer-events-none mix-blend-multiply" />
      <div className="absolute top-[30%] right-[-10%] w-[50vw] h-[50vw] bg-gradient-to-bl from-[#F7E7CE]/10 to-[#FFF0EB] rounded-full blur-[160px] pointer-events-none" />

      {/* LUXURY HERO BANNER & BREADCRUMBS */}
      <section className="relative pt-20 pb-16 text-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <nav className="text-[10px] tracking-[0.25em] uppercase font-bold text-stone-400 mb-6 flex items-center justify-center gap-2">
          <Link to="/" className="hover:text-[#B76E79] transition-colors">Home</Link>
          <span className="text-stone-300">/</span>
          <span className="text-stone-800 tracking-widest">Collections</span>
        </nav>

        <div className="max-w-2xl mx-auto space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif text-4xl sm:text-5xl lg:text-6xl tracking-wide font-light text-stone-900"
          >
            The Atelier Collection
          </motion.h1>
        </div>
      </section>

      {/* DYNAMIC PILL INTERFACE ROW - GENDER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex items-center justify-start lg:justify-center gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar mask-image-horizontal">
          {GENDERS.map((g) => {
            const isSelected = selectedGender === g.id;
            return (
              <button
                key={g.id}
                onClick={() => updateUrlParams('gender', g.id)}
                className={`px-6 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest whitespace-nowrap border transition-all duration-500 ${isSelected
                  ? 'bg-[#B76E79] text-[#FDF8F3] border-[#B76E79] shadow-md scale-105'
                  : 'bg-white/80 text-stone-500 border-stone-200/60 hover:text-stone-900 hover:border-stone-400 backdrop-blur-3xs'
                }`}
              >
                {g.name}
              </button>
            );
          })}
        </div>
      </section>

      {/* DYNAMIC PILL INTERFACE ROW - CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex items-center justify-start lg:justify-center gap-3 overflow-x-auto pb-4 pt-1 no-scrollbar mask-image-horizontal">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => updateUrlParams('category', cat.id)}
                className={`px-6 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest whitespace-nowrap border transition-all duration-500 ${isSelected
                  ? 'bg-stone-950 text-[#FDF8F3] border-stone-950 shadow-md scale-105'
                  : 'bg-white/80 text-stone-500 border-stone-200/60 hover:text-stone-900 hover:border-stone-400 backdrop-blur-3xs'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </section>

      {/* STICKY CODES TOP CONTROL BOARD */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 sticky top-0 z-30">
        <div className="bg-white/70 backdrop-blur-xl border border-stone-200/60 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-lg shadow-stone-950/5">

          {/* Left Element Counter Segment */}
          <div className="text-xs tracking-wider text-stone-500 font-light flex items-center gap-2">
            <Grid className="w-4 h-4 text-[#B76E79]/80 stroke-[1.5]" />
            Showing <span className="font-semibold text-stone-900">{displayedProducts.length}</span> Sovereign Pieces
          </div>

          {/* Right Controls Interacting Core */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">

            {/* Search Core Pipeline Field */}
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search vaults..."
                value={searchQuery}
                onChange={(e) => updateUrlParams('search', e.target.value)}
                className="w-full bg-white border border-stone-200/80 rounded-full pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-[#B76E79] focus:ring-1 focus:ring-[#B76E79]/20 tracking-wide transition-all"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
              {searchQuery && (
                <button onClick={() => updateUrlParams('search', '')} className="absolute right-3 top-3 text-stone-400 hover:text-stone-900">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Mobile Filter Invoke Trigger Button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-stone-200/80 rounded-full text-xs font-bold tracking-wider uppercase text-stone-700 hover:text-stone-950 transition-all"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
            </button>

            {/* Premium Sophisticated Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                className="flex items-center gap-2 px-5 py-2 bg-white border border-stone-200/80 rounded-full text-xs font-bold tracking-wider text-stone-700 hover:text-stone-950 focus:outline-none transition-all"
              >
                <span className="text-stone-400 font-light uppercase tracking-widest text-[10px]">Sort:</span>
                <span>{sortLabelMap[sortBy] || sortLabelMap.featured}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-300 ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
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
                            updateUrlParams('sort', key);
                            setIsSortDropdownOpen(false);
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

      {/* FILTER SIDEBAR & MAIN PRODUCT MATRIX GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* DESKTOP PERMANENT FILTER SIDEBAR NODE */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-28 space-y-8 bg-white/40 backdrop-blur-xl border border-stone-200/40 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200/60">
              <h3 className="font-serif text-lg tracking-wide text-stone-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#D4AF37]" /> Filter Atelier
              </h3>
              {(selectedCategory !== 'all' || selectedOccasion !== 'all' || selectedPriceRange !== 'all' || selectedGender !== 'all' || searchQuery !== '') && (
                <button
                  onClick={handleResetFilters}
                  className="text-[10px] font-bold tracking-widest text-[#B76E79] uppercase hover:text-stone-950 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            {/* Gender Selection Section */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-stone-400">Gender</h4>
              <div className="space-y-2.5">
                {GENDERS.map((g) => {
                  const isChecked = selectedGender === g.id;
                  return (
                    <label
                      key={g.id}
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
                        name="desktopGender"
                        checked={isChecked}
                        onChange={() => updateUrlParams('gender', g.id)}
                        className="sr-only"
                      />
                      <span>{g.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Occasion Selection Section */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-stone-400">Occasion</h4>
              <div className="space-y-2.5">
                {OCCASIONS.map((occ) => {
                  const isChecked = selectedOccasion === occ.id;
                  return (
                    <label
                      key={occ.id}
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
                        name="desktopOccasion"
                        checked={isChecked}
                        onChange={() => updateUrlParams('occasion', occ.id)}
                        className="sr-only"
                      />
                      <span>{occ.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Price Selection Domain Section */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-stone-400">Valuation Tier</h4>
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
                        onChange={() => updateUrlParams('price', range.id)}
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
              <p className="text-[10px] text-stone-400 font-light leading-relaxed">
                Every inclusion variant from the Atelier collection ships with full GIA grading certification card keys.
              </p>
            </div>
          </aside>

          {/* DYNAMIC FLEXIBLE CONTAINER GRID PANEL */}
          <div className="col-span-1 lg:col-span-9">
            <AnimatePresence mode="wait">
              {loading ? (
                <div className="text-center py-24 text-stone-500 font-medium tracking-widest animate-pulse">
                  LOADING ATELIER VAULTS...
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
                  <h3 className="font-serif text-2xl font-light tracking-wide text-stone-900 mb-2">No Pieces Found</h3>
                  <p className="text-stone-500 text-xs font-light max-w-xs mx-auto leading-relaxed mb-8">
                    Our current vault ledgers do not match the specified criteria. Broaden your search text or clear filters to locate remaining options.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-[#FDF8F3] text-[10px] font-bold uppercase tracking-[0.2em] rounded-full transition-all"
                  >
                    Reset Filter Parameters
                  </button>
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
                        {/* 🌟 Spreading fields natively cleanly */}
                        <ProductCard {...product} />
                      </motion.div>
                    ))}
                  </motion.div>

                  {displayedProducts.length > visibleCount && (
                    <div className="text-center pt-4">
                      <motion.button
                        whileHover={{ scale: 1.02, boxShadow: '0 10px 25px -5px rgba(183, 110, 121, 0.15)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setVisibleCount(prev => prev + 4)}
                        className="px-10 py-4 relative group rounded-full text-[11px] font-bold uppercase tracking-[0.25em] bg-white border border-stone-200/80 text-stone-800 transition-all duration-300"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-[#FFF0EB]/0 via-[#FFF0EB]/40 to-[#FFF0EB]/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out rounded-full" />
                        <span className="relative z-10 group-hover:text-[#B76E79] transition-colors">
                          Load More Masterpieces
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

      {/* MOBILE OVERLAY FILTERS DRAWER COMPONENT */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 bg-black z-50 backdrop-blur-3xs"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-xs bg-[#FDF8F3] shadow-2xl z-50 overflow-y-auto p-6 flex flex-col"
            >
              <div className="flex items-center justify-between pb-4 border-b border-stone-200/80 mb-6">
                <h3 className="font-serif text-xl font-medium tracking-wide">Filter Suite</h3>
                <button onClick={() => setIsMobileFilterOpen(false)} className="text-stone-400 hover:text-stone-900 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-8 flex-1">
                {/* Collections Component Mapping Drawer Section */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-stone-400">Collections</h4>
                  <div className="flex flex-col gap-1.5">
                    {CATEGORIES.map((cat) => {
                      const isSelected = selectedCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => updateUrlParams('category', cat.id)}
                          className={`text-left py-2 px-3 text-xs rounded-lg transition-colors flex items-center justify-between ${isSelected ? 'bg-white text-[#B76E79] font-bold shadow-3xs' : 'text-stone-600 hover:bg-stone-100/50'
                            }`}
                        >
                          <span>{cat.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Gender Section */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-stone-400">Gender</h4>
                  <div className="flex flex-col gap-1.5">
                    {GENDERS.map((g) => {
                      const isSelected = selectedGender === g.id;
                      return (
                        <button
                          key={g.id}
                          onClick={() => updateUrlParams('gender', g.id)}
                          className={`text-left py-2 px-3 text-xs rounded-lg transition-colors flex items-center justify-between ${isSelected ? 'bg-white text-[#B76E79] font-bold shadow-3xs' : 'text-stone-600 hover:bg-stone-100/50'
                            }`}
                        >
                          <span>{g.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile Occasion Section */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-stone-400">Occasion</h4>
                  <div className="flex flex-col gap-1.5">
                    {OCCASIONS.map((occ) => {
                      const isSelected = selectedOccasion === occ.id;
                      return (
                        <button
                          key={occ.id}
                          onClick={() => updateUrlParams('occasion', occ.id)}
                          className={`text-left py-2 px-3 text-xs rounded-lg transition-colors flex items-center justify-between ${isSelected ? 'bg-white text-[#B76E79] font-bold shadow-3xs' : 'text-stone-600 hover:bg-stone-100/50'
                            }`}
                        >
                          <span>{occ.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Price Range Target Components Map */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-stone-400">Valuations</h4>
                  <div className="space-y-2.5">
                    {priceRanges.map((range) => {
                      const isChecked = selectedPriceRange === range.id;
                      return (
                        <label key={range.id} className="flex items-center gap-3 text-xs font-medium text-stone-600 cursor-pointer">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isChecked ? 'border-[#B76E79] bg-[#B76E79] text-white' : 'border-stone-300 bg-white'
                            }`}>
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <input
                            type="radio"
                            name="mobilePrice"
                            checked={isChecked}
                            onChange={() => updateUrlParams('price', range.id)}
                            className="sr-only"
                          />
                          <span>{range.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-stone-200/80 mt-auto space-y-3">
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full py-3.5 bg-stone-900 text-[#FDF8F3] text-xs font-bold uppercase tracking-[0.2em] rounded-full text-center shadow-md shadow-stone-950/10"
                >
                  Apply Filter Suite
                </button>
                <button
                  onClick={() => { handleResetFilters(); setIsMobileFilterOpen(false); }}
                  className="w-full py-3.5 bg-transparent border border-stone-200 text-stone-500 hover:text-stone-900 text-xs font-bold uppercase tracking-[0.2em] rounded-full text-center"
                >
                  Clear System Criteria
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* STICKY FLOATING MOBILE FILTER INVOKER */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 lg:hidden">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsMobileFilterOpen(true)}
          className="flex items-center gap-2.5 px-6 py-3.5 bg-stone-900 text-[#FDF8F3] rounded-full shadow-xl text-xs font-bold tracking-[0.2em] uppercase"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#D4AF37]" />
          <span>Refine Masterpieces</span>
        </motion.button>
      </div>

    </div>
  );
}