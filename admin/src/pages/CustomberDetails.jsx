import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import api from "../utils/api";
import { 
  FiArrowLeft, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiShoppingBag, 
  FiDollarSign, 
  FiCalendar 
} from "react-icons/fi";

export function CustomerProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("orders");
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const { data } = await api.get(`/admin/customers/${id}`);
        if (data.success) {
          setCustomerData(data.customer);
        }
      } catch (error) {
        console.error("Failed to fetch customer data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomerData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!customerData) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-white">Customer not found</h2>
        <button onClick={() => navigate(-1)} className="mt-4 text-amber-500 hover:underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl text-slate-200 p-1">
      
      {/* Top Profile Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white rounded-xl transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center flex-shrink-0">
              {customerData.avatar ? (
                <img src={customerData.avatar} alt={customerData.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-bold text-slate-400">
                  {customerData.name.split(" ").map((n) => n[0]).join("")}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white mb-0.5">{customerData.name}</h1>
              <div className="flex items-center gap-2.5">
                {customerData.status === "vip" ? (
                  <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded bg-amber-500/10 border border-amber-500/30 text-amber-500">
                    VIP
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded bg-slate-800 border border-slate-700 text-slate-300">
                    Active
                  </span>
                )}
                <span className="text-xs text-slate-400">
                  Customer since {new Date(customerData.joinDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <button className="sm:w-auto text-center bg-slate-950 border border-slate-800 hover:bg-slate-900 hover:text-white text-slate-300 text-xs font-bold py-2 px-4 rounded-xl transition-colors">
          Send Email
        </button>
      </div>

      {/* Analytics Matrix Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400">Total Orders</p>
            <p className="text-xl font-bold text-white">{customerData.totalOrders}</p>
          </div>
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-amber-500">
            <FiShoppingBag className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400">Total Spent</p>
            <p className="text-xl font-bold text-white">₹{customerData.totalSpent.toLocaleString()}</p>
          </div>
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-amber-500">
            <FiDollarSign className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400">Average Order</p>
            <p className="text-xl font-bold text-white">₹{customerData.averageOrderValue.toLocaleString()}</p>
          </div>
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-amber-500">
            <FiDollarSign className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400">Last Order</p>
            <p className="text-xl font-bold text-white">
              {new Date(customerData.lastOrderDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-amber-500">
            <FiCalendar className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main Structural Breakdown */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Core Segment Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            
            {/* Custom Tab Switch Controls */}
            <div className="flex border-b border-slate-800 gap-6">
              <button
                type="button"
                onClick={() => setActiveTab("orders")}
                className={`pb-2.5 text-xs font-bold tracking-wide transition-colors relative ${
                  activeTab === "orders" ? "text-amber-500" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Order History
                {activeTab === "orders" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-full" />
                )}
              </button>
            </div>

            {/* Orders History Tab View */}
            {activeTab === "orders" && (
              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] tracking-wider text-slate-400 uppercase font-bold bg-slate-950/20">
                        <th className="py-3 px-5">Order ID</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Items</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 text-xs">
                      {customerData.orders.map((order) => (
                        <tr key={order._id} className="hover:bg-slate-800/10 transition-colors">
                          <td className="py-3.5 px-5 font-mono text-amber-500 font-medium">#{order._id.slice(-8).toUpperCase()}</td>
                          <td className="py-3.5 px-4 text-slate-400">{new Date(order.date).toLocaleDateString()}</td>
                          <td className="py-3.5 px-4 text-slate-300">{order.products} items</td>
                          <td className="py-3.5 px-4 font-semibold text-slate-200">₹{order.amount.toLocaleString()}</td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              order.status === "delivered" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                            }`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Activity Tab Content */}
            {activeTab === "activity" && (
              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
                <h2 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">Recent System Intercepts</h2>
                
                <div className="space-y-4 relative before:absolute before:inset-y-1 before:left-1 before:w-px before:bg-slate-800">
                  <div className="flex gap-4 relative">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-amber-500 ring-4 ring-slate-900 flex-shrink-0 z-10" />
                    <div className="flex-1 space-y-0.5">
                      <p className="text-xs font-bold text-white">Order Delivered</p>
                      <p className="text-[11px] text-slate-400">Order #ORD-2451 safely updated to client destination profile.</p>
                      <p className="text-[10px] text-slate-500 font-medium">2 days ago</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 relative">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-slate-700 ring-4 ring-slate-900 flex-shrink-0 z-10" />
                    <div className="flex-1 space-y-0.5">
                      <p className="text-xs font-bold text-white">Order Placed</p>
                      <p className="text-[11px] text-slate-400">Placed order #ORD-2451 mapping payload totals of ₹2,450.</p>
                      <p className="text-[10px] text-slate-500 font-medium">5 days ago</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 relative">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-slate-700 ring-4 ring-slate-900 flex-shrink-0 z-10" />
                    <div className="flex-1 space-y-0.5">
                      <p className="text-xs font-bold text-white">Review Posted</p>
                      <p className="text-[11px] text-slate-400">Left 5-star validation entry across Rose Gold Necklace collections.</p>
                      <p className="text-[10px] text-slate-500 font-medium">1 week ago</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar metadata column */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-white tracking-wide border-b border-slate-800 pb-2">Contact Information</h2>
            
            <div className="space-y-3.5">
              <div className="flex items-start gap-3">
                <FiMail className="w-4 h-4 mt-0.5 text-slate-500" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Email Address</p>
                  <p className="text-xs text-slate-200 mt-0.5">{customerData.email}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <FiPhone className="w-4 h-4 mt-0.5 text-slate-500" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Phone Number</p>
                  <p className="text-xs text-slate-200 mt-0.5">{customerData.phone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}