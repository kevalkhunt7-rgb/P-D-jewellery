import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import { FiSearch, FiEye, FiShoppingBag } from "react-icons/fi";

export function Customers() {
  const [customersData, setCustomersData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data } = await api.get("/admin/customers");
        if (data.success) {
          setCustomersData(data.customers);
        }
      } catch (error) {
        console.error("Failed to fetch customers", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  // Computed live search filter
  const filteredCustomers = customersData.filter((customer) =>
    customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone?.includes(searchQuery)
  );

  // Helper to generate text initials for avatar fallback frames
  const getInitials = (name = "") => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Analytics Summary Stats Grid Dashboard
  const stats = [
    { label: "Total Customers", value: customersData.length.toLocaleString() },
    { 
      label: "New This Month", 
      value: customersData.filter(c => {
        const joinDate = new Date(c.joinDate);
        const now = new Date();
        return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
      }).length.toLocaleString()
    },
    { 
      label: "Avg. Order Value", 
      value: `₹${Math.round(customersData.reduce((acc, c) => acc + (c.totalSpent || 0), 0) / 
             (customersData.reduce((acc, c) => acc + (c.orders || 0), 0) || 1)).toLocaleString()}` 
    },
  ];

  return (
    <div className="space-y-6 text-slate-200 p-1">
      {/* Top Main Heading */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Customers</h1>
        <p className="text-xs text-slate-400 mt-0.5">Manage your customer relationships</p>
      </div>

      {/* Analytics Summary Stats Grid Dashboard */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm">
            <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">{stat.label}</p>
            <p className="text-2xl font-bold text-white mt-2 tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Primary Customer Workspace Table Box */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Table Search Filtering Bar Block */}
        <div className="p-5 border-b border-slate-800/60">
          <div className="relative max-w-md w-full">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search customers by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Data Stream Layout Viewport */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] tracking-wider text-slate-400 uppercase font-semibold bg-slate-950/20">
                <th className="py-3 px-5 font-medium">Customer</th>
                <th className="py-3 px-4 font-medium">Contact</th>
                <th className="py-3 px-4 font-medium">Orders</th>
                <th className="py-3 px-4 font-medium">Total Spent</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Join Date</th>
                <th className="py-3 px-5 text-center font-medium w-48">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500 font-medium">
                    Loading customer data...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500 font-medium">
                    No customers found matching the filter query.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-slate-800/10 transition-colors group">
                    
                    {/* User Profile Avatar Block Column */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-slate-800 border border-slate-700/60 flex items-center justify-center flex-shrink-0">
                          <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(customer.name || '')}`}
                            alt={customer.name}
                            className="w-full h-full object-cover z-10 relative"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                          <span className="absolute text-[10px] font-bold text-slate-400 tracking-tight">
                            {getInitials(customer.name)}
                          </span>
                        </div>
                        <span className="font-semibold text-slate-200">{customer.name}</span>
                      </div>
                    </td>

                    {/* Contact Metadata Block */}
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="text-slate-300 font-medium">{customer.email}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 font-mono">{customer.phone || '—'}</div>
                      </div>
                    </td>

                    {/* Numeric Order Calculations */}
                    <td className="py-3.5 px-4 text-slate-300 font-medium">
                      {customer.orders || 0} orders
                    </td>

                    {/* Currency Calculation Block */}
                    <td className="py-3.5 px-4 font-semibold text-slate-200">
                      ₹{(customer.totalSpent || 0).toLocaleString()}
                    </td>

                    {/* Customized Status Badges */}
                    <td className="py-3.5 px-4">
                      {customer.status?.toLowerCase() === "vip" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/10">
                          VIP
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Active
                        </span>
                      )}
                    </td>

                    {/* Calendar Datestamp Row Column */}
                    <td className="py-3.5 px-4 text-slate-400 font-medium">
                      {customer.joinDate ? new Date(customer.joinDate).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : '—'}
                    </td>

                    {/* New Actions Tab Layout Implementation */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center justify-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <Link 
                          to={`/customers/${customer._id}`}
                          title="View Profile"
                          className="p-2 text-slate-400 hover:text-white bg-slate-950 border border-slate-800/60 hover:border-slate-700 rounded-lg transition-all"
                        >
                          <FiEye className="w-3.5 h-3.5" />
                        </Link>

                        <Link 
                          to={`/orders?customer=${customer._id}`}
                          title="View Orders"
                          className="p-2 text-slate-400 hover:text-amber-400 bg-slate-950 border border-slate-800/60 hover:border-amber-500/30 rounded-lg transition-all"
                        >
                          <FiShoppingBag className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}