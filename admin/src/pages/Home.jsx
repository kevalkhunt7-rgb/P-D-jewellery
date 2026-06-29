import { useState, useEffect } from "react";
import api from "../utils/api";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiShoppingCart,
  FiUsers,
  FiPackage,
  FiAlertTriangle,

} from "react-icons/fi";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { IoAirplane } from "react-icons/io5";

const getStatusStyles = (status) => {
  const styles = {
    DELIVERED: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    SHIPPED: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    PACKED: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    CONFIRMED: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    PENDING: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    CANCELLED: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  };
  return styles[status?.toUpperCase()] || "bg-slate-500/10 text-slate-400 border-slate-500/20";
};

export default function Home() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    newCustomers: 0,
    productsSold: 0
  });
  const [revenueData, setRevenueData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [recentCustomers, setRecentCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data } = await api.get("/admin/dashboard-stats");
        if (data.success) {
          setStats({
            totalRevenue: data.totalRevenue,
            totalOrders: data.totalOrders,
            newCustomers: data.newCustomers,
            productsSold: data.productsSold
          });
          setRevenueData(data.revenueData);
          setCategoryData(data.categoryRevenue);
          setRecentOrders(data.recentOrders);
          setTopProducts(data.topProducts);
          setLowStockItems(data.lowStockItems);
          setRecentCustomers(data.recentCustomers);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }
  const getProductImage = (product) => {
    return (
      product?.image ||
      product?.images?.[0]?.url ||
      product?.images?.[0] ||
      "/placeholder.png"
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 text-slate-200">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard</h1>
        <p className="text-xs text-slate-400 mt-0.5">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-medium text-slate-400 tracking-wide">Total Revenue</span>
            <span className="w-4 h-4 text-amber-500"> ₹</span> 
          </div>
          <div className="text-2xl font-bold tracking-tight text-white">₹{stats.totalRevenue.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1.5">
            <FiTrendingUp className="w-3. h-3 text-emerald-500" />
            <span className="text-emerald-500 font-semibold">+12.5%</span> from last month
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-medium text-slate-400 tracking-wide">Total Orders</span>
            <FiShoppingCart className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-white">{stats.totalOrders.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1.5">
            <FiTrendingUp className="w-3 h-3 text-emerald-500" />
            <span className="text-emerald-500 font-semibold">+8.2%</span> from last month
          </div>
        </div>

        {/* New Customers */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-medium text-slate-400 tracking-wide">New Customers</span>
            <FiUsers className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-white">{stats.newCustomers.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1.5">
            <FiTrendingUp className="w-3 h-3 text-emerald-500" />
            <span className="text-emerald-500 font-semibold">+15.3%</span> from last month
          </div>
        </div>

        {/* Products Sold */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-medium text-slate-400 tracking-wide">Products Sold</span>
            <FiPackage className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-white">{stats.productsSold.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1.5">
            <FiTrendingDown className="w-3 h-3 text-rose-500" />
            <span className="text-rose-500 font-semibold">-2.4%</span> from last month
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Revenue Analytics */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 lg:col-span-4">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-white">Revenue Analytics</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Monthly revenue trends over the last 6 months</p>
          </div>
          <div className="w-full">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={revenueData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#f59e0b', fontSize: '12px' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by Category */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 lg:col-span-3">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-white">Sales by Category</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Performance distribution across lines</p>
          </div>
          <div className="w-full">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={categoryData} margin={{ left: -20, right: 5, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="category" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  itemStyle={{ color: '#f59e0b', fontSize: '12px' }}
                />
                <Bar dataKey="revenue" fill="#f59e0b" opacity={0.85} radius={[6, 6, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Orders and Top Products Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 overflow-hidden">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-white">Recent Orders</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Incoming purchases ledger</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] tracking-wider text-slate-400 uppercase font-semibold">
                  <th className="pb-3 pl-1 font-medium">Order</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 text-right pr-1 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-3.5 pl-1 font-semibold text-amber-500/90">
                      <div className="flex items-center gap-1.5">
                        <span>{order._id.slice(-6).toUpperCase()}</span>
                        {(order.paymentMethod === 'PAYPAL' || order.displayCurrency === 'USD') && (
                          <span title="Foreign Order" className="text-sky-400">
                            <IoAirplane className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5">
                      <div className="font-medium text-slate-200">{order.user?.name || 'Guest'}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 max-w-[180px] truncate">
                        {order.orderItems.map(item => item.name).join(", ")}
                      </div>
                    </td>
                    <td className="py-3.5 font-medium text-slate-300">
                      <div className="flex flex-col">
                        <span>
                          ₹{order.totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-[10px] text-slate-500 font-normal">
                          INR
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 text-right pr-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide border uppercase ${getStatusStyles(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-white">Top Selling Products</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Best absolute performing items</p>
          </div>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center gap-3.5 p-1 hover:bg-slate-800/10 rounded-xl transition-all">
                <img
                  src={getProductImage(product)}
                  alt={product.name}
                  className="w-11 h-11 rounded-xl object-cover border border-slate-800 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-xs text-slate-200 truncate">{product.name}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{product.sold} sales completed</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-xs text-slate-200">₹{product.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low Stock and Recent Customers Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Low Stock Alerts */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <FiAlertTriangle className="w-4 h-4 text-amber-500" />
              Low Stock Alerts
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Critical inventory boundaries crossed</p>
          </div>
          <div className="space-y-2.5">
            {lowStockItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/10"
              >
                <div className="min-w-0 flex items-center gap-3">
                   <img
                    src={getProductImage(item)}
                    alt={item.name}
                    className="w-8 h-8 rounded-lg object-cover border border-slate-800 flex-shrink-0"
                  />
                  <div>
                    <p className="font-medium text-xs text-slate-200 truncate">{item.name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-mono">Price: ₹{item.price}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400 whitespace-nowrap">
                  {item.stock} units remaining
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Customers */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-white">Recent Customers</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Newly logged client metrics</p>
          </div>
          <div className="space-y-4">
            {recentCustomers.map((customer, index) => (
              <div key={index} className="flex items-center gap-3.5 p-1">
                {/* Fallback avatar block */}
                <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
                  <img
                    src={customer.avatar?.url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(customer.name || '')}`}
                    alt={customer.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(customer.name || '')}`;
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-xs text-slate-200 truncate">{customer.name}</p>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">{customer.email}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-xs text-slate-200">₹{customer.spent.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{customer.orders} orders processed</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}