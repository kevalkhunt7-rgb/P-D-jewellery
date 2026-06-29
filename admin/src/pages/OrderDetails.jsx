import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";
import { 
  FiArrowLeft, 
  FiDownload, 
  FiTruck, 
  FiPackage, 
  FiCheckCircle, 
  FiClock, 
  FiMapPin, 
  FiMail, 
  FiPhone, 
  FiCreditCard,
  
} from "react-icons/fi";
import { IoAirplane } from "react-icons/io5";
export function OrderDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrderDetails = async () => {
    try {
      const { data } = await api.get(`/orders/single/${id}`);
      if (data.success) {
        setOrderData(data.order);
      }
    } catch (error) {
      console.error("Failed to fetch order details", error);
      toast.error("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    const loadToast = toast.loading("Updating status...");
    setUpdating(true);
    try {
      const { data } = await api.put(`/orders/update-status/${id}`, { status: newStatus });
      if (data.success) {
        toast.success("Status updated successfully", { id: loadToast });
        fetchOrderDetails();
      }
    } catch (error) {
      console.error("Status update error:", error);
      toast.error(error.response?.data?.message || "Failed to update status", { id: loadToast });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-white">Order not found</h2>
        <button onClick={() => navigate(-1)} className="mt-4 text-amber-500 hover:underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl text-slate-200 p-1">
      {/* Header Panel Layout */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white rounded-xl transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Order #{orderData._id.slice(-8).toUpperCase()}</span>
              {(orderData.paymentMethod === 'PAYPAL' || orderData.displayCurrency === 'USD') && (
                <span title="Foreign Order" className="text-sky-400">
                  <IoAirplane className="w-5 h-5" />
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Placed on {new Date(orderData.createdAt).toLocaleDateString()} at{" "}
              {new Date(orderData.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <select
              value={orderData.orderStatus}
              disabled={updating || orderData.orderStatus === "CANCELLED"}
              onChange={(e) => handleStatusUpdate(e.target.value)}
              className="w-[160px] bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-medium focus:outline-none focus:border-amber-500/50 transition-colors appearance-none disabled:opacity-50"
            >
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PACKED">Packed</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED" disabled>Cancelled</option>
            </select>
          </div>
          
          <button className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-300 hover:text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors">
            <FiDownload className="w-3.5 h-3.5" />
            Invoice
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Historical Flow & Products Row */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Order Status Display */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-white tracking-wide border-b border-slate-800 pb-2 mb-4">Current Status</h2>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <FiPackage className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-white uppercase tracking-wider">{orderData.orderStatus}</p>
                <p className="text-xs text-slate-500 mt-1">Payment Method: {orderData.paymentMethod}</p>
              </div>
              <div className="ml-auto">
                 <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  orderData.isPaid ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                }`}>
                  {orderData.isPaid ? "Paid" : "Unpaid"}
                </span>
              </div>
            </div>
          </div>

          {/* Refund Status Display */}
          {orderData.refundStatus !== "NotRequired" && (
            <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm">
              <h2 className="text-sm font-bold text-white tracking-wide border-b border-slate-800 pb-2 mb-4">Refund Status</h2>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                  <FiCreditCard className="w-6 h-6" />
                </div>
                <div>
                  <p className={`text-sm font-bold uppercase tracking-wider ${
                    orderData.refundStatus === "Completed" ? "text-emerald-500" :
                    orderData.refundStatus === "Failed" ? "text-red-500" :
                    orderData.refundStatus === "Processing" ? "text-blue-500" : "text-amber-500"
                  }`}>
                    Refund {orderData.refundStatus}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Refund Amount: ₹{orderData.refundAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} INR
                  </p>
                  {orderData.refundFailureReason && (
                    <p className="text-xs text-red-400 mt-1">
                      Reason: {orderData.refundFailureReason}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Checkout Itemized Inventory Product Breakout */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-white tracking-wide border-b border-slate-800 pb-2">Ordered Products</h2>
            
            <div className="divide-y divide-slate-800/60 space-y-3">
              {orderData.orderItems.map((product, index) => (
                <div key={index} className="flex items-center gap-4 pt-3 first:pt-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-14 h-14 rounded-xl object-cover border border-slate-800 bg-slate-950"
                  />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-white">{product.name}</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Qty: <span className="text-slate-200 font-semibold">{product.quantity}</span> × ₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <p className="text-xs font-bold text-slate-200">₹{(product.price * product.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-800 pt-4 mt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Items Price</span>
                <span className="text-slate-200 font-medium">
                  ₹{orderData.itemsPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Shipping</span>
                <span className="text-emerald-400 font-bold text-[11px] tracking-wide">
                  {orderData.shippingPrice === 0 ? "FREE" : `₹${orderData.shippingPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Tax</span>
                <span className="text-slate-200 font-medium">
                  ₹{orderData.taxPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              {orderData.discountAmount > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Discount {orderData.couponCode && `(${orderData.couponCode})`}</span>
                  <span className="text-emerald-400 font-bold text-[11px] tracking-wide">
                    -₹{orderData.discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              
              <div className="border-t border-slate-800/80 pt-3 flex justify-between font-bold text-base text-white">
                <span>Total (INR)</span>
                <span className="text-amber-500 font-bold flex items-center gap-1">
                  ₹{orderData.totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  <span className="text-xs text-slate-400 font-normal">(INR)</span>
                </span>
              </div>
              
              {/* Show original paid amount for foreign orders */}
              {orderData.paidCurrency === 'USD' && (
                <div className="flex justify-between text-xs pt-2 border-t border-slate-800/50">
                  <span className="text-sky-400">Originally Paid</span>
                  <span className="text-sky-400 font-medium">
                    ${orderData.paidAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                    <span className="text-[10px] text-slate-500 ml-1">@ {orderData.exchangeRate?.toFixed(2)} INR/USD</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Information Profile Blocks */}
        <div className="space-y-6">
          
          {/* Customer Metadata Profile info */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-white tracking-wide border-b border-slate-800 pb-2">Customer Details</h2>
            
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-300 font-bold text-xs uppercase">
                {orderData.user?.name?.split(" ").map((n) => n[0]).join("") || "G"}
              </div>
              <div>
                <p className="text-xs font-bold text-white">{orderData.user?.name || 'Guest'}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Purchaser Accounts</p>
              </div>
            </div>
            
            <div className="border-t border-slate-800 pt-3.5 space-y-2.5">
              <div className="flex items-start gap-2.5">
                <FiMail className="w-3.5 h-3.5 mt-0.5 text-slate-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Email</p>
                  <p className="text-xs text-slate-300 truncate mt-0.5">{orderData.user?.email || 'No email'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <FiPhone className="w-3.5 h-3.5 mt-0.5 text-slate-500" />
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Phone</p>
                  <p className="text-xs text-slate-300 mt-0.5">{orderData.shippingAddress.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Physical Destination Block */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-white tracking-wide border-b border-slate-800 pb-2 flex items-center gap-2">
              <FiMapPin className="w-3.5 h-3.5 text-amber-500" />
              Shipping Address
            </h2>
            <div className="text-xs text-slate-300 space-y-1 leading-relaxed pl-5 font-medium">
              <p className="text-white font-bold">{orderData.shippingAddress.fullName}</p>
              <p>{orderData.shippingAddress.address}</p>
              <p>
                {orderData.shippingAddress.city}, {orderData.shippingAddress.state} {orderData.shippingAddress.postalCode}
              </p>
              <p className="text-slate-400 text-[11px] font-semibold tracking-wider mt-1">{orderData.shippingAddress.country}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}