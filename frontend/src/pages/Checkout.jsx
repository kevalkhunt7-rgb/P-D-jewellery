import React, { useState, useMemo, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext'; // 👈 1. Import Settings Context
import { useProducts } from '../context/ProductContext'; // 👈 Import ProductContext for country code
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  Lock,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

// Step Implementations
import ShippingStep from '../components/ShippingStep';
import PaymentStep from '../components/PaymentStep';
import CompleteStep from '../components/CompleteStep';

const fadeInScale = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

export default function PremiumCheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings } = useSettings(); // 👈 2. Destructure Settings
  const { countryCode } = useProducts(); // 👈 Get country code
  const currencySymbol = settings?.general?.currencySymbol || '₹';
  const currency = settings?.general?.currency || 'INR';

  const { cart: contextCart, updateQuantity: contextUpdateQty, removeFromCart: contextRemoveItem, clearCart } = useCart();
  const [directCart, setDirectCart] = useState(location.state?.customCart || null);
  const activeCart = directCart || contextCart || [];

  const [currentStep, setCurrentStep] = useState('shipping');
  const [isLoading, setIsLoading] = useState(false);

  const [promoCode, setPromoCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isPromoLoading, setIsPromoLoading] = useState(false);
  const [finalReceipt, setFinalReceipt] = useState(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    country: 'India',
    city: '', state: '', zip: '', address: ''
  });
  const [formErrors, setFormErrors] = useState({});

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

  // Stable baseline calculations
  const subtotal = activeCart.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;

  // Post-discount amount before shipping and taxes are applied
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);

  /* 
   * 🚀 3. DYNAMIC LAUNCHPAD RULES CALCULATIONS 
   * Safeguarded fallback syntax checking for order / orders parameters
   */
  const orderConfig = useMemo(() => {
    return settings?.order || settings?.orders || {};
  }, [settings]);

  const shippingCharge = Number(orderConfig.shippingCharge) || 0;
  const freeShippingThreshold = Number(orderConfig.freeShippingMinAmount) || 0;
  const taxPercentage = Number(orderConfig.taxPercentage) || 0;

  // Compute Conditional Premium Shipping Cost
  const actualShippingCost = useMemo(() => {
    if (freeShippingThreshold > 0 && subtotal >= freeShippingThreshold) {
      return 0;
    }
    return shippingCharge;
  }, [subtotal, shippingCharge, freeShippingThreshold]);

  // Compute Precise Boutique Tax Breakdown
  const calculatedTaxAmount = useMemo(() => {
    return discountedSubtotal * (taxPercentage / 100);
  }, [discountedSubtotal, taxPercentage]);

  // Master Grand Total Assembly
  const orderTotal = useMemo(() => {
    return discountedSubtotal + actualShippingCost + calculatedTaxAmount;
  }, [discountedSubtotal, actualShippingCost, calculatedTaxAmount]);

  const transactionId = useMemo(() => `TXN-${Math.floor(100000 + Math.random() * 900000)}`, []);

  const mutateQuantity = (id, delta) => {
    if (directCart) {
      setDirectCart(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(1, (item.quantity || 1) + delta) } : item));
    } else {
      contextUpdateQty(id, delta);
    }
  };

  const removeProductItem = (id) => {
    if (directCart) setDirectCart(prev => prev.filter(item => item.id !== id));
    else contextRemoveItem(id);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

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

  const validateShippingForm = () => {
    const errors = {};
    ['name', 'email', 'phone', 'country', 'city', 'state', 'zip', 'address'].forEach(field => {
      if (!formData[field] || !formData[field].trim()) errors[field] = 'Required field';
    });
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email';
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
      const { data } = await api.post('/coupons/apply', { code: promoCode, cartTotal: subtotal });
      if (data.success) {
        setAppliedCoupon(data);
        toast.success(`Coupon "${data.couponCode}" applied!`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid promo code');
      setAppliedCoupon(null);
    } finally {
      setIsPromoLoading(false);
    }
  };

  console.log("RAZORPAY KEY:", import.meta.env.VITE_RAZORPAY_API_KEY);

  // Handle PayPal success
  const handlePayPalSuccess = async ({ paymentId, paypalOrderId }) => {
    try {
      setIsLoading(true);
      setFinalReceipt({ savedTotal: orderTotal, savedCity: formData.city, savedState: formData.state, savedEmail: formData.email, currency, currencySymbol });

      const orderData = {
        orderItems: activeCart.map(item => ({
          product: item.id,
          name: item.title,
          quantity: item.quantity || 1,
          image: item.image,
          price: item.price,
          selectedFinish: item.selectedFinish
        })),
        shippingAddress: { fullName: formData.name, address: formData.address, city: formData.city, state: formData.state, country: formData.country, postalCode: formData.zip, phone: formData.phone },
        paymentMethod: 'PAYPAL',
        paymentId,
        paypalOrderId,
        itemsPrice: subtotal,
        shippingPrice: actualShippingCost,
        taxPrice: calculatedTaxAmount,
        totalPrice: orderTotal,
        couponCode: appliedCoupon?.couponCode || '',
        discountAmount
      };

      const { data } = await api.post('/orders/checkout', orderData);
      if (data.success) {
        if (clearCart && !directCart) clearCart();
        setCurrentStep('complete');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        toast.success('Order placed successfully!');
      }
    } catch (err) {
      console.error(err);
      console.log(err.response?.data);

      toast.error(
        err.response?.data?.message || "Failed to register order records."
      );
    }
  };

  // Handle Razorpay
  const handleFinalPurchase = async () => {
    if (!user) return navigate('/login', { state: { from: location.pathname } });
    setIsLoading(true);

    try {
      const { data: orderResponse } = await api.post('/payment/create-order', { amount: Math.round(orderTotal), currency: 'INR' });
      const razorpayOrder = orderResponse.order;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_API_KEY || 'rzp_test_T11Jv85sge0Daw',
        amount: razorpayOrder.amount,
        currency: 'INR',
        name: 'P&D Luxury jewellery',
        order_id: razorpayOrder.id,
        handler: async (response) => {
          try {
            setFinalReceipt({ savedTotal: orderTotal, savedCity: formData.city, savedState: formData.state, savedEmail: formData.email, currency, currencySymbol });
            const orderData = {
              orderItems: activeCart.map(item => ({
                product: item.id,
                name: item.title,
                quantity: item.quantity || 1,
                image: item.image,
                price: item.price,
                selectedFinish: item.selectedFinish
              })),
              shippingAddress: { fullName: formData.name, address: formData.address, city: formData.city, state: formData.state, country: formData.country, postalCode: formData.zip, phone: formData.phone },
              paymentMethod: 'Razorpay',
              paymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
              itemsPrice: subtotal,
              shippingPrice: actualShippingCost, // 🚀 Sync shipping costs to database records
              taxPrice: calculatedTaxAmount,       // 🚀 Sync calculation breakdowns to database records
              totalPrice: orderTotal,
              couponCode: appliedCoupon?.couponCode || '',
              discountAmount
            };

            const { data } = await api.post('/orders/checkout', orderData);
            if (data.success) {
              if (clearCart && !directCart) clearCart();
              setCurrentStep('complete');
              window.scrollTo({ top: 0, behavior: 'smooth' });
              toast.success('Order placed successfully!');
            }
          } catch (err) {
            toast.error('Failed to register order records.');
          } finally {
            setIsLoading(false);
          }
        },
        prefill: { name: formData.name, email: formData.email, contact: formData.phone },
        theme: { color: '#e7b535' },
        modal: {
          ondismiss: function () {
            setIsLoading(false);
            toast.error('Payment cancelled by user.');
          }
        }
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', (response) => {
        setIsLoading(false);
      });

      rzp.open();
    } catch (err) {
      toast.error('Payment process failed to load.');
      setIsLoading(false);
    }
  };

  if (activeCart.length === 0 && currentStep !== 'complete') {
    return (
      <div className="min-h-screen bg-[#FDF8F3] text-[#2C2C2C] flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-white border border-stone-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm"><ShoppingBag className="w-8 h-8 text-[#B76E79]" /></div>
          <h1 className="font-serif text-3xl font-light tracking-wide text-stone-900 mb-3">Your Casket is Empty</h1>
          <button onClick={() => navigate('/')} className="px-8 py-3.5 bg-stone-900 text-[#FDF8F3] text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:bg-stone-800 transition-all">Return to Showroom</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F3] text-[#2C2C2C] font-sans antialiased pb-24 relative overflow-x-hidden">
      {/* Background Glow Designs */}
      <div className="absolute top-0 left-[-10%] w-[50vw] h-[50vw] bg-gradient-to-tr from-[#FFF0EB] to-[#E8C7B7]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[45vw] h-[45vw] bg-gradient-to-bl from-[#F7E7CE]/10 to-[#FFF0EB] rounded-full blur-[160px] pointer-events-none" />

      {/* Main Header / Navigation Tracker */}
      <header className="pt-12 pb-8 border-b border-stone-200/60 bg-white/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="font-serif text-2xl tracking-[0.3em] text-stone-900 font-semibold uppercase mb-2">ATELIER VAULT</span>
          <h1 className="font-serif text-base text-stone-500 tracking-[0.15em] uppercase font-light flex items-center justify-center gap-2">
            <Lock className="w-3.5 h-3.5 text-[#D4AF37]" /> Secure Vault Checkout
          </h1>

          <div className="mt-8 flex items-center justify-center gap-4 sm:gap-6 w-full max-w-xl mx-auto text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase">
            {/* Step 1: Bag */}
            <div className="flex items-center text-[#B76E79] shrink-0">
              <span>Bag</span>
              <ChevronRight className="w-3.5 h-3.5 ml-2 sm:ml-3 text-stone-300" />
            </div>

            {/* Step 2: Shipping */}
            <div className={`flex items-center shrink-0 ${currentStep === 'shipping' || currentStep === 'payment' ? 'text-stone-900' : 'text-stone-400'}`}>
              <span className={`pb-1 ${currentStep === 'shipping' ? 'border-b-2 border-[#B76E79]' : ''}`}>
                Shipping
              </span>
              <ChevronRight className="w-3.5 h-3.5 ml-2 sm:ml-3 text-stone-300" />
            </div>

            {/* Step 3: Payment */}
            <div className={`flex items-center shrink-0 ${currentStep === 'payment' ? 'text-stone-900' : 'text-stone-400'}`}>
              <span className={`pb-1 ${currentStep === 'payment' ? 'border-b-2 border-[#B76E79]' : ''}`}>
                Payment
              </span>
              <ChevronRight className="w-3.5 h-3.5 ml-2 sm:ml-3 text-stone-300" />
            </div>

            {/* Step 4: Complete */}
            <div className={`flex items-center shrink-0 ${currentStep === 'complete' ? 'text-[#D4AF37]' : 'text-stone-400'}`}>
              <span>Complete</span>
            </div>
          </div>
        </div>
      </header>

      {/* Flow Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 relative z-10">
        <AnimatePresence mode="wait">
          {currentStep !== 'complete' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16 items-start" key="checkout-grid">

              {/* Left Column Dynamic Step Injection */}
              <div className="lg:col-span-7 space-y-8">
                <AnimatePresence mode="wait">
                  {currentStep === 'shipping' && (
                    <ShippingStep
                      user={user}
                      formData={formData}
                      formErrors={formErrors}
                      handleInputChange={handleInputChange}
                      selectSavedAddress={selectSavedAddress}
                      handleProceedToPayment={handleProceedToPayment}
                      fadeInScale={fadeInScale}
                    />
                  )}
                  {currentStep === 'payment' && (
                    <PaymentStep
                      setCurrentStep={setCurrentStep}
                      handleFinalPurchase={handleFinalPurchase}
                      isLoading={isLoading}
                      orderTotal={orderTotal}
                      currency={currency}
                      currencySymbol={currencySymbol}
                      countryCode={countryCode}
                      onPayPalSuccess={handlePayPalSuccess}
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* Right Column Checkout Sidebar - Sticky */}
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
                              <h3 className="text-xl font-semibold text-stone-900 leading-tight">{item.title}</h3>
                              <p className="text-[15px] text-stone-400 font-light mt-0.5">{item.subtitle || item.category || 'Atelier Edition'}</p>
                            </div>
                            <span className="font-mono text-xl font-semibold text-stone-900">{currencySymbol}{(item.price * (item.quantity || 1)).toLocaleString(currency === 'USD' ? 'en-US' : 'en-IN', { minimumFractionDigits: currency === 'USD' ? 2 : 0, maximumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <button type="button" onClick={() => removeProductItem(item.id)} className="text-[10px] font-bold tracking-widest text-stone-400 hover:text-red-600 transition-colors flex items-center gap-1 uppercase"><Trash2 className="w-3 h-3" /> Remove</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Promo Section */}
                  <div className="mt-4 pt-5 border-t border-stone-100">
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
                      <button type="button" onClick={handleApplyPromo} disabled={!!appliedCoupon || !promoCode.trim() || isPromoLoading} className="px-5 py-2.5 bg-stone-900 text-[#FDF8F3] text-[10px] font-bold uppercase tracking-widest rounded-full transition-all disabled:opacity-40">{isPromoLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Apply'}</button>
                    </div>
                  </div>

                  {/* Pricing Matrix Breakdown */}
                  <div className="mt-6 pt-5 border-t border-stone-100 space-y-3 text-xs">
                    <div className="flex justify-between text-stone-500 font-light">
                      <span className="font-medium">Subtotal</span>
                      <span className="font-semibold text-stone-900">{currencySymbol}{subtotal.toLocaleString(currency === 'USD' ? 'en-US' : 'en-IN', { minimumFractionDigits: currency === 'USD' ? 2 : 0, maximumFractionDigits: 2 })}</span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-medium">
                        <span>Atelier Discount</span>
                        <span className="font-semibold">-{currencySymbol}{discountAmount.toLocaleString(currency === 'USD' ? 'en-US' : 'en-IN', { minimumFractionDigits: currency === 'USD' ? 2 : 0, maximumFractionDigits: 2 })}</span>
                      </div>
                    )}

                    {/* 🚀 LIVE PREMIUM SHIPPING LINE */}
                    <div className="flex justify-between text-stone-500 font-light">
                      <span className="font-medium">Shipping Premium</span>
                      <span className={`font-semibold ${actualShippingCost === 0 ? 'text-emerald-600 font-bold uppercase text-[10px] tracking-wider' : 'text-stone-900'}`}>
                        {actualShippingCost === 0 ? 'Complimentary' : `${currencySymbol}${actualShippingCost.toLocaleString(currency === 'USD' ? 'en-US' : 'en-IN', { minimumFractionDigits: currency === 'USD' ? 2 : 0, maximumFractionDigits: 2 })}`}
                      </span>
                    </div>

                    {/* 🚀 LIVE DUTIES & GST LINE */}
                    <div className="flex justify-between text-stone-500 font-light">
                      <span className="font-medium">Duties & GST ({taxPercentage}%)</span>
                      <span className="font-semibold text-stone-900">{currencySymbol}{calculatedTaxAmount.toLocaleString(currency === 'USD' ? 'en-US' : 'en-IN', { minimumFractionDigits: currency === 'USD' ? 2 : 0, maximumFractionDigits: 2 })}</span>
                    </div>

                    <div className="pt-4 border-t text-xl font-semibold border-stone-200 flex justify-between items-baseline">
                      <span>Total Amount</span>
                      <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-[#B76E79] to-[#D4AF37] bg-clip-text text-transparent">
                        {currencySymbol}{currency === 'USD' ? orderTotal.toFixed(2) : Math.round(orderTotal).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <CompleteStep finalReceipt={finalReceipt} transactionId={transactionId} />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}