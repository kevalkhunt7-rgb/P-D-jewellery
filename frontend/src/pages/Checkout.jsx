
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  Check,
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

// Subtle custom sub-component for cleanly floating inputs
const FloatingInput = ({ icon, label, name, type = 'text', value, error, onChange, disabled }) => (
  <div className="relative w-full">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4 flex items-center justify-center">
      {icon}
    </div>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={label}
      className={`w-full bg-white/50 border ${error ? 'border-red-400 focus:border-red-500' : 'border-stone-200 focus:border-[#B76E79]'} rounded-xl py-3.5 pl-11 pr-4 text-xs font-medium focus:outline-none transition-all disabled:opacity-50`}
    />
    {error && <p className="text-[10px] text-red-500 mt-1 pl-2 font-medium">{error}</p>}
  </div>
);

export default function PremiumCheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { cart: contextCart, updateQuantity: contextUpdateQty, removeFromCart: contextRemoveItem, clearCart } = useCart();
  const [directCart, setDirectCart] = useState(location.state?.customCart || null);
  const activeCart = directCart || contextCart || [];

  const [currentStep, setCurrentStep] = useState('shipping'); 
  const [isLoading, setIsLoading] = useState(false);

  const [shippingMethod, setShippingMethod] = useState('standard');
  const [promoCode, setPromoCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isPromoLoading, setIsPromoLoading] = useState(false);

  // Snapshot configuration receipt to freeze financial states post-clearCart
  const [finalReceipt, setFinalReceipt] = useState(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    country: 'India',
    city: '', state: '', zip: '', address: ''
  });

  const [formErrors, setFormErrors] = useState({});

  const selectSavedAddress = (addr) => {
    setFormData(prev => ({
      ...prev,
      name: addr.fullName,
      phone: addr.phone,
      address: addr.addressLine,
      city: addr.city,
      state: addr.state,
      zip: addr.zipCode
    }));
    toast.success('Address applied');
  };

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name,
        email: user.email,
        phone: user.phone || ''
      }));
    }
  }, [user]);

  // Financial Ledger Computations with protective absolute zero limits
  const subtotal = activeCart.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
  const selectedShippingPrice = SHIPPING_METHODS.find(m => m.id === shippingMethod)?.price || 0;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const luxuryTax = Math.max(0, (subtotal - discountAmount) * 0.085);
  const orderTotal = Math.max(0, subtotal + selectedShippingPrice + luxuryTax - discountAmount);

  const mutateQuantity = (id, delta) => {
    if (directCart) {
      setDirectCart(prev => prev.map(item => {
        if (item.id === id) {
          const nextQty = (item.quantity || 1) + delta;
          return nextQty > 0 ? { ...item, quantity: nextQty } : item;
        }
        return item;
      }));
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

  const transactionId = useMemo(() => {
    return `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
  }, []);

  const validateShippingForm = () => {
    const errors = {};
    const required = ['name', 'email', 'phone', 'city', 'state', 'zip', 'address'];
    required.forEach(field => {
      if (!formData[field] || !formData[field].trim()) errors[field] = 'Required field';
    });
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email';
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

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setIsPromoLoading(true);
    try {
      const { data } = await api.post('/coupons/apply', {
        code: promoCode,
        cartTotal: subtotal
      });
      if (data.success) {
        setAppliedCoupon(data);
        toast.success(`Coupon "${data.couponCode}" applied!`);
      }
    } catch (error) {
      console.error('Coupon error:', error);
      toast.error(error.response?.data?.message || 'Invalid promo code');
      setAppliedCoupon(null);
    } finally {
      setIsPromoLoading(false);
    }
  };

  const createRazorpayOrder = async () => {
    try {
      const { data } = await api.post('/payment/create-order', {
        amount: Math.round(orderTotal), 
        currency: 'INR',
      });
      return data.order;
    } catch (error) {
      console.error('Razorpay order error:', error);
      toast.error('Failed to create payment order');
      return null;
    }
  };

  const handleFinalPurchase = async () => {
    if (!user) {
      toast.error('Please login to place an order');
      return navigate('/login', { state: { from: location.pathname } });
    }

    setIsLoading(true);
    const razorpayOrder = await createRazorpayOrder();
    if (!razorpayOrder) {
      setIsLoading(false);
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_API_KEY || 'rzp_test_T11Jv85sge0Daw', 
      amount: razorpayOrder.amount,
      currency: 'INR',
      name: 'P&D Luxury jewellery',
      description: 'Purchase from P&D Luxury jewellery',
      order_id: razorpayOrder.id,
      handler: async (response) => {
        try {
          // Freeze financial calculations immediately before altering the global cart state
          setFinalReceipt({
            savedTotal: orderTotal,
            savedCity: formData.city,
            savedState: formData.state,
            savedEmail: formData.email
          });

          const orderData = {
            orderItems: activeCart.map(item => ({
              product: item.id,
              name: item.title,
              quantity: item.quantity || 1,
              image: item.image,
              price: item.price,
              selectedFinish: item.selectedFinish
            })),
            shippingAddress: {
              fullName: formData.name,
              address: formData.address,
              city: formData.city,
              state: formData.state,
              country: formData.country,
              postalCode: formData.zip,
              phone: formData.phone
            },
            paymentMethod: 'Razorpay',
            paymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
            itemsPrice: subtotal,
            shippingPrice: selectedShippingPrice,
            taxPrice: luxuryTax,
            totalPrice: orderTotal,
            couponCode: appliedCoupon?.couponCode || '',
            discountAmount: discountAmount
          };

          const { data } = await api.post('/orders/create', orderData);

          if (data.success) {
            setIsLoading(false);
            setCurrentStep('complete');
            if (clearCart && !directCart) clearCart();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            toast.success('Order placed successfully!');
          }
        } catch (error) {
          console.error('Order placement error:', error);
          toast.error(error.response?.data?.message || 'Failed to place order');
          setIsLoading(false);
        }
      },
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.phone
      },
      theme: {
        color: '#e7b535'
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (response) => {
      toast.error('Payment failed, please try again');
      setIsLoading(false);
    });
    rzp.open();
  };

  // Immediate escape check if checking an empty setup panel layout out of bounds
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
      
      <div className="absolute top-0 left-[-10%] w-[50vw] h-[50vw] bg-gradient-to-tr from-[#FFF0EB] to-[#E8C7B7]/15 rounded-full blur-[140px] pointer-events-none mix-blend-multiply" />
      <div className="absolute top-[40%] right-[-10%] w-[45vw] h-[45vw] bg-gradient-to-bl from-[#F7E7CE]/10 to-[#FFF0EB] rounded-full blur-[160px] pointer-events-none" />

      <header className="pt-12 pb-8 border-b border-stone-200/60 bg-white/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <span className="font-serif text-2xl tracking-[0.3em] text-stone-900 font-semibold uppercase mb-2">ATELIER VAULT</span>
            <h1 className="font-serif text-base text-stone-500 tracking-[0.15em] uppercase font-light flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-[#D4AF37]" /> Secure Vault Checkout
            </h1>

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 relative z-10">
        <AnimatePresence mode="wait">
          {currentStep !== 'complete' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16 items-start" key="checkout-grid">

              <div className="lg:col-span-7 space-y-8">
                <AnimatePresence mode="wait">
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

                      {user?.addresses?.length > 0 && (
                        <div className="mb-8">
                          <h3 className="text-[10px] font-bold tracking-[0.15em] uppercase text-stone-500 mb-3">Saved Destinations</h3>
                          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                            {user.addresses.map((addr) => (
                              <button
                                key={addr._id}
                                type="button"
                                onClick={() => selectSavedAddress(addr)}
                                className="flex-shrink-0 w-48 p-3 rounded-xl border border-stone-200 bg-white hover:border-[#B76E79] transition-all text-left group"
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <MapPin className="w-3 h-3 text-[#B76E79]" />
                                  <span className="text-[10px] font-bold truncate">{addr.fullName}</span>
                                </div>
                                <p className="text-[9px] text-stone-500 line-clamp-2">{addr.addressLine}, {addr.city}</p>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

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

                        <div className="pt-4 border-t border-stone-100">
                          <h3 className="text-xs font-bold tracking-[0.15em] uppercase text-stone-500 mb-4">Delivery Dispatch Formats</h3>
                          <div className="space-y-3">
                            {SHIPPING_METHODS.map((method) => {
                              const isSelected = shippingMethod === method.id;
                              return (
                                <label
                                  key={method.id}
                                  className={`block relative rounded-xl border p-4 cursor-pointer transition-all duration-300 ${isSelected ? 'border-[#B76E79] bg-[#FFF0EB]/30 shadow-sm' : 'border-stone-200/80 bg-white hover:border-[#B76E79]/50'}`}
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
                                      {method.price === 0 ? 'Complimentary' : `₹${method.price}`}
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

                      <div className="text-center py-12 mb-6 bg-[#FFF0EB]/30 rounded-xl border border-[#B76E79]/20">
                        <div className="mb-4">
                          <div className="w-16 h-16 bg-[#B76E79] rounded-full flex items-center justify-center mx-auto shadow-md">
                            <CreditCard className="w-8 h-8 text-white" />
                          </div>
                        </div>
                        <p className="text-sm text-stone-700 mb-2">Pay securely with Razorpay</p>
                        <p className="text-xs text-stone-500">All major cards, UPI, and net banking supported</p>
                      </div>

                      <div className="pt-6 border-t border-stone-100">
                        <button
                          onClick={handleFinalPurchase}
                          disabled={isLoading}
                          className="w-full bg-gradient-to-r from-[#E8C7B7] via-[#B76E79] to-[#E8C7B7] text-white font-bold text-xs tracking-[0.2em] py-4 px-8 rounded-full shadow-lg shadow-[#B76E79]/20 hover:shadow-xl transition-all duration-500 disabled:opacity-50"
                          style={{ backgroundSize: '200% auto' }}
                        >
                          <AnimatePresence mode="wait">
                            {isLoading ? (
                              <motion.div key="loader" className="flex items-center justify-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>INITIALIZING PAYMENT...</span>
                              </motion.div>
                            ) : (
                              <motion.div key="text" className="flex items-center justify-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <ShoppingBag className="w-3.5 h-3.5" />
                                <span>MAKE PAYMENT (₹{Math.round(orderTotal).toLocaleString()})</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="lg:col-span-5 lg:sticky lg:top-32 space-y-6">
                <div className="bg-white/60 backdrop-blur-xl border border-stone-200/60 rounded-2xl p-6 shadow-xl shadow-stone-200/30">
                  <h2 className="font-serif text-lg tracking-wide text-stone-900 pb-4 border-b border-stone-100 mb-4">
                    Your Selection Vault ({activeCart.reduce((a, c) => a + (c.quantity || 1), 0)})
                  </h2>

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
                            <span className="font-serif text-xs font-medium text-stone-900">₹{(item.price * (item.quantity || 1)).toLocaleString()}</span>
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

                  <div className="mt-6 pt-5 border-t border-stone-100">
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          placeholder="Voucher Code"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          disabled={!!appliedCoupon || isPromoLoading}
                          className="w-full bg-white border border-stone-200 rounded-full px-4 py-2.5 text-xs font-bold tracking-widest uppercase placeholder-stone-300 focus:outline-none focus:border-[#B76E79] disabled:opacity-60"
                        />
                        {appliedCoupon && <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-3 top-3.5" />}
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        disabled={!!appliedCoupon || !promoCode.trim() || isPromoLoading}
                        className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-[#FDF8F3] text-[10px] font-bold uppercase tracking-widest rounded-full transition-all disabled:opacity-40 flex items-center gap-2"
                      >
                        {isPromoLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Apply'}
                      </button>
                    </div>
                    {appliedCoupon && (
                      <div className="flex items-center justify-between mt-2 pl-2">
                        <p className="text-[10px] text-emerald-700 font-medium tracking-wide">
                          Atelier allocation verified: {appliedCoupon.couponCode} applied.
                        </p>
                        <button 
                          onClick={() => {
                            setAppliedCoupon(null);
                            setPromoCode('');
                          }}
                          className="text-[9px] text-red-500 font-bold uppercase tracking-widest hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-5 border-t border-stone-100 space-y-3 text-xs">
                    <div className="flex justify-between text-stone-500 font-light">
                      <span>Subtotal Registry</span>
                      <span className="font-serif">₹{subtotal.toLocaleString()}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-medium">
                        <span>Atelier Discount {appliedCoupon?.couponCode && `(${appliedCoupon.couponCode})`}</span>
                        <span className="font-serif">-₹{discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-stone-500 font-light">
                      <span>Sovereign Courier Logistics</span>
                      <span className="font-serif">{selectedShippingPrice === 0 ? 'Complimentary' : `₹${selectedShippingPrice}`}</span>
                    </div>
                    <div className="flex justify-between text-stone-500 font-light">
                      <span>Luxury Valuation Duties (8.5%)</span>
                      <span className="font-serif">₹{Math.round(luxuryTax).toLocaleString()}</span>
                    </div>

                    <div className="pt-4 border-t border-stone-200 flex justify-between items-baseline">
                      <span>Total Escrow</span>
                      <span className="font-serif text-2xl font-semibold tracking-tight bg-gradient-to-r from-[#B76E79] to-[#D4AF37] bg-clip-text text-transparent">
                        ₹{Math.round(orderTotal).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

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
            // SUCCESS SCREEN USING SAFE STATE SNAPSHOT
            // ==========================================
            <motion.div
              key="complete-view"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-md mx-auto bg-[#FDFCFB] border border-stone-200/80 rounded-2xl p-8 sm:p-10 text-center shadow-xl shadow-stone-100/40 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#E8C7B7]/20 via-[#B76E79] to-[#E8C7B7]/20" />

              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                className="w-16 h-16 bg-[#FFF6F3] border border-[#E8C7B7]/30 rounded-full flex items-center justify-center mx-auto mb-6 relative"
              >
                <Check className="w-6 h-6 text-[#B76E79] stroke-[2]" />
                <span className="absolute -bottom-1 -right-1 bg-stone-900 text-white p-1 rounded-full border border-white">
                  <ShieldCheck className="w-3 h-3 text-stone-200" />
                </span>
              </motion.div>

              <h2 className="font-serif text-2xl font-light tracking-wide text-stone-900 mb-2">
                Order Successfully Placed
              </h2>
              <p className="text-stone-500 text-xs font-light tracking-wide max-w-xs mx-auto mb-1">
                Your premium luxury signature ledger configuration has been verified.
              </p>
              <div className="inline-block px-3 py-1 bg-stone-100 rounded-full mb-8">
                <p className="text-stone-500 text-[10px] font-mono tracking-wider uppercase">
                  ID: {transactionId}
                </p>
              </div>

              <div className="bg-white rounded-xl p-5 border border-stone-200/60 text-left space-y-3.5 mb-8 shadow-sm">
                <div className="flex justify-between items-center text-xs font-light text-stone-500">
                  <span className="tracking-wide">Authorized Courier</span>
                  <span className="font-medium text-stone-800 bg-stone-50 px-2 py-0.5 rounded border border-stone-100">
                    Bonded Atelier Carrier
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs font-light text-stone-500">
                  <span className="tracking-wide">Destination Node</span>
                  <span className="font-medium text-stone-900 truncate max-w-[180px]">
                    {finalReceipt?.savedCity ? `${finalReceipt.savedCity}, ${finalReceipt.savedState || ''}` : 'Surat, Gujarat'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs font-light text-stone-500 pt-3.5 border-t border-stone-100">
                  <span className="font-medium tracking-wide text-stone-600">Settled Valuation</span>
                  <span className="font-serif text-lg font-medium text-[#B76E79]">
                    ₹{Math.round(finalReceipt?.savedTotal || orderTotal).toLocaleString()}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-stone-400 font-light leading-relaxed mb-8 px-2">
                A verification receipt detailing real-time transit telemetry tracking coordinates has been routed to{' '}
                <span className="font-medium text-stone-600 underline decoration-stone-200 underline-offset-2">
                  {finalReceipt?.savedEmail || 'your registered email'}
                </span>.
              </p>

              <button
                onClick={() => navigate('/')}
                className="group w-full py-3.5 bg-stone-900 text-white text-xs font-semibold uppercase tracking-[0.25em] rounded-xl hover:bg-stone-800 transition-all duration-300 shadow-md shadow-stone-900/10 flex items-center justify-center gap-2"
              >
                <span>Return to Showroom</span>
                <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1 text-[#E8C7B7]" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}