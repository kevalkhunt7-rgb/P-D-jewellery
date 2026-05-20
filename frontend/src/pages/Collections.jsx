import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
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

// Dynamic integration using your strict data layer specs
import { premiumProducts } from '../components/data';
import { ProductCard } from '../components/ProductCard';// Preserving your intact component logic

// Luxury Category Pill Metadata Matrix
const CATEGORIES = [
  { id: 'all', name: 'All Collections' },
  { id: 'necklaces', name: 'Necklaces' },
  { id: 'rings', name: 'Rings' },
  { id: 'earrings', name: 'Earrings' },
  { id: 'bangles', name: 'Bangles & Bracelets' },
  { id: 'bridal', name: 'The Bridal Vault' }
];

const PRICE_RANGES = [
  { id: 'all', name: 'All Valuations' },
  { id: 'under-2500', name: 'Under $2,500', min: 0, max: 2500 },
  { id: '2500-5000', name: '$2,500 – $5,000', min: 2500, max: 5000 },
  { id: '5000-10000', name: '$5,000 – $10,000', min: 5000, max: 10000 },
  { id: 'above-10000', name: 'Above $10,000', min: 10000, max: Infinity }
];

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
  // --- UI Layout and Interaction States ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [visibleCount, setVisibleCount] = useState(8); // Initially stream 8 premium elements
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  // --- Dynamic Matrix Filtering Processing Engine ---
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...premiumProducts];

    // 1. Text Search Evaluation Query
    if (searchQuery.trim() !== '') {
      const target = searchQuery.toLowerCase();
      result = result.filter(
        p => p.title?.toLowerCase().includes(target) || 
             p.subtitle?.toLowerCase().includes(target) ||
             p.category?.toLowerCase().includes(target)
      );
    }

    // 2. High-Tier Category Segmenting
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase());
    }

    // 3. Financial Valuations Filtering Layer
    if (selectedPriceRange !== 'all') {
      const activeRange = PRICE_RANGES.find(r => r.id === selectedPriceRange);
      if (activeRange) {
        result = result.filter(p => p.price >= activeRange.min && p.price <= activeRange.max);
      }
    }

    // 4. Luxury Sorting Matrix Sorting Schemes
    switch (sortBy) {
      case 'newest':
        // Safe check for item metadata or sequential indexing
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
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
  }, [searchQuery, selectedCategory, selectedPriceRange, sortBy]);

  // --- Load More / Pagination Controllers ---
  const streamedProducts = useMemo(() => {
    return filteredAndSortedProducts.slice(0, visibleCount);
  }, [filteredAndSortedProducts, visibleCount]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedPriceRange('all');
    setSortBy('featured');
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
      
      {/* Absolute Ambient Background Aura Orbs */}
      <div className="absolute top-[-10%] left-[-20%] w-[60vw] h-[60vw] bg-gradient-to-tr from-[#FFF0EB] to-[#E8C7B7]/10 rounded-full blur-[140px] pointer-events-none mix-blend-multiply" />
      <div className="absolute top-[30%] right-[-10%] w-[50vw] h-[50vw] bg-gradient-to-bl from-[#F7E7CE]/10 to-[#FFF0EB] rounded-full blur-[160px] pointer-events-none" />

      {/* ==========================================
          LUXURY HERO BANNER & BREADCRUMBS
          ========================================== */}
      <section className="relative pt-20 pb-16 text-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Fine Art Breadcrumb Trail */}
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
          <div className="w-16 h-[1px] bg-[#B76E79] mx-auto my-6" />
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-xs sm:text-sm font-light text-stone-500 leading-relaxed tracking-wide max-w-xl mx-auto"
          >
            Immerse yourself in exceptional craftsmanship. Discover timeless 18k and 24k gold, signature rose tones, and diamonds curated down to the microscopic setting.
          </motion.p>
        </div>
      </section>

      {/* ==========================================
          DYNAMIC PILL INTERFACE ROW (Trending Selection Strip)
          ========================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex items-center justify-start lg:justify-center gap-3 overflow-x-auto pb-4 pt-1 no-scrollbar mask-image-horizontal">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.id); setVisibleCount(8); }}
                className={`px-6 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest whitespace-nowrap border transition-all duration-500 ${
                  isSelected 
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

      {/* ==========================================
          STICKY CODES TOP CONTROL BOARD
          ========================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 sticky top-0 z-30">
        <div className="bg-white/70 backdrop-blur-xl border border-stone-200/60 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-lg shadow-stone-950/5">
          
          {/* Left Element Counter Segment */}
          <div className="text-xs tracking-wider text-stone-500 font-light flex items-center gap-2">
            <Grid className="w-4 h-4 text-[#B76E79]/80 stroke-[1.5]" />
            Showing <span className="font-semibold text-stone-900">{filteredAndSortedProducts.length}</span> Sovereign Pieces
          </div>

          {/* Right Controls Interacting Core */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            
            {/* Search Core Pipeline Field */}
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search vaults..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(8); }}
                className="w-full bg-white border border-stone-200/80 rounded-full pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-[#B76E79] focus:ring-1 focus:ring-[#B76E79]/20 tracking-wide transition-all"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-stone-400 hover:text-stone-900">
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

            {/* Premium Sophisticated Sort Custom Select Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                className="flex items-center gap-2 px-5 py-2 bg-white border border-stone-200/80 rounded-full text-xs font-bold tracking-wider text-stone-700 hover:text-stone-950 focus:outline-none transition-all"
              >
                <span className="text-stone-400 font-light uppercase tracking-widest text-[10px]">Sort:</span>
                <span>{sortLabelMap[sortBy]}</span>
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
                            setSortBy(key);
                            setIsSortDropdownOpen(false);
                            setVisibleCount(8);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-xs tracking-wide transition-colors flex items-center justify-between ${
                            sortBy === key 
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

      {/* ==========================================
          FILTER SIDEBAR & MAIN PRODUCT MATRIX GRID
          ========================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* DESKTOP PERMANENT FILTER SIDEBAR NODE */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-28 space-y-8 bg-white/40 backdrop-blur-xl border border-stone-200/40 rounded-2xl p-6 shadow-sm">
            
            {/* Header Reset Node */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-200/60">
              <h3 className="font-serif text-lg tracking-wide text-stone-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#D4AF37]" /> Filter Atelier
              </h3>
              {(selectedCategory !== 'all' || selectedPriceRange !== 'all') && (
                <button 
                  onClick={handleResetFilters}
                  className="text-[10px] font-bold tracking-widest text-[#B76E79] uppercase hover:text-stone-950 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            {/* Price Selection Domain Section */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-stone-400">Valuation Tier</h4>
              <div className="space-y-2.5">
                {PRICE_RANGES.map((range) => {
                  const isChecked = selectedPriceRange === range.id;
                  return (
                    <label 
                      key={range.id} 
                      className="flex items-center gap-3 group cursor-pointer text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        isChecked 
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

            {/* Static Luxury Certificate Tag Panel */}
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
              {streamedProducts.length === 0 ? (
                
                // LUXURY EMPTY OUTCOME VIEW LAYOUT
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
                    Our current vault ledgers do not match the specified constraints. Broaden your search filters to expose remaining options.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-[#FDF8F3] text-[10px] font-bold uppercase tracking-[0.2em] rounded-full transition-all"
                  >
                    Reset Filter Parameters
                  </button>
                </motion.div>

              ) : (

                // MAIN GRID RENDER BLOCK WITH SCROLL STAGGER HOOKS
                <div className="space-y-16" key="products-content">
                  <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-x-6 gap-y-10"
                  >
                    {streamedProducts.map((product) => (
                      <motion.div key={product.id} variants={cardItemVariants} className="h-full">
                        {/* UNCHANGED INTACT INHERITED SYSTEM PROP HOOK */}
                        <ProductCard {...product} />
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* HIGH-END INTERACTIVE LOAD MORE MECHANISM CONTROLLER */}
                  {filteredAndSortedProducts.length > visibleCount && (
                    <div className="text-center pt-4">
                      <motion.button
                        whileHover={{ scale: 1.02, boxShadow: '0 10px 25px -5px rgba(183, 110, 121, 0.15)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setVisibleCount(prev => prev + 4)}
                        className="px-10 py-4 relative group rounded-full text-[11px] font-bold uppercase tracking-[0.25em] bg-white border border-stone-200/80 text-stone-800 transition-all duration-300"
                      >
                        {/* Elegant Shimmer Inner Overlay Glow */}
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

      {/* ==========================================
          MOBILE OVERLAY FILTERS DRAWER COMPONENT
          ========================================== */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            {/* Dark Mask Shield Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 bg-black z-50 backdrop-blur-3xs"
            />
            
            {/* Sliding Drawer Architecture Sheet */}
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

              {/* Mobile Drawer Form Configurations */}
              <div className="space-y-8 flex-1">
                {/* Categories Component Mapping Drawer Section */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-stone-400">Collections</h4>
                  <div className="flex flex-col gap-1.5">
                    {CATEGORIES.map((cat) => {
                      const isSelected = selectedCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => { setSelectedCategory(cat.id); setVisibleCount(8); }}
                          className={`text-left py-2 px-3 text-xs rounded-lg transition-colors flex items-center justify-between ${
                            isSelected ? 'bg-white text-[#B76E79] font-bold shadow-3xs' : 'text-stone-600 hover:bg-stone-100/50'
                          }`}
                        >
                          <span>{cat.name}</span>
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
                    {PRICE_RANGES.map((range) => {
                      const isChecked = selectedPriceRange === range.id;
                      return (
                        <label key={range.id} className="flex items-center gap-3 text-xs font-medium text-stone-600">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                            isChecked ? 'border-[#B76E79] bg-[#B76E79] text-white' : 'border-stone-300 bg-white'
                          }`}>
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <input
                            type="radio"
                            name="mobilePrice"
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
              </div>

              {/* Lower Overlay Execution Action Nodes */}
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

      {/* STICKY FLOATING MOBILE FILTER INVOKER (Visible only during scrolling viewports) */}
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