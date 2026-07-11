import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  FiSearch,
  FiFilter,
  FiEye,
  FiDownload,
  FiXCircle,
  FiChevronDown,
  FiCalendar,
  FiX,
  FiTrash2,
} from "react-icons/fi";
import api from "../utils/api";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { DeleteModal } from "../components/DeleteModal";
import { IoAirplane } from "react-icons/io5";

const getStatusBadge = (status) => {
  const configs = {
    DELIVERED: { className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", label: "Delivered" },
    SHIPPED: { className: "bg-blue-500/10 text-blue-400 border-blue-500/20", label: "Shipped" },
    PACKED: { className: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20", label: "Packed" },
    CONFIRMED: { className: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20", label: "Confirmed" },
    PENDING: { className: "bg-slate-500/10 text-slate-400 border-slate-500/20", label: "Pending" },
    CANCELLED: { className: "bg-rose-500/10 text-rose-400 border-rose-500/20", label: "Cancelled" },
    RETURNED: { className: "bg-amber-500/10 text-amber-400 border-amber-500/20", label: "Returned" },
    FAILED: { className: "bg-red-500/10 text-red-400 border-red-500/20", label: "Failed" },
  };
  const config = configs[status?.toUpperCase()] || configs.PENDING;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${config.className}`}>
      {config.label}
    </span>
  );
};

const getPaymentBadge = (status) => {
  const configs = {
    paid: { className: "bg-emerald-500 text-slate-950 font-bold", label: "Paid" },
    pending: { className: "bg-slate-800 text-slate-300 border border-slate-700", label: "Pending" },
    refunded: { className: "bg-transparent text-slate-400 border border-slate-800", label: "Refunded" },
  };
  const config = configs[status?.toLowerCase()] || configs.pending;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium tracking-wide ${config.className}`}>
      {config.label}
    </span>
  );
};

const STATUS_OPTIONS = ["PENDING", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED"];

export function Orders() {
  const [searchParams] = useSearchParams();
  const customerId = searchParams.get("customer");

  const [ordersData, setOrdersData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [cancelModal, setCancelModal] = useState({ isOpen: false, orderId: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, orderId: null });

  // Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFormData] = useState({
    paymentStatus: "all",
    orderStatus: "all",
    startDate: "",
    endDate: ""
  });

  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/orders/all-orders");
      if (data.success) {
        // Normalize status configurations to uppercase on load to ensure matching integrity
        const normalizedOrders = data.orders.map(order => ({
          ...order,
          orderStatus: order.orderStatus ? order.orderStatus.toUpperCase() : "PENDING"
        }));
        setOrdersData(normalizedOrders);
      }
    } catch (error) {
      console.error("Failed to fetch orders", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    const loadToast = toast.loading("Updating status...");
    try {
      const { data } = await api.put(`/orders/update-status/${id}`, { status: status.toUpperCase() });
      if (data.success) {
        toast.success("Order status updated", { id: loadToast });
        setActiveDropdownId(null);
        fetchOrders();
      }
    } catch (error) {
      toast.error("Failed to update status", { id: loadToast });
    }
  };

  const handleCancelOrder = async () => {
    const { orderId } = cancelModal;
    const loadToast = toast.loading("Cancelling order...");
    try {
      const { data } = await api.put(`/orders/cancel/${orderId}`);
      if (data.success) {
        toast.success("Order cancelled successfully", { id: loadToast });
        setCancelModal({ isOpen: false, orderId: null });
        fetchOrders();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel order", { id: loadToast });
    }
  };

  const handleDeleteOrder = async () => {
    const { orderId } = deleteModal;
    const loadToast = toast.loading("Deleting order record...");
    try {
      const { data } = await api.delete(`/orders/delete/${orderId}`);
      if (data.success) {
        toast.success("Order record deleted successfully", { id: loadToast });
        setDeleteModal({ isOpen: false, orderId: null });
        fetchOrders();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete order record", { id: loadToast });
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Order ID", "Customer", "Amount (INR)", "Paid In", "Payment", "Status", "Date"];
    const tableRows = [];

    filteredOrders.forEach(order => {
      const isForeign = order.paidCurrency === 'USD' || order.displayCurrency === 'USD';
      // Amount is always in INR for admin
      const formattedAmount = `₹${order.totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      const paidIn = isForeign ? `USD ($${order.paidAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})` : 'INR';

      const orderData = [
        order._id.slice(-8).toUpperCase() + (isForeign ? " ✈️" : ""),
        order.user?.name || "Guest",
        formattedAmount,
        paidIn,
        order.paymentStatus || (order.isPaid ? "Paid" : "Pending"),
        (order.orderStatus || "PENDING").toUpperCase(),
        new Date(order.createdAt).toLocaleDateString()
      ];
      tableRows.push(orderData);
    });

    doc.autoTable(tableColumn, tableRows, { startY: 20 });
    doc.text("Filtered Orders Report (All amounts in INR)", 14, 15);
    doc.save(`orders_report_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success("PDF Report Exported");
  };

  const getFilteredOrders = () => {
    let filtered = ordersData;

    // Customer Filter (from query param)
    if (customerId) {
      filtered = filtered.filter(o => o.user?._id === customerId);
    }

    // Tab Filter
    if (activeTab !== "all") {
      filtered = filtered.filter((order) => order.orderStatus?.toUpperCase() === activeTab);
    }

    // Search Filter
    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Advanced Filters
    if (filters.paymentStatus !== "all") {
      filtered = filtered.filter(o => {
        const status = o.paymentStatus || (o.isPaid ? "paid" : "pending");
        return status.toLowerCase() === filters.paymentStatus;
      });
    }

    if (filters.orderStatus !== "all") {
      filtered = filtered.filter(o => o.orderStatus?.toUpperCase() === filters.orderStatus);
    }

    if (filters.startDate) {
      filtered = filtered.filter(o => new Date(o.createdAt) >= new Date(filters.startDate));
    }

    if (filters.endDate) {
      filtered = filtered.filter(o => new Date(o.createdAt) <= new Date(filters.endDate));
    }

    return filtered;
  };

  const filteredOrders = getFilteredOrders();

  const orderCounts = {
    all: ordersData.length,
    PENDING: ordersData.filter((o) => o.orderStatus?.toUpperCase() === "PENDING").length,
    CONFIRMED: ordersData.filter((o) => o.orderStatus?.toUpperCase() === "CONFIRMED").length,
    PACKED: ordersData.filter((o) => o.orderStatus?.toUpperCase() === "PACKED").length,
    SHIPPED: ordersData.filter((o) => o.orderStatus?.toUpperCase() === "SHIPPED").length,
    DELIVERED: ordersData.filter((o) => o.orderStatus?.toUpperCase() === "DELIVERED").length,
  };

  const tabsConfig = [
    { value: "all", label: `All (${orderCounts.all})` },
    { value: "PENDING", label: `Pending (${orderCounts.PENDING})` },
    { value: "CONFIRMED", label: `Confirmed (${orderCounts.CONFIRMED})` },
    { value: "PACKED", label: `Packed (${orderCounts.PACKED})` },
    { value: "SHIPPED", label: `Shipped (${orderCounts.SHIPPED})` },
    { value: "DELIVERED", label: `Delivered (${orderCounts.DELIVERED})` },
  ];

  // Shared action cluster (view / cancel / status dropdown) — used in both
  // the desktop table row and the mobile/tablet card layout.
  const OrderActions = ({ order, align = "center" }) => (
    <div className={`flex items-center gap-1.5 relative ${align === "right" ? "justify-end" : "justify-center"}`}>
      <Link
        to={`/orders/${order._id}`}
        title="View Details"
        className="p-2 text-slate-400 hover:text-white bg-slate-950 border border-slate-800/60 hover:border-slate-700 rounded-lg transition-all"
      >
        <FiEye className="w-3.5 h-3.5" />
      </Link>

      <button
        title="Cancel Order"
        onClick={() => setCancelModal({ isOpen: true, orderId: order._id })}
        disabled={order.orderStatus === "CANCELLED" || order.orderStatus === "DELIVERED"}
        className="p-2 text-slate-400 hover:text-rose-400 bg-slate-950 border border-slate-800/60 hover:border-rose-500/30 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <FiXCircle className="w-3.5 h-3.5" />
      </button>

      <button
        title="Delete Order Record"
        onClick={() => setDeleteModal({ isOpen: true, orderId: order._id })}
        className="p-2 text-slate-400 hover:text-rose-600 bg-slate-950 border border-slate-800/60 hover:border-rose-500/30 rounded-lg transition-all"
      >
        <FiTrash2 className="w-3.5 h-3.5" />
      </button>

      <span className="w-px h-4 bg-slate-800 mx-0.5" />

      <div className="relative">
        <button
          onClick={() => setActiveDropdownId(activeDropdownId === order._id ? null : order._id)}
          className="text-[11px] font-medium text-amber-500/90 hover:text-amber-400 px-2 py-1 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10 hover:border-amber-500/20 rounded-md transition-all flex items-center gap-1"
        >
          Status <FiChevronDown className="w-3 h-3" />
        </button>

        {activeDropdownId === order._id && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setActiveDropdownId(null)} />
            <div className="absolute right-0 top-full mt-1 w-32 bg-slate-950 border border-slate-800 rounded-lg shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-1">
              {STATUS_OPTIONS.map((statusOption) => (
                <button
                  key={statusOption}
                  onClick={() => handleUpdateStatus(order._id, statusOption)}
                  className={`w-full px-3 py-1.5 text-left text-[10px] font-semibold block capitalize transition-colors ${
                    order.orderStatus === statusOption
                      ? "text-amber-400 bg-amber-500/5"
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  {statusOption}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 text-slate-200 p-1">
      {/* Cancel Confirmation Modal */}
      <DeleteModal
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal({ isOpen: false, orderId: null })}
        onConfirm={handleCancelOrder}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This action will notify the customer."
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, orderId: null })}
        onConfirm={handleDeleteOrder}
        title="Delete Order Record"
        message="Are you sure you want to permanently delete this order record? This action cannot be undone."
      />

      {/* Title block */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Orders</h1>
        <p className="text-xs text-slate-400 mt-0.5">Manage and track customer orders</p>
      </div>

      {/* Tabs Layout Row Components */}
      <div className="border-b border-slate-800 flex items-center gap-1 overflow-x-auto scroller-hide no-scrollbar">
        {tabsConfig.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-3 sm:px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-all border-b-2 -mb-px shrink-0 ${
              activeTab === tab.value
                ? "border-amber-500 text-amber-500 bg-amber-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Container Block Wrapper */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl shadow-sm">

        {/* Filtering Options Control Panel */}
        <div className="p-4 sm:p-5 border-b border-slate-800/60">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
              {/* Search Input Area */}
              <div className="relative flex-1">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by order ID, customer name, or email..."
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-amber-500/50 transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Utility Tool Buttons Group */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium border transition-all rounded-xl w-full sm:w-auto ${
                    showFilters ? "bg-amber-500 text-slate-950 border-amber-500" : "bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800/50"
                  }`}
                >
                  <FiFilter className="w-3.5 h-3.5" />
                  Filters
                </button>

                <button
                  onClick={exportPDF}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-slate-300 bg-slate-950 border border-slate-800 hover:bg-slate-800/50 hover:text-white transition-all rounded-xl w-full sm:w-auto"
                >
                  <FiDownload className="w-3.5 h-3.5" />
                  Export
                </button>
              </div>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-950/50 border border-slate-800/50 rounded-xl animate-in fade-in slide-in-from-top-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Payment Status</label>
                  <select
                    value={filters.paymentStatus}
                    onChange={(e) => setFormData({...filters, paymentStatus: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2 outline-none focus:border-amber-500/50"
                  >
                    <option value="all">All Payments</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Order Status</label>
                  <select
                    value={filters.orderStatus}
                    onChange={(e) => setFormData({...filters, orderStatus: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2 outline-none focus:border-amber-500/50"
                  >
                    <option value="all">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PACKED">Packed</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Start Date</label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFormData({...filters, startDate: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2 outline-none focus:border-amber-500/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">End Date</label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFormData({...filters, endDate: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2 outline-none focus:border-amber-500/50"
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                  <button
                    onClick={() => setFormData({ paymentStatus: "all", orderStatus: "all", startDate: "", endDate: "" })}
                    className="text-[10px] font-bold text-rose-500 hover:text-rose-400 uppercase tracking-widest flex items-center gap-1"
                  >
                    <FiX className="w-3 h-3" /> Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Empty state (shared) */}
        {filteredOrders.length === 0 && (
          <div className="text-center py-12 text-slate-500 font-medium text-sm">
            No matching orders available.
          </div>
        )}

        {/* Mobile & tablet: card list — an 8-column table has no honest way to
            fit below a wide desktop, so this avoids clipped dropdowns and
            page-level horizontal scrolling. */}
        {filteredOrders.length > 0 && (
          <div className="xl:hidden divide-y divide-slate-800/50">
            {filteredOrders.map((order) => (
              <div key={order._id} className="p-4 sm:p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 font-mono text-amber-500 font-medium text-xs tracking-tight">
                      <span>{order._id.slice(-8).toUpperCase()}</span>
                      {(order.paymentMethod === 'PAYPAL' || order.displayCurrency === 'USD') && (
                        <span title="Foreign Order" className="text-sky-400">
                          <IoAirplane className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                    <div className="mt-1 font-semibold text-slate-200 text-sm truncate">{order.user?.name || 'Guest'}</div>
                    <div className="text-[11px] text-slate-500 truncate">{order.user?.email || 'No email'}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    {getStatusBadge(order.orderStatus)}
                    {getPaymentBadge(order.paymentStatus || (order.isPaid ? "paid" : "pending"))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 flex-wrap gap-y-2">
                  <span>{order.orderItems?.length || 0} items</span>
                  <span className="flex items-center gap-1">
                    <FiCalendar className="w-3 h-3" />
                    {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                  <div className="w-full sm:w-auto text-right sm:text-left">
                    <span className="font-semibold text-slate-200">
                      ₹{order.totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    {order.paidCurrency === 'USD' && (
                      <span className="block text-[9px] text-sky-400 mt-0.5">
                        Paid: ${order.paidAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-1 border-t border-slate-800/50">
                  <div className="pt-3">
                    <OrderActions order={order} align="right" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Desktop (xl+): full data table */}
        {filteredOrders.length > 0 && (
          <div className="hidden xl:block overflow-visible">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] tracking-wider text-slate-400 uppercase font-semibold bg-slate-950/20">
                  <th className="py-3 px-5 font-medium">Order ID</th>
                  <th className="py-3 px-4 font-medium">Customer</th>
                  <th className="py-3 px-4 font-medium">Products</th>
                  <th className="py-3 px-4 font-medium">Amount</th>
                  <th className="py-3 px-4 font-medium">Payment</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Date</th>
                  <th className="py-3 px-5 text-center font-medium w-56">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-xs">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-800/10 transition-colors group">
                    <td className="py-3.5 px-5 font-mono text-amber-500 font-medium tracking-tight">
                      <div className="flex items-center gap-1.5">
                        <span>{order._id.slice(-8).toUpperCase()}</span>
                        {(order.paymentMethod === 'PAYPAL' || order.displayCurrency === 'USD') && (
                          <span title="Foreign Order" className="text-sky-400">
                            <IoAirplane className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="font-semibold text-slate-200">{order.user?.name || 'Guest'}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{order.user?.email || 'No email'}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{order.orderItems?.length || 0} items</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-200">
                      <div className="flex flex-col">
                        <span>
                          ₹{order.totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-[10px] text-slate-500 font-normal">
                          INR
                        </span>
                        {order.paidCurrency === 'USD' && (
                          <span className="text-[9px] text-sky-400 font-normal mt-0.5">
                            Paid: ${order.paidAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">{getPaymentBadge(order.paymentStatus || (order.isPaid ? "paid" : "pending"))}</td>
                    <td className="py-3.5 px-4">{getStatusBadge(order.orderStatus)}</td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>

                    {/* Redesigned Row Action Suite */}
                    <td className="py-3.5 px-5">
                      <div className="opacity-80 group-hover:opacity-100 transition-opacity">
                        <OrderActions order={order} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}