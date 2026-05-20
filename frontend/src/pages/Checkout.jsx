import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext'; // Hooks directly into your global cart state
import {
  ShieldCheck,
  Truck,
  CreditCard,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  Lock,
  ArrowRight,
  ChevronRight,
  Award,
  RefreshCw,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  Compass,
  QrCode
} from 'lucide-react';

const SHIPPING_METHODS = [
  {
    id: 'standard',
    title: 'Standard Atelier Delivery',
    time: '3–5 Business Days',
    price: 0,
    desc: 'Complimentary signature white-box packaging.'
  },
  {
    id: 'express',
    title: 'Express Sovereign Courier',
    time: 'Next Business Day',
    price: 35,
    desc: 'Priority dispatch with precise time-slot tracking.'
  },
  {
    id: 'insured',
    title: 'Premium Insured Armored Delivery',
    time: 'Scheduled Priority',
    price: 95,
    desc: 'Hand-delivered via bonded courier with full valuation insurance.'
  }
];

const fadeInScale = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

export default function PremiumCheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 1. DYNAMIC SOURCE ROUTING (Context Bag OR direct single product state transfer)
  const { cart: contextCart, updateQuantity: contextUpdateQty, removeFromCart: contextRemoveItem, clearCart } = useCart();
  
  // Local fallback array state if passing temporary direct state from option 2
  const [directCart, setDirectCart] = useState(location.state?.customCart || null);
  
  // Unified pointer variable to safely evaluate whichever array contains active items
  const activeCart = directCart || contextCart || [];

  // View / Pipeline States
  const [currentStep, setCurrentStep] = useState('shipping'); // 'shipping' | 'payment' | 'complete'
  const [isLoading, setIsLoading] = useState(false);
  
  // Interactive Options States
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0); // Percent
  const [isPromoSuccess, setIsPromoSuccess] = useState(false);
  
  // Checkout Validation States
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', country: 'United States',
    city: '', state: '', zip: '', address: '',
    cardName: '', cardNumber: '', cardExpiry: '', cardCvv: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Dynamic Financial Ledger Computations
  const subtotal = activeCart.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
  const selectedShippingPrice = SHIPPING_METHODS.find(m => m.id === shippingMethod)?.price || 0;
  const discountAmount = subtotal * (appliedDiscount / 100);
  const luxuryTax = (subtotal - discountAmount) * 0.085; // 8.5% Base Tax Architecture
  const orderTotal = subtotal + selectedShippingPrice + luxuryTax - discountAmount;

  // Polymorphic Quantity Adjusters (Updates global context OR local fallback array state)
  const mutateQuantity = (id, delta) => {
    if (directCart) {
      setDirectCart(prev => prev.map(item => {
        if (item.id === id) {
          const nextQty = (item.quantity || 1) + delta;
          return nextQty > 0 ? { ...item, quantity: nextQty } : item;
        }
        return item;
      }).filter(Boolean));
    } else if (contextUpdateQty) {
      contextUpdateQty(id, delta);
    }
  };

  const removeProductItem = (id) => {
    if (directCart) {
      setDirectCart(prev => prev.filter(item => item.id !== id));
    } else if (contextRemoveItem) {
      contextRemoveItem(id);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateShippingForm = () => {
    const errors = {};
    const required = ['name', 'email', 'phone', 'city', 'state', 'zip', 'address'];
    required.forEach(field => {
      if (!formData[field].trim()) errors[field] = 'Required field';
    });
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePaymentForm = () => {
    const errors = {};
    if (paymentMethod === 'card') {
      const required = ['cardName', 'cardNumber', 'cardExpiry', 'cardCvv'];
      required.forEach(field => {
        if (!formData[field].trim()) errors[field] = 'Required';
      });
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (validateShippingForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setCurrentStep('payment');
    }
  };

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'ATELIER2026') {
      setAppliedDiscount(15);
      setIsPromoSuccess(true);
    } else {
      alert('Invalid Promo Code');
    }
  };

  const handleFinalPurchase = () => {
    if (!validatePaymentForm()) return;
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setCurrentStep('complete');
      if (clearCart && !directCart) clearCart(); // Clean out basket ledger upon purchase fulfillment
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 2500);
  };

  if (activeCart.length === 0 && currentStep !== 'complete') {
    return (
      <div className="min-h-screen bg-[#FDF8F3] text-[#2C2C2C] flex flex-col items-center justify-center p-6">
        <motion.div initial="hidden" animate="visible" variants={fadeInScale} className="text-center max-w-md">
          <div className="w-20 h-20 bg-white border border-stone-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <ShoppingBag className="w-8 h-8 text-[#B76E79]" />
          </div>
          <h1 className="font-serif text-3xl font-light tracking-wide text-stone-900 mb-3">Your Casket is Empty</h1>
          <p className="text-stone-500 text-sm font-light leading-relaxed mb-8">
            No masterpieces have been staged for checkout validation at this time.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="px-8 py-3.5 bg-stone-900 text-[#FDF8F3] text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:bg-stone-800 transition-all duration-300 shadow-md"
          >
            Return to Showroom
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F3] text-[#2C2C2C] font-sans antialiased pb-24 relative overflow-x-hidden selection:bg-[#E8C7B7]/30">
      
      {/* Structural Blur Ambient Orbs */}
      <div className="absolute top-0 left-[-10%] w-[50vw] h-[50vw] bg-gradient-to-tr from-[#FFF0EB] to-[#E8C7B7]/15 rounded-full blur-[140px] pointer-events-none mix-blend-multiply" />
      <div className="absolute top-[40%] right-[-10%] w-[45vw] h-[45vw] bg-gradient-to-bl from-[#F7E7CE]/10 to-[#FFF0EB] rounded-full blur-[160px] pointer-events-none" />

      {/* HEADER ARCHITECTURE */}
      <header className="pt-12 pb-8 border-b border-stone-200/60 bg-white/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <span className="font-serif text-2xl tracking-[0.3em] text-stone-900 font-semibold uppercase mb-2">ATELIER VAULT</span>
            <h1 className="font-serif text-base text-stone-500 tracking-[0.15em] uppercase font-light flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-[#D4AF37]" /> Secure Vault Checkout
            </h1>
            
            {/* Steps Tracking Component */}
            <div className="mt-8 flex items-center justify-center w-full max-w-lg text-[10px] sm:text-xs font-bold tracking-[0.2em] text-stone-400 uppercase">
              <div className="flex items-center text-[#B76E79]">
                <span>Bag</span>
                <ChevronRight className="w-4 h-4 mx-2 text-stone-300" />
              </div>
              <div className={`flex items-center ${currentStep === 'shipping' || currentStep === 'payment' ? 'text-stone-900' : 'text-stone-400'}`}>
                <span className={currentStep === 'shipping' ? 'underline underline-offset-8 decoration-[#B76E79] decoration-2' : ''}>Shipping</span>
                <ChevronRight className="w-4 h-4 mx-2 text-stone-300" />
              </div>
              <div className={`flex items-center ${currentStep === 'payment' ? 'text-stone-900' : 'text-stone-400'}`}>
                <span className={currentStep === 'payment' ? 'underline underline-offset-8 decoration-[#B76E79] decoration-2' : ''}>Payment</span>
                <ChevronRight className="w-4 h-4 mx-2 text-stone-300" />
              </div>
              <div className={`flex items-center ${currentStep === 'complete' ? 'text-[#D4AF37]' : 'text-stone-400'}`}>
                <span>Complete</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT WRAPPER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 relative z-10">
        <AnimatePresence mode="wait">
          {currentStep !== 'complete' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16 items-start" key="checkout-grid">
              
              {/* LEFT COLUMN: ACTIVE INTERACTIVE FORM PANEL */}
              <div className="lg:col-span-7 space-y-8">
                <AnimatePresence mode="wait">
                  
                  {/* STEP A: SHIPPING INFO MODULE */}
                  {currentStep === 'shipping' && (
                    <motion.div
                      key="shipping-step"
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, x: -30 }}
                      variants={fadeInScale}
                      className="bg-white/70 backdrop-blur-xl border border-stone-200/80 rounded-2xl p-6 sm:p-8 shadow-xl shadow-stone-200/40"
                    >
                      <h2 className="font-serif text-2xl tracking-wide text-stone-900 mb-1">Shipping Architecture</h2>
                      <p className="text-stone-400 text-xs font-light tracking-wide mb-8">Please detail the verified location for secure courier drop-off.</p>
                      
                      <form onSubmit={handleProceedToPayment} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <FloatingInput icon={<User />} label="Full Name" name="name" value={formData.name} error={formErrors.name} onChange={handleInputChange} />
                          <FloatingInput icon={<Mail />} label="Email Address" name="email" type="email" value={formData.email} error={formErrors.email} onChange={handleInputChange} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <FloatingInput icon={<Phone />} label="Phone Number" name="phone" type="tel" value={formData.phone} error={formErrors.phone} onChange={handleInputChange} />
                          <FloatingInput icon={<Globe />} label="Country" name="country" value={formData.country} error={formErrors.country} onChange={handleInputChange} disabled />
                        </div>

                        <FloatingInput icon={<MapPin />} label="Street Address" name="address" value={formData.address} error={formErrors.address} onChange={handleInputChange} />

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                          <div className="col-span-2 sm:col-span-1">
                            <FloatingInput icon={<Compass />} label="City" name="city" value={formData.city} error={formErrors.city} onChange={handleInputChange} />
                          </div>
                          <FloatingInput label="State" name="state" value={formData.state} error={formErrors.state} onChange={handleInputChange} />
                          <FloatingInput label="ZIP Code" name="zip" value={formData.zip} error={formErrors.zip} onChange={handleInputChange} />
                        </div>

                        {/* Delivery Track Selectors */}
                        <div className="pt-4 border-t border-stone-100">
                          <h3 className="text-xs font-bold tracking-[0.15em] uppercase text-stone-500 mb-4">Delivery Dispatch Formats</h3>
                          <div className="space-y-3">
                            {SHIPPING_METHODS.map((method) => {
                              const isSelected = shippingMethod === method.id;
                              return (
                                <label
                                  key={method.id}
                                  className={`block relative rounded-xl border p-4 cursor-pointer transition-all duration-300 ${
                                    isSelected ? 'border-[#B76E79] bg-[#FFF0EB]/30 shadow-sm' : 'border-stone-200/80 bg-white hover:border-[#B76E79]/50'
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3">
                                      <div className="mt-1 flex items-center justify-center">
                                        <input
                                          type="radio"
                                          name="shippingMethod"
                                          value={method.id}
                                          checked={isSelected}
                                          onChange={() => setShippingMethod(method.id)}
                                          className="sr-only"
                                        />
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${isSelected ? 'border-[#B76E79]' : 'border-stone-300'}`}>
                                          {isSelected && <div className="w-2 h-2 rounded-full bg-[#B76E79]" />}
                                        </div>
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold text-stone-900">{method.title}</p>
                                        <p className="text-xs text-stone-400 mt-0.5 font-light">{method.desc}</p>
                                        <span className="inline-block mt-2 text-[10px] font-bold tracking-widest text-[#B76E79] bg-white px-2.5 py-1 rounded-md border border-stone-100">
                                          {method.time}
                                        </span>
                                      </div>
                                    </div>
                                    <span className="font-serif text-sm font-medium text-stone-900">
                                      {method.price === 0 ? 'Complimentary' : `$${method.price}`}
                                    </span>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                          <button
                            type="submit"
                            className="group px-10 py-4 bg-stone-900 text-[#FDF8F3] text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:bg-stone-800 transition-all duration-300 flex items-center gap-3 shadow-lg"
                          >
                            <span>Proceed to Settlement</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}

                  {/* STEP B: SECURE PAYMENT GATE MODULE */}
                  {currentStep === 'payment' && (
                    <motion.div
                      key="payment-step"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      className="bg-white/70 backdrop-blur-xl border border-stone-200/80 rounded-2xl p-6 sm:p-8 shadow-xl shadow-stone-200/40"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <button
                          onClick={() => setCurrentStep('shipping')}
                          className="text-xs font-bold tracking-widest uppercase text-stone-400 hover:text-stone-900 transition-colors"
                        >
                          ← Return to Delivery
                        </button>
                        <span className="text-[10px] font-bold tracking-widest text-[#D4AF37] bg-stone-900 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                          <Lock className="w-3 h-3 fill-current" /> 256-BIT ENCRYPTION
                        </span>
                      </div>
                      
                      <h2 className="font-serif text-2xl tracking-wide text-stone-900 mb-6">Financial Settlement</h2>

                      {/* Payment Tabs Choice Row */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                        {['card', 'upi', 'paypal', 'cod'].map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => { setPaymentMethod(mode); setFormErrors({}); }}
                            className={`py-3.5 px-2 rounded-xl border text-[10px] font-bold tracking-widest uppercase flex flex-col items-center justify-center gap-2 transition-all ${
                              paymentMethod === mode
                                ? 'border-[#B76E79] bg-[#FFF0EB]/40 text-stone-900 shadow-3xs'
                                : 'border-stone-200/60 bg-white/80 text-stone-400 hover:text-stone-700 hover:border-stone-300'
                            }`}
                          >
                            {mode === 'card' && <CreditCard className="w-4 h-4" />}
                            {mode === 'upi' && <QrCode className="w-4 h-4" />}
                            {mode === 'paypal' && <span className="font-serif lowercase italic text-sm font-bold tracking-tighter">pp</span>}
                            {mode === 'cod' && <Truck className="w-4 h-4" />}
                            <span>{mode === 'card' ? 'Credit Card' : mode.toUpperCase()}</span>
                          </button>
                        ))}
                      </div>

                      {/* Render Strategy Frameworks Dependent on Payment Choice */}
                      <AnimatePresence mode="wait">
                        {paymentMethod === 'card' && (
                          <motion.div key="card-ui" initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
                            
                            {/* Visual Luxury Plastic Preview Mirror */}
                            <div className="relative w-full aspect-[1.78/1] max-w-[360px] mx-auto rounded-2xl p-6 text-white overflow-hidden shadow-xl border border-white/20 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950">
                              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.4),transparent)]" />
                              <div className="flex justify-between items-start">
                                <span className="font-serif text-xs tracking-[0.2em] opacity-60">SOVEREIGN ATELIER</span>
                                <span className="font-serif text-base italic tracking-tighter opacity-80">Premium Gold Tier</span>
                              </div>
                              <div className="mt-8">
                                <div className="w-10 h-7 bg-[#D4AF37]/20 border border-[#D4AF37]/30 rounded-md" />
                              </div>
                              <div className="mt-6 font-mono text-base tracking-[0.18em] text-white/90">
                                {formData.cardNumber || '•••• •••• •••• ••••'}
                              </div>
                              <div className="mt-auto pt-6 flex justify-between items-end">
                                <div className="max-w-[180px] truncate">
                                  <p className="text-[8px] tracking-[0.15em] uppercase opacity-40">Holder</p>
                                  <p className="text-[11px] font-medium uppercase tracking-wider truncate">
                                    {formData.cardName || 'YOUR FULL NAME'}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-[8px] tracking-[0.15em] uppercase opacity-40">Expires</p>
                                  <p className="font-mono text-xs">{formData.cardExpiry || 'MM/YY'}</p>
                                </div>
                              </div>
                            </div>

                            {/* Standard Card Entries fields */}
                            <div className="space-y-4 pt-4">
                              <FloatingInput icon={<User />} label="Cardholder Name" name="cardName" value={formData.cardName} error={formErrors.cardName} onChange={handleInputChange} />
                              <FloatingInput icon={<CreditCard />} label="Card Number" name="cardNumber" maxLength="19" placeholder="0000 0000 0000 0000" value={formData.cardNumber} error={formErrors.cardNumber} onChange={handleInputChange} />
                              <div className="grid grid-cols-2 gap-4">
                                <FloatingInput label="Expiry (MM/YY)" name="cardExpiry" maxLength="5" placeholder="MM/YY" value={formData.cardExpiry} error={formErrors.cardExpiry} onChange={handleInputChange} />
                                <FloatingInput label="CVV" name="cardCvv" type="password" maxLength="4" placeholder="•••" value={formData.cardCvv} error={formErrors.cardCvv} onChange={handleInputChange} />
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {paymentMethod === 'upi' && (
                          <motion.div key="upi-ui" initial="hidden" animate="visible" className="text-center py-6 space-y-4 bg-stone-50 rounded-xl border border-stone-200/50">
                            <div className="w-32 h-32 bg-white border border-stone-200 mx-auto rounded-lg flex items-center justify-center p-2 shadow-3xs">
                              <QrCode className="w-full h-full text-stone-800" />
                            </div>
                            <p className="text-xs font-light text-stone-500 max-w-xs mx-auto">
                              Secure dynamic QR code will generate instantly on demand. Scan with your premium banking application.
                            </p>
                          </motion.div>
                        )}

                        {paymentMethod !== 'card' && paymentMethod !== 'upi' && (
                          <motion.div key="fallback-ui" initial="hidden" animate="visible" className="text-center py-8 bg-stone-50 rounded-xl border border-stone-200">
                            <p className="text-xs font-light text-stone-600 max-w-xs mx-auto">
                              Standard external processing protocol parameters apply dynamically based on selection.
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Transaction Dispatch Buttons */}
                      <div className="mt-8 pt-6 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <p className="text-[11px] text-stone-400 font-light flex items-center gap-1.5 order-2 sm:order-1">
                          <ShieldCheck className="w-4 h-4 text-[#D4AF37]" /> Fully protected high-tier valuation safeguards active.
                        </p>
                        
                        <button
                          onClick={handleFinalPurchase}
                          disabled={isLoading}
                          className="order-1 sm:order-2 w-full sm:w-auto min-w-[240px] bg-gradient-to-r from-[#E8C7B7] via-[#B76E79] to-[#E8C7B7] text-white font-bold text-xs tracking-[0.2em] py-4 px-8 rounded-full shadow-lg shadow-[#B76E79]/20 hover:shadow-xl transition-all duration-500 disabled:opacity-50"
                          style={{ backgroundSize: '200% auto' }}
                        >
                          <AnimatePresence mode="wait">
                            {isLoading ? (
                              <motion.div key="loader" className="flex items-center justify-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>VERIFYING SECURE LEDGER...</span>
                              </motion.div>
                            ) : (
                              <motion.div key="text" className="flex items-center justify-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <ShoppingBag className="w-3.5 h-3.5" />
                                <span>COMPLETE SECURE PURCHASE</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </button>
                      </div>

                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* RIGHT COLUMN: STICKY ESCROW LEDGER SUMMARY CARD */}
              <div className="lg:col-span-5 lg:sticky lg:top-32 space-y-6">
                <div className="bg-white/60 backdrop-blur-xl border border-stone-200/60 rounded-2xl p-6 shadow-xl shadow-stone-200/30">
                  <h2 className="font-serif text-lg tracking-wide text-stone-900 pb-4 border-b border-stone-100 mb-4">
                    Your Selection Vault ({activeCart.reduce((a, c) => a + (c.quantity || 1), 0)})
                  </h2>

                  {/* List Staged Products Map */}
                  <div className="divide-y divide-stone-100 max-h-[340px] overflow-y-auto pr-1 no-scrollbar">
                    {activeCart.map((item) => (
                      <div key={item.id} className="py-4 flex gap-4 first:pt-0 last:pb-0 group">
                        <div className="w-16 h-20 bg-stone-50 border border-stone-100 rounded-xl overflow-hidden flex-shrink-0">
                          <img src={item.image || item.images?.[0]} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <h3 className="text-xs font-semibold text-stone-900 leading-tight">{item.title}</h3>
                              <p className="text-[10px] text-stone-400 font-light mt-0.5">{item.subtitle || item.category || 'Atelier Edition'}</p>
                            </div>
                            <span className="font-serif text-xs font-medium text-stone-900">${item.price * (item.quantity || 1)}</span>
                          </div>
                          
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center bg-white border border-stone-200/60 rounded-full p-1 scale-90 origin-left shadow-3xs">
                              <button type="button" onClick={() => mutateQuantity(item.id, -1)} className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-stone-50 text-stone-500">
                                <Minus className="w-3" />
                              </button>
                              <span className="w-5 text-center text-[11px] font-semibold text-stone-800">{item.quantity || 1}</span>
                              <button type="button" onClick={() => mutateQuantity(item.id, 1)} className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-stone-50 text-stone-500">
                                <Plus className="w-3" />
                              </button>
                            </div>
                            <button 
                              type="button"
                              onClick={() => removeProductItem(item.id)}
                              className="text-[10px] font-bold tracking-widest text-stone-400 hover:text-red-600 transition-colors flex items-center gap-1 uppercase"
                            >
                              <Trash2 className="w-3 h-3" /> Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Promo Allocation Nodes */}
                  <div className="mt-6 pt-5 border-t border-stone-100">
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          placeholder="ATELIER CODE"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          disabled={isPromoSuccess}
                          className="w-full bg-white border border-stone-200 rounded-full px-4 py-2.5 text-xs font-bold tracking-widest uppercase placeholder-stone-300 focus:outline-none focus:border-[#B76E79] disabled:opacity-60"
                        />
                        {isPromoSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-3 top-3.5" />}
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        disabled={isPromoSuccess || !promoCode.trim()}
                        className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-[#FDF8F3] text-[10px] font-bold uppercase tracking-widest rounded-full transition-all disabled:opacity-40"
                      >
                        Apply
                      </button>
                    </div>
                    {isPromoSuccess && (
                      <p className="text-[10px] text-emerald-700 font-medium mt-1.5 pl-2 tracking-wide">
                        Atelier allocation verified successfully (15% Sovereign Discount).
                      </p>
                    )}
                  </div>

                  {/* Financial Balance Sheets Breakdowns */}
                  <div className="mt-6 pt-5 border-t border-stone-100 space-y-3 text-xs">
                    <div className="flex justify-between text-stone-500 font-light">
                      <span>Subtotal Registry</span>
                      <span className="font-serif">${subtotal.toLocaleString()}</span>
                    </div>
                    {appliedDiscount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-medium">
                        <span>Atelier Discount ({appliedDiscount}%)</span>
                        <span className="font-serif">-${discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-stone-500 font-light">
                      <span>Sovereign Courier Logistics</span>
                      <span className="font-serif">{selectedShippingPrice === 0 ? 'Complimentary' : `$${selectedShippingPrice}`}</span>
                    </div>
                    <div className="flex justify-between text-stone-500 font-light">
                      <span>Luxury Valuation Duties (8.5%)</span>
                      <span className="font-serif">${Math.round(luxuryTax).toLocaleString()}</span>
                    </div>
                    
                    {/* Master Grand Total Banner */}
                    <div className="pt-4 border-t border-stone-200 flex justify-between items-baseline">
                      <span className="text-xs font-bold uppercase tracking-[0.15em] text-stone-900">Total Escrow</span>
                      <span className="font-serif text-2xl font-semibold tracking-tight bg-gradient-to-r from-[#B76E79] to-[#D4AF37] bg-clip-text text-transparent">
                        ${Math.round(orderTotal).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Trust Metrics Subgrid Footer */}
                <div className="grid grid-cols-2 gap-3 bg-white/40 border border-stone-200/40 rounded-2xl p-4 text-center">
                  <div className="p-2 flex flex-col items-center gap-1 border-r border-b border-stone-200/40">
                    <Award className="w-4 h-4 text-[#D4AF37]" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-stone-700">Lifetime Warranty</span>
                  </div>
                  <div className="p-2 flex flex-col items-center gap-1 border-b border-stone-200/40">
                    <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-stone-700">Fully Insured Transit</span>
                  </div>
                  <div className="p-2 flex flex-col items-center gap-1 border-r border-stone-200/40">
                    <RefreshCw className="w-4 h-4 text-[#D4AF37]" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-stone-700">30-Day Exchange</span>
                  </div>
                  <div className="p-2 flex flex-col items-center gap-1">
                    <Lock className="w-4 h-4 text-[#D4AF37]" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-stone-700">Encrypted Ledger</span>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            
            // ==========================================
            // SUCCESSFUL TRANSACTION OUTCOME FULFILLMENT
            // ==========================================
            <motion.div key="complete-view" initial="hidden" animate="visible" variants={fadeInScale} className="max-w-xl mx-auto bg-white border border-stone-200 rounded-3xl p-8 sm:p-12 text-center shadow-xl shadow-stone-200/50">
              <div className="w-20 h-20 bg-[#FFF0EB] border border-[#E8C7B7]/40 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-[#B76E79] stroke-[1.5]" />
              </div>
              <h2 className="font-serif text-3xl font-light tracking-wide text-stone-900 mb-3">Vault Securement Successful</h2>
              <p className="text-stone-500 text-sm font-light leading-relaxed mb-1">Your premium luxury signature ledger configuration has been verified.</p>
              <p className="text-stone-400 text-xs font-mono mb-8">Transaction ID: TXN-{Math.floor(100000 + Math.random() * 900000)}</p>

              <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200/40 text-left space-y-3 mb-8">
                <div className="flex justify-between text-xs font-light text-stone-500">
                  <span>Authorized Courier</span>
                  <span className="font-medium text-stone-900">Bonded Atelier Carrier</span>
                </div>
                <div className="flex justify-between text-xs font-light text-stone-500">
                  <span>Destination Node</span>
                  <span className="font-medium text-stone-900 truncate max-w-[180px]">{formData.city || 'Verified Address Address'}, {formData.state || ''}</span>
                </div>
                <div className="flex justify-between text-xs font-light text-stone-500 pt-2 border-t border-stone-200/60">
                  <span className="font-semibold text-stone-900">Settled Valuation</span>
                  <span className="font-serif font-bold text-[#B76E79]">${Math.round(orderTotal).toLocaleString()}</span>
                </div>
              </div>

              <p className="text-xs text-stone-400 font-light mb-8">
                A verification receipt detailing real-time transit telemetry tracking coordinates has been routed to <span className="font-medium text-stone-700">{formData.email || 'your email'}</span>.
              </p>
              
              <button
                onClick={() => navigate('/')}
                className="w-full py-4 bg-stone-900 text-[#FDF8F3] text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:bg-stone-800 transition-colors shadow-lg"
              >
                Return to Showroom
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// PREMIUM FLOATING MULTI-ACTION INPUT COMPONENT
function FloatingInput({ icon, label, error, disabled, placeholder, maxLength, type = 'text', ...props }) {
  const [focused, setFocused] = useState(false);
  const hasValue = props.value && props.value.length > 0;

  return (
    <div className="relative w-full">
      <div 
        className={`relative flex items-center bg-white border rounded-xl transition-all duration-300 ${
          error ? 'border-red-300 ring-1 ring-red-50' : focused ? 'border-[#B76E79] ring-2 ring-[#B76E79]/5 shadow-3xs' : 'border-stone-200/80 hover:border-stone-300'
        } ${disabled ? 'bg-stone-50 opacity-70' : ''}`}
      >
        {icon && (
          <div className={`pl-4 text-stone-400 transition-colors duration-300 ${focused ? 'text-[#B76E79]' : ''}`}>
            {React.cloneElement(icon, { className: 'w-4 h-4 stroke-[1.5]' })}
          </div>
        )}
        
        <input
          type={type}
          disabled={disabled}
          maxLength={maxLength}
          placeholder={focused ? placeholder : ''}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full bg-transparent px-4 pb-2.5 pt-6 text-xs text-stone-900 font-medium tracking-wide focus:outline-none disabled:cursor-not-allowed"
          {...props}
        />

        <label 
          className={`absolute pointer-events-none transition-all duration-300 text-stone-400 font-light tracking-wide ${icon ? 'left-11' : 'left-4'} ${
            focused || hasValue ? 'top-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-[#B76E79]' : 'top-4 text-xs'
          }`}
        >
          {label}
        </label>
      </div>
      
      {error && <span className="text-[10px] font-medium text-red-600 pl-2 mt-1 block tracking-wide">{error}</span>}
    </div>
  );
}