import React from 'react';
import { Package, Image as ImageIcon } from 'lucide-react';

export function OrdersTab({ orders, ordersLoading, navigate }) {
  if (ordersLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-3 border-[#B76E79] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-stone-100 shadow-sm max-w-md mx-auto">
        <div className="w-16 h-16 bg-[#FFF0EB] rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="w-7 h-7 text-[#B76E79]" />
        </div>
        <h4 className="text-base font-medium text-stone-800 mb-1">No orders yet</h4>
        <p className="text-sm text-stone-500 max-w-xs mx-auto px-4">
          Once you place an order, it will appear here with its tracking details.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-slow">
      <div className="flex justify-between items-end pb-2 border-b border-stone-100">
        <div>
          <h3 className="font-serif text-2xl text-stone-800 tracking-wide">Order History</h3>
          <p className="text-xs text-stone-400 mt-1">Manage and track your recent purchases</p>
        </div>
        <span className="text-xs font-medium bg-stone-100 text-stone-600 px-3 py-1 rounded-full">
          {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
        </span>
      </div>

      <div className="space-y-4">
        {orders.map((order, index) => {
          const status = order.orderStatus?.toUpperCase() || 'PROCESSING';
          const isDelivered = status === 'DELIVERED';
          const isCancelled = status === 'CANCELLED';

          let statusClasses = "bg-amber-50 text-amber-700 border-amber-200";
          if (isDelivered) statusClasses = "bg-emerald-50 text-emerald-700 border-emerald-100";
          if (isCancelled) statusClasses = "bg-rose-50 text-rose-700 border-rose-100";

          // Target the first item's image for the preview snapshot
          const primaryItem = order.orderItems?.[0];
          const productImage = primaryItem?.image || primaryItem?.productImage;

          return (
            <div
              key={order._id || index}
              className="bg-white rounded-2xl p-5 md:p-6 border border-stone-100 shadow-sm hover:shadow-md transition-all duration-200"
            >
              {/* Upper Section: Order Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-stone-100 pb-4 mb-4 text-left">
                <div className="flex items-center gap-2">
                  <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-0.5">Order ID</p>
                  <p className="text-sm font-mono font-medium text-stone-800 truncate max-w-[140px]">
                    #{order._id?.slice(-8) || index}
                  </p>
                  {order.currency === 'USD' && <span className="text-xs">✈️</span>}
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-0.5">Date Placed</p>
                  <p className="text-sm text-stone-600 font-medium">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-0.5">Total Paid</p>
                  <p className="text-sm font-bold text-stone-900">
                    {order.currencySymbol || '₹'}{order.totalPrice?.toLocaleString(order.currency === 'USD' ? 'en-US' : 'en-IN', { minimumFractionDigits: order.currency === 'USD' ? 2 : 0, maximumFractionDigits: 2 })}
                    {order.currency === 'USD' ? ' USD' : ' INR'}
                  </p>
                </div>
                <div className="flex sm:justify-end items-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusClasses}`}>
                    {order.orderStatus}
                  </span>
                </div>
              </div>

              {/* Lower Section: Product Snapshot & Actions Layout */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                
                {/* Product Layout Frame with Image */}
                <div className="flex items-center gap-4 flex-1 w-full">
                  <div className="w-24 h-24 rounded-xl border border-stone-100 bg-stone-50 flex-shrink-0 overflow-hidden flex items-center justify-center relative">
                    {productImage ? (
                      <img 
                        src={productImage} 
                        alt={primaryItem?.name || "Ordered jewelry"} 
                        className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = ''; // Clear source to show fallback icon
                        }}
                      />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-stone-300" />
                    )}

                    {/* Badge indicator if user ordered multiple different pieces */}
                    {order.orderItems?.length > 1 && (
                      <div className="absolute -top-1 -right-1 bg-stone-900 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                        {order.orderItems.length}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-stone-800 truncate pr-2">
                      {primaryItem?.name || "Exclusive Premium Jewelry Piece"}
                    </h4>
                    {order.orderItems?.length > 1 && (
                      <p className="text-xs text-stone-500 font-medium mt-0.5">
                        plus {order.orderItems.length - 1} more item{order.orderItems.length > 2 ? 's' : ''}
                      </p>
                    )}
                    <p className="text-xs text-stone-400 mt-1 flex items-center gap-1.5">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-stone-200"></span>
                      Payment via {order.paymentMethod}
                    </p>
                  </div>
                </div>

                {/* Interactive Action Buttons */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {isDelivered && (
                    <button
                      onClick={() => navigate(`/give-review/${primaryItem?.product}`)}
                      className="flex-1 sm:flex-none px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold rounded-xl transition duration-150 border border-amber-200 white-space-nowrap"
                    >
                      Leave a Review
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/order-detail/${order._id}`)}
                    className="flex-1 sm:flex-none px-5 py-2 bg-stone-900 hover:bg-[#B76E79] text-white text-xs font-medium rounded-xl shadow-sm transition duration-150 white-space-nowrap"
                  >
                    Track Order
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}