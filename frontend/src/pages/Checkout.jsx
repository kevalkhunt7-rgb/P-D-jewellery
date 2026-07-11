import React, { useState, useMemo, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useProducts } from '../context/ProductContext';
import { useShipping } from '../context/ShippingContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { sanitizePhone, isValidPhone, PHONE_ERROR_MESSAGE } from '../utils/phoneValidation';
import { PayPalScriptProvider } from "@paypal/react-paypal-js"; // 🚀 Import PayPal Provider
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
  const { settings } = useSettings();
  const { countryCode } = useProducts();
  const { currencyContext, calculateShippingCost } = useShipping();
  const currencySymbol = currencyContext?.currencySymbol || '₹';
  const currency = currencyContext?.currency || 'INR';

  // Load the PayPal SDK once as soon as the checkout page mounts.
  // Using the resolved currency keeps the payment script aligned.
  const paypalScriptOptions = useMemo(() => ({
    "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID || 'test',
    currency: currency === 'INR' ? 'USD' : currency,
    intent: 'capture',
  }), [currency]);

  const { cart: contextCart, updateQuantity: contextUpdateQty, removeFromCart: contextRemoveItem, clearCart } = useCart();
  const [directCart, setDirectCart] = useState(location.state?.customCart || null);
  const activeCart = directCart || contextCart || [];

  const [currentStep, setCurrentStep] = useState('shipping');
  const [isLoading, setIsLoading] = useState(false);

  const [promoCode, setPromoCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isPromoLoading, setIsPromoLoading] = useState(false);
  const [finalReceipt, setFinalReceipt] = useState(null);

  // ========== TWO-PHASE CHECKOUT STATE ==========
  const [initiatedOrderId, setInitiatedOrderId] = useState(null);
  const [serverSummary, setServerSummary] = useState(null);
  const [razorpayOrderData, setRazorpayOrderData] = useState(null);
  const [paypalGatewayOrderId, setPaypalGatewayOrderId] = useState(null);

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
        phone: sanitizePhone(user.phone || '')
      }));
    }
  }, [user]);

  // Stable baseline calculations (used as local estimates on step 1)
  const subtotal = activeCart.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;

  const discountedSubtotal = Math.max(0, subtotal - discountAmount);

  // Calculate total net weight (in grams) for cart items
  const totalWeight = useMemo(() => {
    return activeCart.reduce((acc, item) => acc + ((item.product?.netWeight || item.netWeight || 0) * (item.quantity || 1)), 0);
  }, [activeCart]);

  // Calculate dynamic shipping cost based on matched region
  const shippingInfo = useMemo(() => {
    return calculateShippingCost(discountedSubtotal, totalWeight);
  }, [discountedSubtotal, totalWeight, calculateShippingCost]);

  const actualShippingCost = shippingInfo.charge;
  const deliveryTime = shippingInfo.deliveryTime;

  const orderTotal = useMemo(() => {
    return discountedSubtotal + actualShippingCost;
  }, [discountedSubtotal, actualShippingCost]);

  const transactionId = useMemo(() => `TXN-${Math.floor(100000 + Math.random() * 900000)}`, []);

  // Server-authoritative totals selectors (falls back to client estimate on step 1)
  const displaySubtotal = serverSummary ? serverSummary.itemsPrice : subtotal;
  const displayDiscount = serverSummary ? serverSummary.discountAmount : discountAmount;
  const displayShipping = serverSummary ? serverSummary.shippingPrice : actualShippingCost;
  const displayTotal = serverSummary ? serverSummary.totalPrice : orderTotal;
  const displayCurrencySymbol = serverSummary ? serverSummary.currencySymbol : currencySymbol;
  const displayCurrency = serverSummary ? serverSummary.currency : currency;

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
      phone: sanitizePhone(addr.phone || ''),
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
    if (formData.phone && !isValidPhone(formData.phone)) errors.phone = PHONE_ERROR_MESSAGE;
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ========== INITIATE CHECKOUT (PHASE 1) ==========
  const initiateCheckoutOrder = async (couponCodeVal) => {
    setIsLoading(true);
    try {
      const selectedPaymentMethod = currency === 'INR' ? 'Razorpay' : 'PAYPAL';
      const shippingAddress = {
        fullName: formData.name,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        postalCode: formData.zip,
        country: formData.country,
      };

      const { data } = await api.post('/orders/checkout/initiate', {
        shippingAddress,
        couponCode: couponCodeVal || appliedCoupon?.couponCode || '',
        paymentMethod: selectedPaymentMethod,
      });

      if (data.success) {
        setInitiatedOrderId(data.orderId);
        setServerSummary(data.orderSummary);
        setRazorpayOrderData(data.razorpayOrder);
        setPaypalGatewayOrderId(data.paypalOrderId);
        return data;
      }
    } catch (error) {
      console.error('Initiate checkout error:', error);
      toast.error(error.response?.data?.message || 'Failed to initialize secure checkout');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    if (validateShippingForm()) {
      try {
        await initiateCheckoutOrder();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setCurrentStep('payment');
      } catch (err) {
        // Error already toasted
      }
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setIsPromoLoading(true);
    try {
      const { data } = await api.post('/coupons/apply', { code: promoCode });
      if (data.success) {
        setAppliedCoupon(data);
        toast.success(`Coupon "${data.couponCode}" applied!`);
        // If already on payment step, refresh server checkout totals to include coupon discount
        if (currentStep === 'payment') {
          await initiateCheckoutOrder(data.couponCode);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid promo code');
      setAppliedCoupon(null);
    } finally {
      setIsPromoLoading(false);
    }
  };

  // ========== PAYPAL CALLBACK HANDLERS ==========
  const onCreatePayPalOrder = async () => {
    if (!paypalGatewayOrderId) {
      toast.error("PayPal order details not found");
      throw new Error("PayPal order ID missing");
    }
    return paypalGatewayOrderId;
  };

  const onApprovePayPalOrder = async (data) => {
    if (isLoading) return;
    try {
      setIsLoading(true);
      setFinalReceipt({
        savedTotal: displayTotal,
        savedCity: formData.city,
        savedState: formData.state,
        savedEmail: formData.email,
        currency: displayCurrency,
        currencySymbol: displayCurrencySymbol
      });

      const confirmData = {
        orderId: initiatedOrderId,
        paypalOrderId: data.orderID,
        paymentId: data.paymentID || data.orderID
      };

      const response = await api.post('/orders/checkout/confirm', confirmData);
      if (response.data.success) {
        if (clearCart && !directCart) clearCart();
        setCurrentStep('complete');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        toast.success('Order placed successfully!');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Payment verification failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // ========== RAZORPAY CALLBACK HANDLER ==========
  const handleFinalPurchase = async () => {
    if (isLoading) return;
    if (!user) return navigate('/login', { state: { from: location.pathname } });
    if (!razorpayOrderData) {
      toast.error('Payment order details not loaded');
      return;
    }
    setIsLoading(true);

    try {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_API_KEY || '',
        amount: razorpayOrderData.amount,
        currency: razorpayOrderData.currency,
        name: 'P&D Luxury Jewellery',
        order_id: razorpayOrderData.id,
        handler: async (response) => {
          try {
            setFinalReceipt({
              savedTotal: displayTotal,
              savedCity: formData.city,
              savedState: formData.state,
              savedEmail: formData.email,
              currency: displayCurrency,
              currencySymbol: displayCurrencySymbol
            });

            const confirmData = {
              orderId: initiatedOrderId,
              paymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            };

            const { data } = await api.post('/orders/checkout/confirm', confirmData);
            if (data.success) {
              if (clearCart && !directCart) clearCart();
              setCurrentStep('complete');
              window.scrollTo({ top: 0, behavior: 'smooth' });
              toast.success('Order placed successfully!');
            }
          } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to confirm payment.');
          } finally {
            setIsLoading(false);
          }
        },
        prefill: { name: formData.name, email: formData.email, contact: formData.phone },
        theme: { color: '#e7b535' },
        modal: {
          ondismiss: function () {
            setIsLoading(false);
            // Instantly restock the inventory if user explicitly closes Razorpay checkout
            api.post('/orders/checkout/cancel', { orderId: initiatedOrderId }).catch(err => console.error("Error cancelling order:", err));
            toast.error('Payment cancelled by user.');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => setIsLoading(false));
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
          <h1 className="font-serif text-3xl font-bold tracking-wide text-stone-900 mb-3">Your Casket is Empty</h1>
          <button onClick={() => navigate('/')} className="px-8 py-3.5 bg-stone-900 text-[#FDF8F3] text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:bg-stone-800 transition-all">Return to Showroom</button>
        </div>
      </div>
    );
  }

  return (
    <PayPalScriptProvider options={paypalScriptOptions}>
      <div className="min-h-screen bg-[#FDF8F3] text-[#2C2C2C] font-sans antialiased pb-24 relative overflow-x-hidden">
        <div className="absolute top-0 left-[-10%] w-[50vw] h-[50vw] bg-gradient-to-tr from-[#FFF0EB] to-[#E8C7B7]/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-[40%] right-[-10%] w-[45vw] h-[45vw] bg-gradient-to-bl from-[#F7E7CE]/10 to-[#FFF0EB] rounded-full blur-[160px] pointer-events-none" />

        <header className="pt-12 pb-8 border-b border-stone-200/60 bg-white/40 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="font-serif text-2xl tracking-[0.3em] text-stone-900 font-semibold uppercase mb-2">ATELIER VAULT</span>
            <h1 className="font-serif text-base text-stone-500 tracking-[0.15em] uppercase font-bold flex items-center justify-center gap-2">
              <Lock className="w-3.5 h-3.5 text-[#D4AF37]" /> Secure Vault Checkout
            </h1>

            <div className="mt-8 flex items-center justify-center gap-4 sm:gap-6 w-full max-w-xl mx-auto text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase">
              <div className="flex items-center text-[#B76E79] shrink-0">
                <span>Bag</span>
                <ChevronRight className="w-3.5 h-3.5 ml-2 sm:ml-3 text-stone-300" />
              </div>

              <div className={`flex items-center shrink-0 ${currentStep === 'shipping' || currentStep === 'payment' ? 'text-stone-900' : 'text-stone-800'}`}>
                <span className={`pb-1 ${currentStep === 'shipping' ? 'border-b-2 border-[#B76E79]' : ''}`}>
                  Shipping
                </span>
                <ChevronRight className="w-3.5 h-3.5 ml-2 sm:ml-3 text-stone-300" />
              </div>

              <div className={`flex items-center shrink-0 ${currentStep === 'payment' ? 'text-stone-900' : 'text-stone-800'}`}>
                <span className={`pb-1 ${currentStep === 'payment' ? 'border-b-2 border-[#B76E79]' : ''}`}>
                  Payment
                </span>
                <ChevronRight className="w-3.5 h-3.5 ml-2 sm:ml-3 text-stone-300" />
              </div>

              <div className={`flex items-center shrink-0 ${currentStep === 'complete' ? 'text-[#D4AF37]' : 'text-stone-800'}`}>
                <span>Complete</span>
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
                        orderTotal={displayTotal}
                        currency={displayCurrency}
                        currencySymbol={displayCurrencySymbol}
                        countryCode={countryCode}
                        onCreatePayPalOrder={onCreatePayPalOrder}
                        onApprovePayPalOrder={onApprovePayPalOrder}
                      />
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
                                <h3 className="text-xl font-semibold text-stone-900 leading-tight">{item.title}</h3>
                                <p className="text-[15px] text-stone-800 font-bold mt-0.5">{item.subtitle || item.category || 'Luxury Edition'}</p>
                              </div>
                              <span className="font-mono text-xl font-semibold text-stone-900">{displayCurrencySymbol}{(item.price * (item.quantity || 1)).toLocaleString(displayCurrency === 'USD' ? 'en-US' : 'en-IN', { minimumFractionDigits: displayCurrency === 'USD' ? 2 : 0, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <button type="button" onClick={() => removeProductItem(item.id)} className="text-[10px] font-bold tracking-widest text-stone-800 hover:text-red-600 transition-colors flex items-center gap-1 uppercase"><Trash2 className="w-3 h-3" /> Remove</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

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

                    <div className="mt-6 pt-5 border-t border-stone-100 space-y-3 text-xs">
                      <div className="flex justify-between text-stone-500 font-bold">
                        <span className="font-medium">Subtotal</span>
                        <span className="font-semibold text-stone-900">{displayCurrencySymbol}{displaySubtotal.toLocaleString(displayCurrency === 'USD' ? 'en-US' : 'en-IN', { minimumFractionDigits: displayCurrency === 'USD' ? 2 : 0, maximumFractionDigits: 2 })}</span>
                      </div>

                      {displayDiscount > 0 && (
                        <div className="flex justify-between text-emerald-700 font-medium">
                          <span>Luxury Discount</span>
                          <span className="font-semibold">-{displayCurrencySymbol}{displayDiscount.toLocaleString(displayCurrency === 'USD' ? 'en-US' : 'en-IN', { minimumFractionDigits: displayCurrency === 'USD' ? 2 : 0, maximumFractionDigits: 2 })}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-stone-500 font-bold">
                        <span className="font-medium">Shipping Premium</span>
                        <span className={`font-semibold ${displayShipping === 0 ? 'text-emerald-600 font-bold uppercase text-[10px] tracking-wider' : 'text-stone-900'}`}>
                          {displayShipping === 0 ? 'Complimentary' : `${displayCurrencySymbol}${displayShipping.toLocaleString(displayCurrency === 'USD' ? 'en-US' : 'en-IN', { minimumFractionDigits: displayCurrency === 'USD' ? 2 : 0, maximumFractionDigits: 2 })}`}
                        </span>
                      </div>
                      {deliveryTime && (
                        <div className="flex justify-between text-[11px] text-stone-400 font-bold -mt-3 pl-0.5">
                          <span>Estimated Delivery</span>
                          <span className="font-semibold text-stone-700">{deliveryTime}</span>
                        </div>
                      )}



                      <div className="pt-4 border-t text-xl font-semibold border-stone-200 flex justify-between items-baseline">
                        <span>Total Amount</span>
                        <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-[#B76E79] to-[#D4AF37] bg-clip-text text-transparent">
                          {displayCurrencySymbol}
                          {displayTotal.toLocaleString(
                            displayCurrency === 'USD' ? 'en-US' : 'en-IN',
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            }
                          )}
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
    </PayPalScriptProvider>
  );
}