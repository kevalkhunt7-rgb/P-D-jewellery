import { useState, useEffect } from "react";
import api from "../utils/api";
import {
  FiTrendingUp,
  FiUsers,
  FiShoppingCart,
  FiDollarSign,
  FiPackage,
} from "react-icons/fi";

import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#ef4444", "#8b5cf6"];

export function Analytics() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    newCustomers: 0,
    productsSold: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
    customersGrowth: 0,
    productsGrowth: 0,
  });

  const [revenueData, setRevenueData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data } = await api.get("/admin/dashboard-stats");

      if (data.success) {
        setStats({
          totalRevenue: data.totalRevenue || 0,
          totalOrders: data.totalOrders || 0,
          newCustomers: data.newCustomers || 0,
          productsSold: data.productsSold || 0,

          revenueGrowth: data.revenueGrowth || 0,
          ordersGrowth: data.ordersGrowth || 0,
          customersGrowth: data.customersGrowth || 0,
          productsGrowth: data.productsGrowth || 0,
        });

        setRevenueData(data.revenueData || []);
        setCategoryData(data.categoryRevenue || []);
      }
    } catch (error) {
      console.error("Analytics Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Sales Trend Data
  const salesTrend = revenueData.map((item) => ({
    month: item.month,
    revenue: item.revenue,
  }));

  // Category Revenue Data
  const categoryRevenue = categoryData.map((item) => ({
    name: item.category,
    value: item.revenue,
  }));

  const formatCurrency = (amount) => {
    return `₹${Number(amount).toLocaleString("en-IN")}`;
  };

  const KPI_DATA = [
    {
      title: "Revenue",
      value: formatCurrency(stats.totalRevenue),
      growth: stats.revenueGrowth,
      icon: <FiDollarSign className="w-4 h-4 text-amber-500" />,
    },
    {
      title: "Orders",
      value: stats.totalOrders.toLocaleString(),
      growth: stats.ordersGrowth,
      icon: <FiShoppingCart className="w-4 h-4 text-amber-500" />,
    },
    {
      title: "Customers",
      value: stats.newCustomers.toLocaleString(),
      growth: stats.customersGrowth,
      icon: <FiUsers className="w-4 h-4 text-amber-500" />,
    },
    {
      title: "Products Sold",
      value: stats.productsSold.toLocaleString(),
      growth: stats.productsGrowth,
      icon: <FiPackage className="w-4 h-4 text-amber-500" />,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 rounded-full border-2 border-slate-700 border-t-amber-500 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1 text-slate-200">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Analytics
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Insights and business performance overview
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {KPI_DATA.map((item, index) => (
          <div
            key={index}
            className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                {item.title}
              </p>

              {item.icon}
            </div>

            <div className="mt-3">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {item.value}
              </h2>

              <div className="flex items-center gap-1 mt-2">
                <FiTrendingUp className="w-3 h-3 text-emerald-400" />

                <span className="text-[11px] text-emerald-400 font-semibold">
                  {item.growth > 0 ? "+" : ""}
                  {item.growth}%
                </span>

                <span className="text-[11px] text-slate-500">
                  from last month
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Revenue Trend */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm">

          <div className="mb-5">
            <h2 className="text-sm font-bold text-white tracking-wide">
              Revenue Trend
            </h2>

            <p className="text-[11px] text-slate-400 mt-1">
              Monthly revenue performance
            </p>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={salesTrend}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
                vertical={false}
              />

              <XAxis
                dataKey="month"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
              />

              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />

              <Tooltip
                formatter={(value) => [formatCurrency(value), "Revenue"]}
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "12px",
                }}
              />

              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{
                  fill: "#f59e0b",
                  r: 4,
                }}
                activeDot={{
                  r: 6,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Revenue */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm">

          <div className="mb-5">
            <h2 className="text-sm font-bold text-white tracking-wide">
              Category Revenue
            </h2>

            <p className="text-[11px] text-slate-400 mt-1">
              Revenue contribution by category
            </p>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>

              <Pie
                data={categoryRevenue}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
                style={{
                  fontSize: "11px",
                  fill: "#cbd5e1",
                  fontWeight: 600,
                }}
              >
                {categoryRevenue.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                    stroke="#0f172a"
                    strokeWidth={2}
                  />
                ))}
              </Pie>

              <Tooltip
                formatter={(value) => [formatCurrency(value), "Revenue"]}
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}